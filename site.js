console.log("Waiterly has begun 🚀");

const http = require("http");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");
const crypto = require("crypto");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "waiterly_db";
let db;

function isAuth(req) {
  const cookieHeader = req.headers.cookie;
  return (
    cookieHeader &&
    (cookieHeader.includes("auth=admin_token") ||
      cookieHeader.includes("auth=staff_token"))
  );
}

function isAdmin(req) {
  const cookieHeader = req.headers.cookie;
  return cookieHeader && cookieHeader.includes("auth=admin_token");
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
  });
}

const server = http.createServer(async (req, res) => {
  console.log("Browser is asking for: ", req.url);

  const publicPages = [
    "/",
    "/real.html",
    "/menu_script.html",
    "/cart.html",
    "/requests.html",
    "/ingredients.html",
    "/login.html",
    "/mood.html",
    "/staff.html",
  ];

  if (
    publicPages.includes(req.url.split("?")[0]) ||
    req.url.startsWith("/session.html")
  ) {
    const cleanUrl =
      req.url.split("?")[0] === "/" ? "/real.html" : req.url.split("?")[0];
    fs.readFile(path.join(__dirname, cleanUrl), (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  } else if (req.url === "/style.css" || req.url.endsWith(".js")) {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        let contentType = req.url.endsWith(".css")
          ? "text/css"
          : "application/javascript";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      } else {
        res.writeHead(404);
        res.end();
      }
    });
  } else if (req.url === "/admin" || req.url === "/admin.html") {
    if (!isAdmin(req)) {
      res.writeHead(302, { Location: "/login.html" });
      res.end();
      return;
    }
    fs.readFile(path.join(__dirname, "admin.html"), (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  } else if (req.url === "/api/login" && req.method === "POST") {
    const creds = await getBody(req);
    const user = await db.collection("users").findOne({
      $or: [{ username: creds.username }, { email: creds.username }],
      password: creds.password,
    });

    if (user) {
      const role =
        user.rol && user.rol.toLowerCase().includes("admin")
          ? "admin"
          : "staff";
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": `auth=${role}_token; HttpOnly; Path=/;`,
      });
      res.end(JSON.stringify({ success: true, role: role }));
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false }));
    }
  } else if (req.url === "/api/logout" && req.method === "POST") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie":
        "auth=; HttpOnly; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    });
    res.end(JSON.stringify({ success: true }));
  } else if (req.url === "/api/orders" && req.method === "POST") {
    const data = await getBody(req);
    const activeSession = await db.collection("sessions").findOne({
      masaNo: data.masaNo.toString(),
      durum: "aktif",
    });

    if (!activeSession || activeSession.hashcode !== data.sessionHash) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          success: false,
          error: "Yetkisiz işlem veya geçersiz oturum.",
        }),
      );
    }

    const siparisVerisi = data.order ? data.order : data;
    const eklenecekTutar = Number(siparisVerisi.toplamTutar) || 0;
    delete siparisVerisi.sessionHash;

    const newOrder = {
      ...siparisVerisi,
      masaNo: data.masaNo.toString(),
      durum: "hazırlanıyor",
      tarih: new Date(),
      zaman: new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const result = await db.collection("order_history").insertOne(newOrder);
    await db.collection("sessions").updateOne(
      { _id: activeSession._id },
      {
        $push: { siparisler: newOrder },
        $inc: { genelToplam: eklenecekTutar },
      },
    );

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, orderId: result.insertedId }));
  } else if (req.url === "/api/session" && req.method === "POST") {
    const data = await getBody(req);
    const masaNoStr = data.masaNo.toString();
    const qrPassword = data.password || "";

    const tableRecord = await db
      .collection("tables")
      .findOne({ masaNo: masaNoStr });
    if (!tableRecord) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, error: "Böyle bir masa bulunamadı!" }),
      );
    }

    if (tableRecord.password !== qrPassword) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          success: false,
          error: "Hatalı veya süresi dolmuş QR kodu!",
        }),
      );
    }

    const existingSession = await db
      .collection("sessions")
      .findOne({ masaNo: masaNoStr, durum: "aktif" });
    if (existingSession) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: true, hashcode: existingSession.hashcode }),
      );
    }

    const timeNow = Date.now().toString();
    const hashcode = crypto
      .createHash("sha256")
      .update(timeNow + Math.random().toString())
      .digest("hex");

    const result = await db.collection("sessions").insertOne({
      masaNo: masaNoStr,
      baslangicZamani: new Date(),
      durum: "aktif",
      hashcode: hashcode,
      siparisler: [],
      genelToplam: 0,
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, hashcode: hashcode }));
  } else if (
    req.url.startsWith("/api/session/current") &&
    req.method === "GET"
  ) {
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const hash = urlParams.get("hash");

    const activeSession = await db
      .collection("sessions")
      .findOne({ hashcode: hash, durum: "aktif" });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(activeSession || { siparisler: [], genelToplam: 0 }),
    );
  } else if (req.url === "/api/session/close" && req.method === "POST") {
    const data = await getBody(req);
    await db.collection("sessions").updateOne(
      { hashcode: data.hash },
      {
        $set: {
          durum: "kapalı",
          bitisZamani: new Date(),
          odemeYontemi: data.odemeYontemi,
        },
      },
    );
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
  }

  // --- DYNAMIC API ARCHITECTURE ---
  else if (req.url.startsWith("/api/")) {
    const parts = req.url.split("/");
    const collectionName = parts[2];
    const itemId = parts[3] ? parseInt(parts[3]) : null;

    const validCollectionsAPI = [
      "menu",
      "users",
      "requests",
      "moods",
      "ingredients",
      "tables",
    ];

    if (validCollectionsAPI.includes(collectionName)) {
      const col = db.collection(collectionName);

      if (req.method === "GET") {
        const data = await col.find({}).toArray();
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(JSON.stringify(data));
      } else if (req.method === "POST") {
        const newItem = await getBody(req);
        const maxItem = await col.find().sort({ id: -1 }).limit(1).toArray();
        newItem.id = maxItem.length > 0 ? maxItem[0].id + 1 : 1;

        await col.insertOne(newItem);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, item: newItem }));
      } else if (req.method === "PUT" && itemId) {
        const updateData = await getBody(req);
        delete updateData._id;
        await col.updateOne({ id: itemId }, { $set: updateData });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } else if (req.method === "DELETE" && itemId) {
        await col.deleteOne({ id: itemId });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Endpoint not found" }));
    }
  }

  // --- IMAGES ---
  else if (req.url.startsWith("/images/")) {
    const fileName = req.url.replace("/images/", "");
    fs.readFile(path.join(__dirname, "images", fileName), (err, data) => {
      if (!err) {
        const ext = path.extname(fileName).toLowerCase();
        let cType =
          ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".svg"
              ? "image/svg+xml"
              : "image/png";
        res.writeHead(200, { "Content-Type": cType });
        res.end(data);
      } else {
        res.writeHead(404);
        res.end();
      }
    });
  } // --- JAVASCRIPT DOSYALARI---
  else if (req.url.split("?")[0].endsWith(".js")) {
    // URL'deki "?v=1" gibi kısımları temizle
    const cleanUrl = req.url.split("?")[0];

    fs.readFile(path.join(__dirname, cleanUrl), (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("JS Dosyasi Bulunamadi: " + cleanUrl);
      } else {
        res.writeHead(200, {
          "Content-Type": "application/javascript; charset=utf-8",
        });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end("404 Not Found");
  }
});

