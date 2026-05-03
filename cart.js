// cart.js - Fiş Görünümlü Sepet & Adisyon

function getSafeCart() {
    try {
        let c = JSON.parse(localStorage.getItem("cart"));
        if (!Array.isArray(c)) return [];
        return c
            .map(item => ({ ...item, quantity: Number(item.quantity) || 0 }))
            .filter(item => item.quantity > 0);
    } catch(e) {
        return [];
    }
}

function bildirimGoster(mesaj){
    document.getElementById("bildirimMesaji").innerText = mesaj;
    document.getElementById("bildirimKutusu").style.display = "flex";
}

function bildirimiKapat() {
    document.getElementById("bildirimKutusu").style.display = "none";
}

// YENİ: Hem DB siparişlerini hem Local sepeti Fiş Tasarımıyla çizer
async function renderCart() {
    const list = document.getElementById("cart-list");
    list.innerHTML = "<p style='text-align: center;'>Adisyon Yükleniyor...</p>";

    let cart = getSafeCart();
    let sessionSiparisler = [];
    let dbGenelToplam = 0;

    // 1. Backend'den Aktif Oturum (Session) Siparişlerini Çek
    const sessionHash = localStorage.getItem("sessionHash");
    if(sessionHash) {
        try {
            const res = await fetch('/api/session/current?hash=' + sessionHash);
            if(res.ok) {
                const data = await res.json();
                sessionSiparisler = data.siparisler || [];
                dbGenelToplam = data.genelToplam || 0;
            }
        } catch(e) {
            console.warn("Sipariş geçmişi çekilemedi:", e);
        }
    }

    let html = "";
    let sepetToplam = 0;

    // KISIM 1: ONAYLANMIŞ SİPARİŞLER (MASADAKİLER)
    if (sessionSiparisler.length > 0) {
        html += `<div class="kategori-baslik">MASADAKİ SİPARİŞLER</div>`;
        sessionSiparisler.forEach(order => {
            order.urunler.forEach(u => {
                const qty = Number(u.quantity) || 1;
                html += `
                <div class="fis-satir">
                    <span class="fis-item-name" style="color: #555;">${qty}x ${u.isim}</span>
                    <span class="fis-dots"></span>
                    <span class="fis-item-price" style="color: #555;">${u.fiyat} TL</span>
                </div>`;
            });
        });
    }

    // KISIM 2: HENÜZ ONAYLANMAMIŞ (SEPETTEKİ) ÜRÜNLER
    if (cart.length > 0) {
        html += `<div class="kategori-baslik" style="color: #d9534f; border-bottom-color: #d9534f;">SEPETTEKİLER (SİPARİŞ VERİLMEDİ)</div>`;
        
        cart.forEach(item => {
            const rowTotal = (Number(item.fiyat) * Number(item.quantity)) || 0;
            sepetToplam += rowTotal;
            
            html += `
            <div class="fis-satir" style="margin-bottom: 10px;">
                <span class="fis-item-name" style="color: #d9534f; font-weight: bold;">${item.isim}</span>
                <span class="fis-dots"></span>
                <span class="fis-item-price" style="color: #d9534f; font-weight: bold;">${rowTotal} TL</span>
                
                <!-- Sepet Kontrolleri -->
                <div class="cart-controls">
                    <button onclick="removeFromCart(${item.id})" style="border-color: #ff4c4c; color: #ff4c4c;">-</button>
                    <span style="font-size: 16px; width: 25px; text-align: center; color:#333;">${item.quantity}</span>
                    <button onclick="addToCart(${item.id})" style="border-color: #4CAF50; color: #4CAF50;">+</button>
                </div>
            </div>`;
        });
    }

    // Boş durum kontrolü
    if (sessionSiparisler.length === 0 && cart.length === 0) {
        list.innerHTML = "<p style='color: gray; font-style: italic; text-align: center; margin-top:20px;'>Adisyonunuz şu an boş.</p>";
        return;
    }

    // GENEL TOPLAM
    const genelToplam = dbGenelToplam + sepetToplam;
    html += `<hr style="border: 1px dashed #ccc; margin: 25px 0 15px 0;">`;
    html += `<div style="text-align: right; font-size: 18px; color: #222;">TOPLAM: <span style="color: #4CAF50;">${genelToplam} TL</span></div>`;

    list.innerHTML = html;
}

