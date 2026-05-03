console.log("Waiterly has begun 🚀");

const http = require("http");
const fs = require("fs");
const path = require("path");
require('dotenv').config();
<<<<<<< HEAD
const { MongoClient, ObjectId } = require("mongodb");

// 1. MongoDB Ayarları ve Global 'db' Değişkeni
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"; 
const client = new MongoClient(uri);
const dbName = "waiterly_db";
let db; // Bunu dışarıda tanımlıyoruz ki her yerden ulaşılabilsin!

// Eskiden kalan geçici menü (Eğer DB boşsa patlamasın diye durabilir) 
=======
const { MongoClient } = require("mongodb");
const crypto = require("crypto");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"; 
const client = new MongoClient(uri);
const dbName = "waiterly_db";
let db; 

>>>>>>> d73b530 (idk man)
function isAuth(req) {
  const cookieHeader = req.headers.cookie;
  return cookieHeader && (cookieHeader.includes("auth=admin_token") || cookieHeader.includes("auth=staff_token"));
}

function isAdmin(req) {
    const cookieHeader = req.headers.cookie;
    return cookieHeader && cookieHeader.includes("auth=admin_token");
}

function getBody(req) {
    return new Promise((resolve) => {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", () => resolve(body ? JSON.parse(body) : {}));
    });
}

