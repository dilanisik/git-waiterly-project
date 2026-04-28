console.log("Waiterly has begun 🚀");

const http = require("http");
const fs = require("fs");
const path = require("path");

// LÜTFEN DİKKAT: Mevcut menü ürünlerinizin tamamını burada tutmaya devam edin.
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
  // ... (DİĞER TÜM MENÜ ÜRÜNLERİNİZ BURADA KALACAK) ...
];

const server = http.createServer((req, res) => {
  
  // ... (Mevcut '/' ve diğer HTML/JS API yönlendirmeleriniz burada kalacak) ...

  /* ========================================================
     YENİ EKLENEN KISIM: İçeriğe Göre Bul Sayfası Yönlendirmeleri
     (Aşağıdaki bloğu, "/images/" yönlendirmesinden hemen ÜSTE ekleyin)
     ======================================================== */
  else if (req.url === "/ingredients.html") {
    const filePath = path.join(__dirname, "ingredients.html");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      } else {
        res.writeHead(404);
        res.end("ingredients.html bulunamadi");
      }
    });
  } 
  else if (req.url === "/ingredients.js") {
    const filePath = path.join(__dirname, "ingredients.js");
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      } else {
        res.writeHead(404);
        res.end("ingredients.js bulunamadi");
      }
    });
  }
  /* ======================================================== */

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

  // --- 404 ---
  else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 - Sayfa Bulunamadı");
  }
});

server.listen(3000, () => {
  console.log("Server 3000 portunda çalışıyor...");
});