async function startApp() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ MongoDB'ye başarıyla bağlanıldı!");

    // Koleksiyonları oluştur (Eğer yoksa)
    const orderCols = await db
      .listCollections({ name: "order_history" })
      .toArray();
    if (orderCols.length === 0) {
      await db.createCollection("order_history", {
        timeseries: {
          timeField: "tarih",
          metaField: "masaNo",
          granularity: "minutes",
        },
      });
    }

    const sessCols = await db.listCollections({ name: "sessions" }).toArray();
    if (
      sessCols.length > 0 &&
      sessCols[0].options &&
      sessCols[0].options.timeseries
    ) {
      await db.collection("sessions").drop();
      await db.createCollection("sessions");
    } else if (sessCols.length === 0) {
      await db.createCollection("sessions");
    }

    // 1. ADMİN VE ÇALIŞANLAR
    if ((await db.collection("users").countDocuments()) === 0) {
      await db.collection("users").insertOne({
        id: 1,
        ad: "Sistem Yöneticisi",
        username: "admin",
        password: "1234",
        rol: "Admin",
        durum: "active",
        email: "admin@waiterly.com",
      });
    }

    // 2. HAZIR İSTEKLER
    if ((await db.collection("requests").countDocuments()) === 0) {
      await db.collection("requests").insertMany([
        { id: 1, istek: "Masayı Temizler Misiniz?" },
        { id: 2, istek: "Hesabı Alabilir Miyiz?" },
        { id: 3, istek: "Peçete İstiyoruz" },
        { id: 4, istek: "Özel İstek..." },
      ]);
    }

    // 3. RUH HALLERİ
    if ((await db.collection("moods").countDocuments()) === 0) {
      await db.collection("moods").insertMany([
        {
          id: 1,
          isim: "Enerjik Hissetmek",
          emoji: "⚡",
          etiketler: ["enerjik", "kahve"],
        },
        { id: 2, isim: "Tatlı Krizi", emoji: "🍫", etiketler: ["tatli"] },
        {
          id: 3,
          isim: "Ferahlamak İstiyorum",
          emoji: "🧊",
          etiketler: ["soguk", "ferah"],
        },
        {
          id: 4,
          isim: "Çok Açım",
          emoji: "🍔",
          etiketler: ["doyurucu", "yemek"],
        },
      ]);
    }

    // 4. MASALAR (QR KODU ŞİFRELERİ)
    if ((await db.collection("tables").countDocuments()) === 0) {
      await db.collection("tables").insertMany([
        { masaNo: "1", password: "abc" },
        { masaNo: "12", password: "1234" },
        { masaNo: "15", password: "xyz" },
      ]);
      console.log("✅ Masalar Atlas'a yüklendi.");
    }

    // 5. İSTENMEYEN MALZEMELER (ALERJEN / DİYET)
    if ((await db.collection("ingredients").countDocuments()) === 0) {
      await db.collection("ingredients").insertMany([
        { id: 1, isim: "Gluten", emoji: "🌾", etiketler: ["gluten", "un"] },
        {
          id: 2,
          isim: "Süt/Laktoz",
          emoji: "🥛",
          etiketler: ["sut", "laktoz", "krema", "tereyağı"],
        },
        { id: 3, isim: "Yumurta", emoji: "🥚", etiketler: ["yumurta"] },
        {
          id: 4,
          isim: "Kuruyemiş",
          emoji: "🥜",
          etiketler: ["ceviz", "fıstık", "badem"],
        },
      ]);
      console.log("✅ Kısıtlamalar Atlas'a yüklendi.");
    }

    // 6. ORİJİNAL MENÜ VE İÇERİKLERİ
    await db.collection("menu").deleteMany({}); // Delete anything currently there
    await db.collection("menu").insertMany([
      {
        id: 1,
        isim: "Latte",
        fiyat: 130,
        puan: 4.8,
        icerik: ["Espresso", "Süt", "Süt Köpüğü"],
        alerjenler: ["Süt/Laktoz"],
        resim: "/images/latte.png",
        aciklama: "Yumuşak içimli, taze çekilmiş espresso ve kadifemsi süt.",
        vegan: false,
        tags: ["sicak", "enerjik", "kahve"],
      },
      {
        id: 2,
        isim: "Caramel Latte",
        fiyat: 160,
        puan: 4.9,
        icerik: ["Espresso", "Süt", "Karamel Şurubu"],
        alerjenler: ["Süt/Laktoz"],
        resim: "/images/caramel-latte.png",
        aciklama: "Karamel severler için.",
        vegan: false,
        tags: ["tatli", "enerjik", "kahve"],
      },
      {
        id: 3,
        isim: "Americano",
        fiyat: 110,
        puan: 4.7,
        icerik: ["Espresso", "Sıcak Su"],
        alerjenler: [],
        resim: "/images/americano.jpg",
        aciklama: "Sert ve yoğun kahve deneyimi.",
        vegan: true,
        tags: ["sicak", "enerjik", "kahve"],
      },
      {
        id: 4,
        isim: "Limonata",
        fiyat: 80,
        puan: 4.5,
        icerik: ["Taze Sıkım Limon", "Su", "Şeker", "Taze Nane"],
        alerjenler: [],
        resim: "/images/lemonade.png",
        aciklama: "Ev yapımı serinlik.",
        vegan: true,
        tags: ["soguk", "ferah"],
      },
      {
        id: 5,
        isim: "Bowl",
        fiyat: 220,
        puan: 4.9,
        icerik: ["Kinoa", "Avokado", "Nohut", "Yeşillik", "Zeytinyağı"],
        alerjenler: [],
        resim: "/images/bowl.png",
        aciklama: "Besleyici ve bitkisel protein kaynağı.",
        vegan: true,
        tags: ["saglikli", "doyurucu", "yemek"],
      },
      {
        id: 6,
        isim: "Brownie",
        fiyat: 140,
        puan: 4.8,
        icerik: ["Bitter Çikolata", "Tereyağı", "Yumurta", "Un", "Ceviz"],
        alerjenler: ["Gluten", "Yumurta", "Süt/Laktoz", "Kuruyemiş"],
        resim: "/images/brownie.png",
        aciklama: "Bol cevizli ıslak lezzet bombası.",
        vegan: false,
        tags: ["tatli"],
      },
    ]);
    console.log("✅ Örnek menü Atlas'a yüklendi.");

    server.listen(3000, () =>
      console.log("🚀 Sunucu http://localhost:3000 adresinde çalışıyor"),
    );
  } catch (error) {
    console.error("❌ Başlatma hatası:", error);
  }
}

startApp();
