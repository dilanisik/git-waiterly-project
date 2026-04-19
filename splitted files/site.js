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

        const menu = [
            { id: 1, isim: "Latte", fiyat: 130 },
            { id: 2, isim: "Caramel latte", fiyat: 160 },
            { id: 3, isim: "Limonata", fiyat: 40 },
            { id: 4, isim: "Kola", fiyat: 50 },
            { id: 5, isim: "Americano", fiyat: 60 },
            { id: 6, isim: "Smoothie", fiyat: 150 },
            { id: 7, isim: "Sandiviç", fiyat: 50 },
            { id: 8, isim: "Bowl", fiyat: 150 },
            { id: 9, isim: "Brownie", fiyat: 100 }
        ];

        res.end(JSON.stringify(menu));
    }

    else if (req.url === "/receipt.js") {
        const filePath = path.join(__dirname, "receipt.js");
        fs.readFile(filePath, (err, data) => {
            res.writeHead(200, { "Content-Type": "application/javascript" });
            res.end(data);
        });
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
    else if (req.url === "/api/requests"){
        res.writeHead(200, {"Content-type": "application/json; charset=utf-8"});

        const requests = [
            { id: 1, istek: "Masaya peçete gönderebilir misiniz?"},
            { id: 2, istek: "Ek servis alabilir miyim?"},
            { id: 3, istek: "Tuz, baharat alabilir miyim?"},
            { id: 4, istek: "Ödeme yapmak istiyorum."},
            { id: 5, istek: "Başka bir isteğim var, Garson gelebilir mi?"}
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

    else if (req.url === "/receipt.html") {
        const filePath = path.join(__dirname, "receipt.html");

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
    }

    else if (req.url === "/cart.html") {
    const filePath = path.join(__dirname, "cart.html");

    fs.readFile(filePath, (err, data) => {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
     });
    }
    
    else if (req.url === "/menu_script.html") {
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
    }

    else if (req.url === "/images/top.png") {
        const filePath = path.join(__dirname, "images", "top.png");

        fs.readFile(filePath, (err, data) => {
            res.writeHead(200, { "Content-Type": "image/png" });
            res.end(data);
        });
    }

    else if (req.url === "/images/middle.png") {
        const filePath = path.join(__dirname, "images", "middle.png");
        fs.readFile(filePath, (err, data) => {
            res.writeHead(200, { "Content-Type": "image/png" });
            res.end(data);
        });
    }
    else if (req.url === "/images/bottom.png") {
        const filePath = path.join(__dirname, "images", "bottom.png");
        fs.readFile(filePath, (err, data) => {
            res.writeHead(200, { "Content-Type": "image/png" });
            res.end(data);
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