async function siparisVer(){
    let cart = getSafeCart();
    if(cart.length === 0) {
        alert("Sepetiniz boş! Lütfen menüden ürün ekleyin.");
        return;
    }

    let currentOrder = {
        urunler: [],
        toplamTutar: 0
    };

    cart.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const fiyat = Number(item.fiyat) || 0;
        currentOrder.urunler.push({
            isim: item.isim || "Bilinmeyen Ürün",
            quantity: qty,
            fiyat: fiyat * qty
        });
        currentOrder.toplamTutar += fiyat * qty;
    });

    const sessionHash = localStorage.getItem("sessionHash");
    const masaNo = localStorage.getItem("masaNo");

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionHash: sessionHash,
                masaNo: masaNo,
                order: currentOrder
            })
        });

        if (!response.ok) {
            console.warn("Backend hata döndü.");
        }
    } catch (error) {
        console.warn("Sunucuya bağlanılamadı.", error);
    }

    localStorage.removeItem("cart");
    bildirimGoster("Sipariş mutfağa iletildi! 😋");
    
    // DB'deki yeni verileri çekip adisyonu güncellemek için render'ı tetikle
    renderCart();
}

function addToCart(id) {
    let cart = getSafeCart();
    let item = cart.find(c => String(c.id) === String(id)); // String çevrimi garantiye almak için
    if (item) {
        item.quantity++;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

function removeFromCart(id) {
    let cart = getSafeCart();
    let item = cart.find(c => String(c.id) === String(id));
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) cart = cart.filter(c => String(c.id) !== String(id));
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

function clearCart() {
    let cart = getSafeCart();
    if (cart.length === 0) {
        alert("Sepetiniz zaten boş! 🛒");
    } else {
        document.getElementById("onayKutusu").style.display = "block";
    }
}

function sepetiSilHayir() { document.getElementById("onayKutusu").style.display = "none"; }
function sepetiSilEvet() {
    localStorage.removeItem("cart");
    document.getElementById("onayKutusu").style.display = "none";
    renderCart();
}

// Updated Payment Logic for Task 1 & 2
async function baslatOdemeSureci() {
    // 1. Ask for Payment Method
    const secim = confirm("Ödemeyi NAKİT olarak yapmak için 'Tamam', KREDİ KARTI için 'İptal' seçiniz.");
    const odemeYontemi = secim ? "nakit" : "kredi kartı";

    // 2. Load current orders for review before closing session
    const sessionHash = localStorage.getItem("sessionHash");
    let siparisler = [];
    
    try {
        const res = await fetch('/api/session/current?hash=' + sessionHash);
        if (res.ok) {
            const data = await res.json();
            siparisler = data.siparisler || [];
        }
    } catch (e) {
        console.error("İnceleme için veriler çekilemedi:", e);
    }

    // 3. Ask for Review (Task 2)
    if (siparisler.length > 0 && confirm("Deneyiminizi değerlendirmek ister misiniz?")) {
        await showReviewPopup(siparisler);
    }

    // 4. Close Session (Task 1)
    await oturumuKapat(sessionHash, odemeYontemi);
}

async function showReviewPopup(siparisler) {
    // Collect all unique products from orders
    let uniqueProducts = [];
    siparisler.forEach(s => {
        s.urunler.forEach(u => {
            if(!uniqueProducts.find(p => p.isim === u.isim)) uniqueProducts.push(u);
        });
    });

    for (let product of uniqueProducts) {
        let yeniPuan = prompt(`${product.isim} için 1-5 arası puan verin:`, "5");
        if (yeniPuan) {
            await puanGuncelle(product.isim, parseInt(yeniPuan));
        }
    }
    alert("Değerlendirmeniz için teşekkürler!");
}

async function puanGuncelle(urunIsmi, verilenPuan) {
    // Logic: Fetch menu, find product, calculate new average, then PUT to /api/menu
    try {
        const res = await fetch('/api/menu');
        const menu = await res.json();
        const item = menu.find(m => m.isim === urunIsmi);
        
        if (item) {
            // Simple moving average or weighted calculation
            let eskiPuan = parseFloat(item.puan) || 0;
            let yeniPuan = ((eskiPuan + verilenPuan) / 2).toFixed(1); 
            
            await fetch(`/api/menu/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puan: yeniPuan })
            });
        }
    } catch (e) { console.error("Puan güncellenemedi:", e); }
}

async function oturumuKapat(hash, yontem) {
    // Backend needs a route to set session status to "kapalı"
    try {
        const response = await fetch('/api/session/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hash: hash, odemeYontemi: yontem })
        });

        if (response.ok) {
            localStorage.removeItem("sessionHash");
            localStorage.removeItem("cart");
            alert(`Ödeme ${yontem} ile alındı. Oturum kapatıldı. Yine bekleriz!`);
            window.location.href = "/";
        }
    } catch (e) { alert("Bağlantı hatası!"); }
}

window.addEventListener("load", () => {
    renderCart();
});