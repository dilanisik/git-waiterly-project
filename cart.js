// cart.js - Fiş Görünümlü Sepet & Adisyon

function getSafeCart() {
  try {
    let c = JSON.parse(localStorage.getItem("cart"));
    if (!Array.isArray(c)) return [];
    return c
      .map((item) => ({ ...item, quantity: Number(item.quantity) || 0 }))
      .filter((item) => item.quantity > 0);
  } catch (e) {
    return [];
  }
}

function bildirimGoster(mesaj, tip = "basari") {
  document.getElementById("bildirimMesaji").innerText = mesaj;

  const baslik = document.getElementById("bildirimBaslik");
  const buton = document.getElementById("bildirimButon");

  // Uyarı (Warning) stili
  if (tip === "uyari") {
    baslik.innerHTML = "⚠️ Uyarı";
    baslik.style.color = "#ff9800"; // Turuncu
    buton.style.backgroundColor = "#ff9800";
    buton.innerText = "Tamam";
  }
  // Başarı (Success) stili
  else {
    baslik.innerHTML = "✅ Başarılı!";
    baslik.style.color = "#4CAF50"; // Yeşil
    buton.style.backgroundColor = "#4CAF50";
    buton.innerText = "Harika!";
  }

  document.getElementById("bildirimKutusu").style.display = "flex";
}

function bildirimiKapat() {
  document.getElementById("bildirimKutusu").style.display = "none";
}

// YENİ: Hem DB siparişlerini hem Local sepeti Fiş Tasarımıyla çizer
async function renderCart() {
  const list = document.getElementById("cart-list");
  if (!list) return; // 👈 EĞER SAYFADA SEPET YOKSA ÇÖKMEYİ ENGELLER, DURUR.

  list.innerHTML = "<p style='text-align: center;'>Adisyon Yükleniyor...</p>";

  let cart = getSafeCart();
  let sessionSiparisler = [];
  let dbGenelToplam = 0;

  // 1. Backend'den Aktif Oturum (Session) Siparişlerini Çek
  const sessionHash = localStorage.getItem("sessionHash");
  if (sessionHash) {
    try {
      const res = await fetch("/api/session/current?hash=" + sessionHash);
      if (res.ok) {
        const data = await res.json();
        sessionSiparisler = data.siparisler || [];
        dbGenelToplam = data.genelToplam || 0;
      }
    } catch (e) {
      console.warn("Sipariş geçmişi çekilemedi:", e);
    }
  }

  let html = "";
  let sepetToplam = 0;

  // KISIM 1: ONAYLANMIŞ SİPARİŞLER (MASADAKİLER)
  if (sessionSiparisler.length > 0) {
    html += `<div class="kategori-baslik">MASADAKİ SİPARİŞLER</div>`;
    sessionSiparisler.forEach((order) => {
      order.urunler.forEach((u) => {
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

    cart.forEach((item) => {
      const rowTotal = Number(item.fiyat) * Number(item.quantity) || 0;
      sepetToplam += rowTotal;

      html += `
            <div class="fis-satir" style="margin-bottom: 10px;">
                <span class="fis-item-name" style="color: #d9534f; font-weight: bold;">${item.isim}</span>
                <span class="fis-dots"></span>
                <span class="fis-item-price" style="color: #d9534f; font-weight: bold;">${rowTotal} TL</span>
                
                <!-- Sepet Kontrolleri -->
                <div class="cart-controls">
                    <button onclick="removeFromCart('${item._id || item.id}')" style="border-color: #ff4c4c; color: #ff4c4c;">-</button>
<span style="font-size: 16px; width: 25px; text-align: center; color:#333;">${item.quantity}</span>
<button onclick="addToCart('${item._id || item.id}')" style="border-color: #4CAF50; color: #4CAF50;">+</button>
                </div>
            </div>`;
    });
  }

  // Boş durum kontrolü
  if (sessionSiparisler.length === 0 && cart.length === 0) {
    list.innerHTML =
      "<p style='color: gray; font-style: italic; text-align: center; margin-top:20px;'>Adisyonunuz şu an boş.</p>";
    return;
  }

  // GENEL TOPLAM
  const genelToplam = dbGenelToplam + sepetToplam;
  html += `<hr style="border: 1px dashed #ccc; margin: 25px 0 15px 0;">`;
  html += `<div style="text-align: right; font-size: 18px; color: #222;">TOPLAM: <span style="color: #4CAF50;">${genelToplam} TL</span></div>`;

  list.innerHTML = html;
}

async function siparisVer() {
  let cart = getSafeCart();
  if (cart.length === 0) {
    bildirimGoster("Sepetiniz boş! Lütfen menüden ürün ekleyin.", "uyari");
    return;
  }

  let currentOrder = {
    urunler: [],
    toplamTutar: 0,
  };

  cart.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const fiyat = Number(item.fiyat) || 0;
    currentOrder.urunler.push({
      isim: item.isim || "Bilinmeyen Ürün",
      quantity: qty,
      fiyat: fiyat * qty,
    });
    currentOrder.toplamTutar += fiyat * qty;
  });

  const sessionHash = localStorage.getItem("sessionHash");
  const masaNo = localStorage.getItem("masaNo");

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionHash: sessionHash,
        masaNo: masaNo,
        order: currentOrder,
      }),
    });

    if (!response.ok) {
      console.warn("Backend hata döndü.");
    }
  } catch (error) {
    console.warn("Sunucuya bağlanılamadı.", error);
  }

  localStorage.removeItem("cart");
  bildirimGoster("Sipariş mutfağa iletildi!");

  // DB'deki yeni verileri çekip adisyonu güncellemek için render'ı tetikle
  renderCart();
}

