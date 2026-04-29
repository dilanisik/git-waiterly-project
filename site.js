console.log("Waiterly has begun 🚀");

const http = require("http");
const fs = require("fs");
const path = require("path");

// Define the global database OUTSIDE the server function so it doesn't reset on every click
let menuDb = [
  {
    id: 1,
    isim: "Latte",
    fiyat: 130,
    puan: 4.8,
    icerik: ["Espresso", "Sıcak Süt", "Süt Köpüğü"],
    alerjenler: ["Süt/Laktoz"],
    resim: "/images/latte.png",
    aciklama: "Yumuşak içimli, taze çekilmiş espresso ve kadifemsi süt.",
    vegan: false,
  },
  {
    id: 2,
    isim: "Caramel Latte",
    fiyat: 160,
    puan: 4.9,
    icerik: ["Espresso", "Süt", "Karamel Şurubu"],
    alerjenler: ["Süt/Laktoz"],
    resim: "/images/caramel-latte.png",
    aciklama: "Karamel severler için tatlı ve dengeli bir kahve deneyimi.",
    vegan: false,
  },
  {
    id: 3,
    isim: "Limonata",
    fiyat: 40,
    puan: 4.5,
    icerik: ["Taze Sıkım Limon", "Su", "Şeker", "Taze Nane"],
    alerjenler: [],
    resim: "/images/lemonade.png",
    aciklama: "Taze nane yapraklarıyla hazırlanan ev yapımı serinlik.",
    vegan: true,
  },
  {
    id: 4,
    isim: "Kola",
    fiyat: 50,
    puan: 4.2,
    icerik: ["Kola Özütü", "Karbonatlı Su", "Şeker"],
    alerjenler: [],
    resim: "/images/cola.png",
    aciklama: "Buz gibi, ferahlatıcı klasik lezzet.",
    vegan: true,
  },
  {
    id: 5,
    isim: "Americano",
    fiyat: 60,
    puan: 4.7,
    icerik: ["Double Espresso", "Sıcak Su"],
    alerjenler: [],
    resim: "/images/americano.png",
    aciklama: "Sert kahve sevenlere özel, yoğun ve sade.",
    vegan: true,
  },
  {
    id: 6,
    isim: "Smoothie",
    fiyat: 150,
    puan: 4.6,
    icerik: ["Çilek", "Muz", "Süzme Yoğurt", "Bal"],
    alerjenler: ["Süt/Laktoz"],
    resim: "/images/smoothie.png",
    aciklama: "Taze meyvelerle hazırlanan sağlıklı ve doyurucu atıştırmalık.",
    vegan: false,
  },
  {
    id: 7,
    isim: "Sandiviç",
    fiyat: 50,
    puan: 4.4,
    icerik: ["Tam Buğday Ekmeği", "Hindi Füme", "Kaşar", "Marul"],
    alerjenler: ["Gluten", "Süt/Laktoz"],
    resim: "/images/sandwich.png",
    aciklama: "Hafif bir mola için taze yeşillikli soğuk sandviç.",
    vegan: true,
  },
  {
    id: 8,
    isim: "Bowl",
    fiyat: 150,
    puan: 4.9,
    icerik: ["Kinoa", "Avokado", "Nohut", "Mevsim Yeşillikleri"],
    alerjenler: [],
    resim: "/images/bowl.png",
    aciklama: "Bitkisel protein kaynağı, taze ve besleyici fit kase.",
    vegan: true,
  },
  {
    id: 9,
    isim: "Brownie",
    fiyat: 100,
    puan: 4.8,
    icerik: ["Bitter Çikolata", "Tereyağı", "Yumurta", "Un", "Ceviz"],
    alerjenler: ["Gluten", "Yumurta", "Süt/Laktoz", "Kuruyemiş"],
    resim: "/images/brownie.png",
    aciklama: "Bol cevizli ve yoğun bitter çikolatalı ıslak lezzet bombası.",
    vegan: false,
  },
  {
    id: 10,
    isim: "Karamel",
    fiyat: 999,
    puan: -5.0,
    icerik: ["Karamel"],
    alerjenler: [""],
    resim: "/images/brownie.png",
    aciklama: "Saf Karamel.",
    vegan: false,
  },
];