const server = http.createServer(async (req, res) => {
  console.log("Browser is asking for: ", req.url);

  const publicPages = ["/", "/real.html", "/menu_script.html", "/cart.html", "/requests.html", "/ingredients.html", "/login.html", "/mood.html", "/staff.html"];
  
  if (publicPages.includes(req.url.split('?')[0]) || req.url.startsWith("/session.html")) {
    const cleanUrl = req.url.split('?')[0] === "/" ? "/real.html" : req.url.split('?')[0]; 
    fs.readFile(path.join(__dirname, cleanUrl), (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  }
  else if (req.url === "/style.css" || req.url.endsWith(".js")) {
<<<<<<< HEAD
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, data) => {
      let contentType = req.url.endsWith(".css") ? "text/css" : "application/javascript";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  }

  // --- REST API: YENİ SİPARİŞ OLUŞTURMA (BURASI DÜZELTİLDİ!) ---
  else if (req.url === "/api/orders" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });
    req.on("end", async () => {
        try {
            const siparisVerisi = JSON.parse(body);
            
            // db değişkeni artık burada çalışıyor!
            const result = await db.collection("orders").insertOne({
                masaNo: siparisVerisi.masaNo || 12,
                urunler: siparisVerisi.urunler,
                toplamTutar: siparisVerisi.toplamTutar,
                durum: "hazırlanıyor",
                tarih: new Date()
            });

            console.log("✅ Sipariş DB'ye kaydedildi! ID:", result.insertedId);
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, orderId: result.insertedId }));
        } catch (err) {
            console.error("Sipariş Kayıt Hatası:", err);
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: "Sipariş kaydedilemedi" }));
        }
    });
  }

  // --- REST API: MENU ITEMS (DB'den Çekme) ---
  else if (req.url.startsWith("/api/menu") && req.method === "GET") {
    try {
        db = client.db(dbName);
        const menuData = await db.collection("menu").find({}).toArray();
        
        // FIX 1: Changed print() to console.log()
        console.log(menuData); 
        
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        
        // FIX 2: Replaced the undefined 'menuDb' fallback with an empty array '[]'
        res.end(JSON.stringify(menuData.length > 0 ? menuData : []));
    } catch(e) {
        // Added console.error here so you can see future backend errors in your terminal!
        console.error("Menu API Error:", e); 
        res.writeHead(500);
        res.end("Menu cekilemedi");
    }
  }

  // --- REST API: REQUESTS (Şimdilik Sabit Veri) ---
  else if (req.url === "/api/requests" && req.method === "GET") {
    const mockRequests = [
      { id: 1, istek: "Masayı Temizler Misiniz?" },
      { id: 2, istek: "Hesabı Alabilir Miyiz?" },
      { id: 3, istek: "Peçete Alabilir Miyiz?" },
      { id: 4, istek: "Ketçap / Mayonez İstiyoruz" },
      { id: 5, istek: "Özel İstek..." },
    ];
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(mockRequests));
  }

  // --- DYNAMIC IMAGES CATCH-ALL ---
  else if (req.url.startsWith("/images/")) {
    const fileName = req.url.replace("/images/", "");
    const filePath = path.join(__dirname, "images", fileName);

    fs.readFile(filePath, (err, data) => {
      if (!err) {
        const ext = path.extname(fileName).toLowerCase();
        let contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".svg" ? "image/svg+xml" : "image/png";
        res.writeHead(200, { "Content-Type": contentType });
=======
    fs.readFile(path.join(__dirname, req.url), (err, data) => {
      if(!err) {
        res.writeHead(200, { "Content-Type": req.url.endsWith(".css") ? "text/css" : "application/javascript" });
>>>>>>> d73b530 (idk man)
        res.end(data);
      } else {
        res.writeHead(404); res.end();
      }
    });
  }
  else if (req.url === "/admin" || req.url === "/admin.html") {
      if (!isAdmin(req)) {
          res.writeHead(302, { Location: "/login.html" }); 
          res.end();
          return;
      }
      fs.readFile(path.join(__dirname, "admin.html"), (err, data) => {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(data);
      });
  }
  else if (req.url === "/api/login" && req.method === "POST") {
    const creds = await getBody(req);
    const user = await db.collection("users").findOne({
        $or: [{ username: creds.username }, { email: creds.username }],
        password: creds.password 
    });

    if (user) {
      const role = (user.rol && user.rol.toLowerCase().includes("admin")) ? "admin" : "staff";
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": `auth=${role}_token; HttpOnly; Path=/;`
      });
      res.end(JSON.stringify({ success: true, role: role }));
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false }));
    }
  }
  else if (req.url === "/api/logout" && req.method === "POST") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "auth=; HttpOnly; Path=/; Max-Age=0"
    });
    res.end(JSON.stringify({ success: true }));
  }
  else if (req.url === "/api/orders" && req.method === "POST") {
      const data = await getBody(req);
      const activeSession = await db.collection("sessions").findOne({ 
          masaNo: data.masaNo.toString(), 
          durum: "aktif" 
      });

      if (!activeSession || activeSession.hashcode !== data.sessionHash) {
          res.writeHead(403, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ success: false, error: "Yetkisiz işlem veya geçersiz oturum." }));
      }

      const siparisVerisi = data.order ? data.order : data;
      const eklenecekTutar = Number(siparisVerisi.toplamTutar) || 0;
      delete siparisVerisi.sessionHash;
      
      const newOrder = { 
          ...siparisVerisi, 
          masaNo: data.masaNo.toString(),
          durum: "hazırlanıyor", 
          tarih: new Date(),
          zaman: new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute:'2-digit'})
      };
      
      const result = await db.collection("order_history").insertOne(newOrder);
      await db.collection("sessions").updateOne(
          { _id: activeSession._id },
          { 
              $push: { siparisler: newOrder },
              $inc: { genelToplam: eklenecekTutar } 
          }
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, orderId: result.insertedId }));
  }  
  else if (req.url === "/api/session" && req.method === "POST") {
      const data = await getBody(req);
      const masaNoStr = data.masaNo.toString();
      const qrPassword = data.password || "";

      const tableRecord = await db.collection("tables").findOne({ masaNo: masaNoStr });
      if (!tableRecord) {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ success: false, error: "Böyle bir masa bulunamadı!" }));
      }

      if (tableRecord.password !== qrPassword) {
          res.writeHead(403, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ success: false, error: "Hatalı veya süresi dolmuş QR kodu!" }));
      }

      const existingSession = await db.collection("sessions").findOne({ masaNo: masaNoStr, durum: "aktif" });
      if (existingSession) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ success: true, hashcode: existingSession.hashcode }));
      }

      const timeNow = Date.now().toString();
      const hashcode = require("crypto").createHash('sha256').update(timeNow + Math.random().toString()).digest('hex');

      const result = await db.collection("sessions").insertOne({ 
          masaNo: masaNoStr,
          baslangicZamani: new Date(),
          durum: "aktif",
          hashcode: hashcode,
          siparisler: [], 
          genelToplam: 0
      });
      
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, hashcode: hashcode }));
  }
  else if (req.url.startsWith("/api/session/current") && req.method === "GET") {
      const urlParams = new URLSearchParams(req.url.split('?')[1]);
      const hash = urlParams.get('hash');
      
      const activeSession = await db.collection("sessions").findOne({ hashcode: hash, durum: "aktif" });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(activeSession || { siparisler: [], genelToplam: 0 }));
  }
  else if (req.url === "/api/session/close" && req.method === "POST") {
    const data = await getBody(req);
    await db.collection("sessions").updateOne(
        { hashcode: data.hash },
        { $set: { durum: "kapalı", bitisZamani: new Date(), odemeYontemi: data.odemeYontemi } }
    );
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
  }

  // --- BURASI ÇOK ÖNEMLİ: API ENDPOINTLERİ ---
  else if (req.url.startsWith("/api/")) {
      const parts = req.url.split("/");
      const collectionName = parts[2]; 
      const itemId = parts[3] ? parseInt(parts[3]) : null;

      // ingredients'i buraya ekledik ki 404 dönmesin
      const validCollectionsAPI = ["menu", "users", "requests", "moods", "ingredients"];
      
      if (validCollectionsAPI.includes(collectionName)) {
          const col = db.collection(collectionName);

          if (req.method === "GET") {
              const data = await col.find({}).toArray();
              res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
              res.end(JSON.stringify(data));
          } 
          else if (req.method === "POST") {
              const newItem = await getBody(req);
              const maxItem = await col.find().sort({id:-1}).limit(1).toArray();
              newItem.id = maxItem.length > 0 ? maxItem[0].id + 1 : 1;
              
              await col.insertOne(newItem);
              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true, item: newItem }));
          } 
          else if (req.method === "PUT" && itemId) {
              const updateData = await getBody(req);
              delete updateData._id; 
              await col.updateOne({ id: itemId }, { $set: updateData });
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
          } 
          else if (req.method === "DELETE" && itemId) {
              await col.deleteOne({ id: itemId });
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
          }
      } else {
          // Eğer izin verilmeyen bir API'ye istek atılırsa
          res.writeHead(404); res.end(JSON.stringify({error: "Endpoint not found"}));
      }
  }

  // --- IMAGES ---
  else if (req.url.startsWith("/images/")) {
    const fileName = req.url.replace("/images/", "");
    fs.readFile(path.join(__dirname, "images", fileName), (err, data) => {
      if (!err) {
        const ext = path.extname(fileName).toLowerCase();
        let cType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".svg" ? "image/svg+xml" : "image/png";
        res.writeHead(200, { "Content-Type": cType });
        res.end(data);
      } else {
        res.writeHead(404); res.end();
      }
    });
  } else {
      res.writeHead(404); res.end("404 Not Found");
  }
});

