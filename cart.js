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

  if (tip === "uyari") {
    baslik.innerHTML = "⚠️ Uyarı";
    baslik.style.color = "#ff9800";
    buton.style.backgroundColor = "#ff9800";
    buton.innerText = "Tamam";
  } else {
    baslik.innerHTML = "✅ Başarılı!";
    baslik.style.color = "#4CAF50";
    buton.style.backgroundColor = "#4CAF50";
    buton.innerText = "Harika!";
  }

  document.getElementById("bildirimKutusu").style.display = "flex";
}

function bildirimiKapat() {
  document.getElementById("bildirimKutusu").style.display = "none";
}

async function renderCart() {
  const list = document.getElementById("cart-list");
  if (!list) return;

  list.innerHTML = "<p style='text-align: center;'>Adisyon Yükleniyor...</p>";

  let cart = getSafeCart();
  let sessionSiparisler = [];
  let dbGenelToplam = 0;

  const sessionHash = localStorage.getItem("sessionHash");
  if (sessionHash) {
    try {
      const res = await fetch("/api/session/current?hash=" + sessionHash);
      if (res.ok) {
        const data = await res.json();
        sessionSiparisler = data.siparisler || [];
        dbGenelToplam = data.genelToplam || 0;

        // Değerlendirme ekranı için siparişleri belleğe alıyoruz
        sessionSiparislerInceleme = sessionSiparisler;
      }
    } catch (e) {
      console.warn("Sipariş geçmişi çekilemedi:", e);
    }
  }

  let html = "";
  let sepetToplam = 0;

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
                
                <div class="cart-controls">
                    <button onclick="removeFromCart('${item._id || item.id}')" style="border-color: #ff4c4c; color: #ff4c4c;">-</button>
                    <span style="font-size: 16px; width: 25px; text-align: center; color:#333;">${item.quantity}</span>
                    <button onclick="addToCart('${item._id || item.id}')" style="border-color: #4CAF50; color: #4CAF50;">+</button>
                </div>
            </div>`;
    });
  }

  if (sessionSiparisler.length === 0 && cart.length === 0) {
    list.innerHTML =
      "<p style='color: gray; font-style: italic; text-align: center; margin-top:20px;'>Adisyonunuz şu an boş.</p>";
    return;
  }

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
  document.getElementById("paymentModal").style.display = "flex";
  document.getElementById("paymentStep").style.display = "block";

  // Güvenlik: Puanlama ekranını ve varsa eski dinamik ekranları gizle
  const reviewStep = document.getElementById("reviewStep");
  if (reviewStep) reviewStep.style.display = "none";
  const dynamicScreens = document.getElementById("dynamicScreens");
  if (dynamicScreens) dynamicScreens.style.display = "none";
}

async function handlePaymentSelection(yontem) {
  secilenOdemeYontemi = yontem;
  document.getElementById("paymentStep").style.display = "none";

  // Değerlendirme ekranında kullanılacak fotoğrafları arka planda çekiyoruz
  try {
    const menuRes = await fetch("/api/menu");
    if (menuRes.ok) {
      menuVerileriCache = await menuRes.json();
    }
  } catch (e) {
    console.error("Menü resimleri için veri çekilemedi:", e);
  }

  // Değerlendirme adımını tamamen sona saklıyor, direkt garson bekleme sürecini başlatıyoruz!
  await finalCloseSession();
}

async function finalCloseSession() {
  const sessionHash = localStorage.getItem("sessionHash");
  const yontem = secilenOdemeYontemi;

  try {
    // Garsona bildirim iletiyoruz
    await fetch("/api/session/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hashcode: sessionHash,
        talep: `${yontem.toUpperCase()} ile ödeme talebi`,
      }),
    });
  } catch (e) {
    console.error("Bildirim hatası:", e);
  }

  // Direkt bekleme ekranına geçiş yap
  await oturumuKapat(sessionHash, yontem);
}

async function oturumuKapat(hash, yontem) {
  const paymentStep = document.getElementById("paymentStep");
  if (paymentStep) paymentStep.style.display = "none";
  const reviewStep = document.getElementById("reviewStep");
  if (reviewStep) reviewStep.style.display = "none";

  const modalCard = document.querySelector("#paymentModal .modal-card");

  // Önceki HTML yapısını bozmadan (ReviewStep'i silmeden) animasyonlu ekranlarımızı içeri ekliyoruz
  let dynamicScreens = document.getElementById("dynamicScreens");
  if (!dynamicScreens) {
    dynamicScreens = document.createElement("div");
    dynamicScreens.id = "dynamicScreens";
    modalCard.appendChild(dynamicScreens);
  }

  dynamicScreens.style.display = "block";
  dynamicScreens.innerHTML = `
    <div id="waitingScreen" style="text-align: center; padding: 20px 0;">
      <h3 style="color: #ff9800; margin-top: 0; font-size: 24px;">⏳ Garson Bekleniyor...</h3>
      <p style="color: #666; margin-bottom: 20px;">Lütfen <strong>${yontem}</strong> ödemenizi garsona iletin. Ödeme onaylandığında yönlendirileceksiniz.</p>
      <div style="margin: 30px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff9800; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    </div>

    <div id="successScreen" style="display: none; text-align: center; padding: 20px 0;">
      <div style="font-size: 72px; margin-bottom: 20px; animation: popIn 0.5s ease-out;">✅</div>
      <h2 style="color: #4CAF50; margin-top: 0; font-size: 28px;">Ödeme Onaylandı</h2>
      <p style="color: #666; font-size: 16px;">Bizi tercih ettiğiniz için teşekkür ederiz!</p>
      <style>@keyframes popIn { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }</style>
    </div>
  `;
  document.getElementById("paymentModal").style.display = "flex";

  // Polling süresi: 1.5 saniye (Çok hızlı tepki)
  const checkInterval = setInterval(async () => {
    try {
      const res = await fetch("/api/session/current?hash=" + hash);
      let data = null;
      if (res.ok) data = await res.json();

      // GARSON ÖDEMEYİ ONAYLADIĞINDA:
      if (!res.ok || !data || !data._id) {
        clearInterval(checkInterval);

        // 1. Bekleme ekranını kapat, Başarı (Yeşil Tik) ekranını aç
        document.getElementById("waitingScreen").style.display = "none";
        document.getElementById("successScreen").style.display = "block";

        // Verileri temizle
        localStorage.removeItem("sessionHash");
        localStorage.removeItem("cart");

        // 2. Yeşil tiki 3 saniye gösterdikten sonra Puanlama (Review) ekranına geç
        setTimeout(async () => {
          if (
            sessionSiparislerInceleme &&
            sessionSiparislerInceleme.length > 0
          ) {
            document.getElementById("dynamicScreens").style.display = "none";
            await urunListesiniDoldur();
            document.getElementById("reviewStep").style.display = "block";

            // "Puanlamadan Geç" butonunu ayarla
            const skipBtn = document.querySelector(
              "#reviewStep button:last-child",
            );
            if (skipBtn) {
              skipBtn.onclick = () => (window.location.href = "/");
            }
          } else {
            // Eğer sipariş yoksa direkt anasayfaya at
            window.location.href = "/";
          }
        }, 3000);
      }
    } catch (e) {
      console.error("Bağlantı hatası bekleniyor...", e);
    }
  }, 1500);
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
    const menuItem = menuVerileriCache.find((m) => m.isim === product.isim);
    const photoUrl =
      menuItem && menuItem.resim ? menuItem.resim : "/images/placeholder.png";

    const itemHtml = `
            <div class="review-item">
                <img src="${photoUrl}" alt="${product.isim}" class="review-img" onerror="this.src='/images/placeholder.png'">
                <div class="review-info" style="text-align: left;">
                    <strong style="display: block; margin-bottom: 5px;">${product.isim}</strong>
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

    const item = menu.find((m) => m.isim && m.isim.trim() === urunIsmi.trim());

    if (item) {
      let eskiPuan = parseFloat(item.puan) || 0;
      let yeniPuan = ((eskiPuan + verilenPuan) / 2).toFixed(1);
      const itemId = item._id || item.id;

      await fetch(`/api/menu/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puan: yeniPuan }),
      });
    }
  } catch (e) {
    console.error("Puan güncellenemedi:", e);
  }
}

async function submitReviews() {
  const listDiv = document.getElementById("reviewProductList");
  const items = listDiv.querySelectorAll(".review-item");

  for (let i = 0; i < items.length; i++) {
    const urunIsmi = items[i].querySelector("strong").innerText.trim();
    const checkedStar = items[i].querySelector(
      `input[name="rating-${i}"]:checked`,
    );

    if (checkedStar) {
      const verilenPuan = parseInt(checkedStar.value);
      await puanGuncelle(urunIsmi, verilenPuan);
    }
  }

  // Değerlendirme bittikten sonra "Teşekkürler" mesajı göster ve eve dön
  document.getElementById("reviewStep").innerHTML = `
     <div style="text-align: center; padding: 40px 10px;">
        <div style="font-size: 60px; margin-bottom: 15px; animation: popIn 0.5s ease-out;">🌟</div>
        <h2 style="color: #4CAF50; margin-top: 0; font-size: 26px;">Değerlendirmeniz için teşekkürler!</h2>
        <p style="color: #666; font-size: 16px;">Düşünceleriniz bizim için çok değerli.</p>
     </div>
  `;

  setTimeout(() => {
    window.location.href = "/";
  }, 2000);
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
