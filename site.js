console.log("Waiterly has begun 🚀");

const http = require("http");
const fs = require("fs");
const path = require("path");
require('dotenv').config();
const { MongoClient, ObjectId } = require("mongodb");

// 1. MongoDB Ayarları ve Global 'db' Değişkeni
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"; 
const client = new MongoClient(uri);
const dbName = "waiterly_db";
let db; // Bunu dışarıda tanımlıyoruz ki her yerden ulaşılabilsin!

// Eskiden kalan geçici menü (Eğer DB boşsa patlamasın diye durabilir) 
function isAuth(req) {
  const cookieHeader = req.headers.cookie;
  return cookieHeader && cookieHeader.includes("auth=admin_vip_token");
}

// 2. ANA SUNUCU MANTIĞI
const server = http.createServer(async (req, res) => {
  console.log("Browser is asking for: ", req.url);

  // --- HTML PAGES ---
  if (req.url === "/" || req.url === "/real.html") {
    const filePath = path.join(__dirname, "real.html");
    fs.readFile(filePath, (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  } else if (req.url === "/menu_script.html" || req.url === "/cart.html" || req.url === "/requests.html" || req.url === "/ingredients.html" || req.url === "/login.html" || req.url === "/mood.html") {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  }

  // --- CSS & JS ASSETS ---
  else if (req.url === "/style.css" || req.url.endsWith(".js")) {
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
        res.end(data);
      } else {
        res.writeHead(404);
        res.end();
      }
    });
  } else {
      res.writeHead(404);
      res.end("404");
  }
});

// 3. ÖNCE VERİTABANINA BAĞLAN, SONRA SUNUCUYU BAŞLAT
async function startApp() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ MongoDB'ye başarıyla bağlanıldı!");

    server.listen(3000, () => {
      console.log("🚀 Sunucu http://localhost:3000 adresinde çalışıyor");
    });
  } catch (error) {
    console.error("❌ Başlatma hatası:", error);
  }
}

startApp();