// Define the security guard OUTSIDE the server function to keep it clean
function isAuth(req) {
  const cookieHeader = req.headers.cookie;
  return cookieHeader && cookieHeader.includes("auth=admin_vip_token");
}

// ---------------------------------------------------------
// SERVER INITIALIZATION
// ---------------------------------------------------------
const server = http.createServer((req, res) => {
  // This is the ultimate debugger tool we added
  console.log("Browser is asking for: ", req.url);

  // --- HTML PAGES ---
  if (req.url === "/" || req.url === "/real.html") {
    const filePath = path.join(__dirname, "real.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Sunucu hatası");
      } else {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  } else if (req.url === "/menu_script.html") {
    const filePath = path.join(__dirname, "menu_script.html");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  } else if (req.url === "/cart.html") {
    const filePath = path.join(__dirname, "cart.html");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  } else if (req.url === "/requests.html") {
    const filePath = path.join(__dirname, "requests.html");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  } else if (req.url === "/ingredients.html") {
    const filePath = path.join(__dirname, "ingredients.html");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  } else if (req.url === "/ingredients.js") {
    const filePath = path.join(__dirname, "ingredients.js");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      }
    });
  }else if (req.url === "/login.html") {
    const filePath = path.join(__dirname, "login.html");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  }

  // --- CSS & JS ASSETS ---
  else if (req.url === "/style.css") {
    const filePath = path.join(__dirname, "style.css");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(data);
      }
    });
  } else if (req.url === "/menu_script.js") {
    const filePath = path.join(__dirname, "menu_script.js");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      }
    });
  } else if (req.url === "/cart.js") {
    const filePath = path.join(__dirname, "cart.js");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      }
    });
  } else if (req.url === "/requests.js") {
    const filePath = path.join(__dirname, "requests.js");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      }
    });
  }

  // --- PROTECTED ADMIN DASHBOARD ---
  else if (req.url === "/admin" || req.url === "/admin.html") {
    if (!isAuth(req)) {
      res.writeHead(302, { Location: "/login.html" }); // Kick them to login!
      res.end();
      return;
    }
    const filePath = path.join(__dirname, "admin.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
      } else {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  }
  else if (req.url === "/admin.js") {
    const filePath = path.join(__dirname, "admin.js");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });
  }

  // --- REST API: LOGIN ---
  else if (req.url === "/api/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const creds = JSON.parse(body);
      if (creds.username === "admin" && creds.password === "1234") {
        res.writeHead(200, {
          "Content-Type": "application/json",
          // REMOVED Max-Age=3600. This is now a Session Cookie!
          "Set-Cookie": "auth=admin_vip_token; HttpOnly; Path=/;",
        });
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false }));
      }
    });
  }
  // --- REST API: LOGOUT ---
  else if (req.url === "/api/logout" && req.method === "POST") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      // Force the browser to delete the cookie by setting its expiration to the year 1970!
      "Set-Cookie":
        "auth=; HttpOnly; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    });
    res.end(JSON.stringify({ success: true }));
  }
  // --- REST API: MENU ITEMS ---
  else if (req.url.startsWith("/api/menu")) {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(menuDb));
    } else if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const newItem = JSON.parse(body);
        newItem.id =
          menuDb.length > 0 ? Math.max(...menuDb.map((m) => m.id)) + 1 : 1;
        menuDb.push(newItem);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, item: newItem }));
      });
    } else if (req.method === "DELETE") {
      const idToDelete = parseInt(req.url.split("/").pop());
      menuDb = menuDb.filter((m) => m.id !== idToDelete);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    }
  }

  // --- REST API: REQUESTS (MOCK DATA) ---
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
      if (err) {
        res.writeHead(404);
        res.end("Resim bulunamadı");
      } else {
        const ext = path.extname(fileName).toLowerCase();
        let contentType = "image/png"; // default
        if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".svg") contentType = "image/svg+xml";

        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      }
    });
  }

  // --- 404 CATCH-ALL ---
  else {
    res.writeHead(404);
    res.end("404 Not Found");
  }
}); // <-- THE CRITICAL MISSING BRACE HAS BEEN RESTORED!

// ---------------------------------------------------------
// START THE SERVER
// ---------------------------------------------------------
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