async function startApp() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ MongoDB'ye başarıyla bağlanıldı!");

    const orderCols = await db.listCollections({ name: "order_history" }).toArray();
    if (orderCols.length === 0) {
        await db.createCollection("order_history", { timeseries: { timeField: "tarih", metaField: "masaNo", granularity: "minutes" }});
    }
    
    const sessCols = await db.listCollections({ name: "sessions" }).toArray();
    if (sessCols.length > 0 && sessCols[0].options && sessCols[0].options.timeseries) {
        await db.collection("sessions").drop();
        await db.createCollection("sessions");
    } else if (sessCols.length === 0) {
        await db.createCollection("sessions"); 
    }

    if (await db.collection("users").countDocuments() === 0) {
        await db.collection("users").insertOne({ id: 1, ad: "Sistem Yöneticisi", username: "admin", password: "1234", rol: "Admin", durum: "active", email: "admin@waiterly.com" });
    }
    if (await db.collection("requests").countDocuments() === 0) {
        await db.collection("requests").insertMany([{ id: 1, istek: "Masayı Temizler Misiniz?" }, { id: 2, istek: "Hesabı Alabilir Miyiz?" }, { id: 3, istek: "Peçete İstiyoruz" }, { id: 4, istek: "Özel İstek..." }]);
    }
    if (await db.collection("moods").countDocuments() === 0) {
        await db.collection("moods").insertMany([{ id: 1, isim: "Enerjik Hissetmek", emoji: "⚡", etiketler: ["enerjik"] }, { id: 2, isim: "Tatlı Krizi", emoji: "🍫", etiketler: ["tatli"] }]);
    }
    if (await db.collection("tables").countDocuments() === 0) {
        await db.collection("tables").insertMany([
            { masaNo: "1", password: "abc" },
            { masaNo: "12", password: "1234" }, 
            { masaNo: "15", password: "xyz" }
        ]);
        console.log("✅ Örnek masalar oluşturuldu.");
    }
    if (await db.collection("ingredients").countDocuments() === 0) {
        await db.collection("ingredients").insertMany([
            { id: 1, isim: "Gluten", emoji: "🌾", etiketler: ["gluten", "un"] },
            { id: 2, isim: "Süt Ürünleri", emoji: "🥛", etiketler: ["sut", "laktoz"] }
        ]);
    }

    server.listen(3000, () => console.log("🚀 Sunucu http://localhost:3000 adresinde çalışıyor"));
  } catch (error) {
    console.error("❌ Başlatma hatası:", error);
  }
}

startApp();