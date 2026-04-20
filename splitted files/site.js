console.log("Waiterly has begun 🚀");

const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  // ANA SAYFA → real.html gönder
  if (req.url === "/") {
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
  }

  // CSS dosyası
  else if (req.url === "/style.css") {
    const filePath = path.join(__dirname, "style.css");

    fs.readFile(filePath, (err, data) => {
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(data);
    });
  }

  // JS dosyası
  else if (req.url === "/menu_script.js") {
    const filePath = path.join(__dirname, "menu_script.js");

    fs.readFile(filePath, (err, data) => {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(data);
    });
  }

  // API
  else if (req.url === "/api/menu") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });

    // YENİ: Resim, içerik, alerjen ve puan verileri eklendi
    const menu = [
      {
        id: 1,
        isim: "Latte",
        fiyat: 130,
        puan: 4.8,
        icerik: ["Espresso", "Sıcak Süt", "Süt Köpüğü"],
        alerjenler: ["Süt/Laktoz"],
        resim: "/images/latte.png",
      },
      {
        id: 2,
        isim: "Caramel Latte",
        fiyat: 160,
        puan: 4.9,
        icerik: ["Espresso", "Süt", "Karamel Şurubu"],
        alerjenler: ["Süt/Laktoz"],
        resim: "/images/caramel-latte.png",
      },
      {
        id: 3,
        isim: "Limonata",
        fiyat: 40,
        puan: 4.5,
        icerik: ["Taze Sıkım Limon", "Su", "Şeker", "Taze Nane"],
        alerjenler: [],
        resim: "/images/lemonade.png",
      },
      {
        id: 4,
        isim: "Kola",
        fiyat: 50,
        puan: 4.2,
        icerik: ["Kola Özütü", "Karbonatlı Su", "Şeker"],
        alerjenler: [],
        resim: "/images/cola.png",
      },
      {
        id: 5,
        isim: "Americano",
        fiyat: 60,
        puan: 4.7,
        icerik: ["Double Espresso", "Sıcak Su"],
        alerjenler: [],
        resim: "/images/americano.png",
      },
      {
        id: 6,
        isim: "Smoothie",
        fiyat: 150,
        puan: 4.6,
        icerik: ["Çilek", "Muz", "Süzme Yoğurt", "Bal"],
        alerjenler: ["Süt/Laktoz"],
        resim: "/images/smoothie.png",
      },
      {
        id: 7,
        isim: "Sandiviç",
        fiyat: 50,
        puan: 4.4,
        icerik: ["Tam Buğday Ekmeği", "Hindi Füme", "Kaşar", "Marul"],
        alerjenler: ["Gluten", "Süt/Laktoz"],
        resim: "/images/sandwich.png",
      },
      {
        id: 8,
        isim: "Bowl",
        fiyat: 150,
        puan: 4.9,
        icerik: ["Kinoa", "Avokado", "Nohut", "Mevsim Yeşillikleri"],
        alerjenler: [],
        resim: "/images/bowl.png",
      },
      {
        id: 9,
        isim: "Brownie",
        fiyat: 100,
        puan: 4.8,
        icerik: ["Bitter Çikolata", "Tereyağı", "Yumurta", "Un", "Ceviz"],
        alerjenler: ["Gluten", "Yumurta", "Süt/Laktoz", "Kuruyemiş"],
        resim: "/images/brownie.png",
      },
    ];
    res.end(JSON.stringify(menu));
  }

  // JS dosyası 2
  else if (req.url === "/requests.js") {
    const filePath = path.join(__dirname, "requests.js");

    fs.readFile(filePath, (err, data) => {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(data);
    });
  }

  //API 2
  else if (req.url === "/api/requests") {
    res.writeHead(200, { "Content-type": "application/json; charset=utf-8" });

    const requests = [
      { id: 1, istek: "Masaya peçete gönderebilir misiniz?" },
      { id: 2, istek: "Ek servis alabilir miyim?" },
      { id: 3, istek: "Tuz, baharat alabilir miyim?" },
      { id: 4, istek: "Ödeme yapmak istiyorum." },
      { id: 5, istek: "Başka bir isteğim var, Garson gelebilir mi?" },
    ];

    res.end(JSON.stringify(requests));
  }

  // İstekler Sayfası
  else if (req.url === "/requests.html") {
    const filePath = path.join(__dirname, "requests.html");

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Sunucu hatası");
      } else {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  }

  // JS dosyası (cart)
  else if (req.url === "/cart.js") {
    const filePath = path.join(__dirname, "cart.js");

    fs.readFile(filePath, (err, data) => {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(data);
    });
  } else if (req.url === "/cart.html") {
    const filePath = path.join(__dirname, "cart.html");

    fs.readFile(filePath, (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  } else if (req.url === "/menu_script.html") {
    const filePath = path.join(__dirname, "menu_script.html");

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Sunucu hatası");
      } else {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      }
    });
  } // DYNAMIC IMAGE ROUTE: Handles ANY image inside the "images" folder
  else if (req.url.startsWith("/images/")) {
    const fileName = req.url.replace("/images/", "");
    const filePath = path.join(__dirname, "images", fileName);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Resim bulunamadı");
      } else {
        // Sends the file as a PNG image
        res.writeHead(200, { "Content-Type": "image/png" });
        res.end(data);
      }
    });
  }
  // 404
  else {
    res.writeHead(404);
    res.end("404 Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server 3000 portunda çalışıyor");
});