function addToCart(id) {
  let cart = getSafeCart();
  let item = cart.find(
    (c) => String(c._id) === String(id) || String(c.id) === String(id),
  );
  if (item) {
    item.quantity++;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}

function removeFromCart(id) {
  let cart = getSafeCart();
  let item = cart.find(
    (c) => String(c._id) === String(id) || String(c.id) === String(id),
  );
  if (item) {
    item.quantity--;
    if (item.quantity <= 0)
      cart = cart.filter(
        (c) => String(c._id) !== String(id) && String(c.id) !== String(id),
      );
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}
function clearCart() {
  let cart = getSafeCart();
  if (cart.length === 0) {
    bildirimGoster("Sepetiniz zaten boş! 🛒", "uyari");
  } else {
    document.getElementById("onayKutusu").style.display = "block";
  }
}

function sepetiSilHayir() {
  document.getElementById("onayKutusu").style.display = "none";
}
function sepetiSilEvet() {
  localStorage.removeItem("cart");
  document.getElementById("onayKutusu").style.display = "none";
  renderCart();
}

// Global Variables for Payment Modal
let secilenOdemeYontemi = "";
let sessionSiparislerInceleme = [];
let menuVerileriCache = [];

async function baslatOdemeSureci() {
  // Show custom modal instead of browser confirm
  document.getElementById("paymentModal").style.display = "flex";
  document.getElementById("paymentStep").style.display = "block";
  document.getElementById("reviewStep").style.display = "none";
}

async function handlePaymentSelection(yontem) {
  secilenOdemeYontemi = yontem;
  document.getElementById("paymentStep").style.display = "none";

  // Fetch current session orders
  const sessionHash = localStorage.getItem("sessionHash");
  try {
    const res = await fetch("/api/session/current?hash=" + sessionHash);
    if (res.ok) {
      const data = await res.json();
      sessionSiparislerInceleme = data.siparisler || [];
    }
  } catch (e) {
    console.error("İnceleme için veriler çekilemedi:", e);
  }

  // Fetch menu to get product photos
  try {
    const menuRes = await fetch("/api/menu");
    if (menuRes.ok) {
      menuVerileriCache = await menuRes.json();
    }
  } catch (e) {
    console.error("Menü resimleri için veri çekilemedi:", e);
  }

  if (sessionSiparislerInceleme.length > 0) {
    await urunListesiniDoldur();
    // FIX: Changed "flex" to "block" so items stack top-to-bottom
    document.getElementById("reviewStep").style.display = "block";
  } else {
    await finalCloseSession();
  }
}

async function urunListesiniDoldur() {
  const listDiv = document.getElementById("reviewProductList");
  listDiv.innerHTML = "";

  let uniqueProducts = [];
  sessionSiparislerInceleme.forEach((s) => {
    s.urunler.forEach((u) => {
      if (!uniqueProducts.find((p) => p.isim === u.isim))
        uniqueProducts.push(u);
    });
  });

  uniqueProducts.forEach((product, index) => {
    // Find photo from menu cache (assumes API returns 'resim' property)
    const menuItem = menuVerileriCache.find((m) => m.isim === product.isim);
    // Fallback to a placeholder if the image isn't found
    const photoUrl =
      menuItem && menuItem.resim ? menuItem.resim : "/images/placeholder.png";

    const itemHtml = `
            <div class="review-item">
                <img src="${photoUrl}" alt="${product.isim}" class="review-img" onerror="this.src='/images/placeholder.png'">
                <div class="review-info">
                    <strong>${product.isim}</strong>
                    <div class="star-rating" id="rating-${index}">
                        <input type="radio" id="star5-${index}" name="rating-${index}" value="5"><label for="star5-${index}">★</label>
                        <input type="radio" id="star4-${index}" name="rating-${index}" value="4"><label for="star4-${index}">★</label>
                        <input type="radio" id="star3-${index}" name="rating-${index}" value="3"><label for="star3-${index}">★</label>
                        <input type="radio" id="star2-${index}" name="rating-${index}" value="2"><label for="star2-${index}">★</label>
                        <input type="radio" id="star1-${index}" name="rating-${index}" value="1"><label for="star1-${index}">★</label>
                    </div>
                </div>
            </div>
        `;
    listDiv.insertAdjacentHTML("beforeend", itemHtml);
  });
}

async function puanGuncelle(urunIsmi, verilenPuan) {
  try {
    const res = await fetch("/api/menu");
    const menu = await res.json();

    // .trim() ekleyerek boşluklardan kaynaklanan eşleşmeme sorununu çözüyoruz
    const item = menu.find((m) => m.isim && m.isim.trim() === urunIsmi.trim());

    if (item) {
      let eskiPuan = parseFloat(item.puan) || 0;
      let yeniPuan = ((eskiPuan + verilenPuan) / 2).toFixed(1);

      // MongoDB'nin _id yapısını da destekleyecek şekilde ID'yi alıyoruz
      const itemId = item._id || item.id;

      await fetch(`/api/menu/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puan: yeniPuan }),
      });
    } else {
      console.warn(`Test/Uygulama: "${urunIsmi}" adlı ürün menüde bulunamadı!`);
    }
  } catch (e) {
    console.error("Puan güncellenemedi:", e);
  }
}

async function submitReviews() {
  const listDiv = document.getElementById("reviewProductList");
  const items = listDiv.querySelectorAll(".review-item");

  for (let i = 0; i < items.length; i++) {
    // .trim() ekliyoruz ki HTML'deki boşluklar veya enter tuşları hataya sebep olmasın
    const urunIsmi = items[i].querySelector("strong").innerText.trim();
    const checkedStar = items[i].querySelector(
      `input[name="rating-${i}"]:checked`,
    );

    if (checkedStar) {
      const verilenPuan = parseInt(checkedStar.value);
      await puanGuncelle(urunIsmi, verilenPuan);
    }
  }

  document.getElementById("paymentModal").style.display = "none";
  bildirimGoster("Değerlendirmeniz için teşekkürler! 🌟");

  // Give user time to see the notification before closing session
  setTimeout(() => {
    finalCloseSession();
  }, 1500);
}
async function finalCloseSession() {
  const sessionHash = localStorage.getItem("sessionHash");
  await oturumuKapat(sessionHash, secilenOdemeYontemi);
}

async function oturumuKapat(hash, yontem) {
  try {
    const response = await fetch("/api/session/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash: hash, odemeYontemi: yontem }),
    });

    if (response.ok) {
      localStorage.removeItem("sessionHash");
      localStorage.removeItem("cart");

      document.getElementById("paymentModal").style.display = "none";

      // Replaced alert() with native notification box
      bildirimGoster(`Ödeme ${yontem} ile alındı. Yine bekleriz!`);
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    }
  } catch (e) {
    console.error("Bağlantı hatası!", e);
    bildirimGoster("Bağlantı hatası oluştu.", "uyari");
  }
}

window.addEventListener("load", () => {
  renderCart();
});

// Conditional Export for Testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getSafeCart,
    addToCart,
    removeFromCart,
    clearCart,
    siparisVer,
    baslatOdemeSureci,
    handlePaymentSelection,
    submitReviews,
    oturumuKapat,
    renderCart,
  };
}
