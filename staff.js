// Sayfa yüklendiğinde masaları çek ve her 5 saniyede bir güncelle
window.addEventListener("DOMContentLoaded", () => {
  fetchData();
  setInterval(fetchData, 5000); // Gerçek zamanlı hissi için 5 saniyede bir yeniler
});

let allSessions = [];

async function fetchData() {
  try {
    // 1. Masaları ve Aktif Oturumları Çek
    const tablesRes = await fetch("/api/tables");
    const tables = await tablesRes.json();

    const sessionsRes = await fetch("/api/sessions");
    const sessions = await sessionsRes.json();

    // Sadece aktif oturumları filtrele
    allSessions = sessions.filter((s) => s.durum === "aktif");

    renderTables(tables);
  } catch (error) {
    console.error("Veri çekilemedi:", error);
  }
}

function renderTables(tables) {
  const grid = document.getElementById("table-grid");
  grid.innerHTML = ""; // Temizle

  tables.forEach((table) => {
    const session = allSessions.find((s) => s.masaNo === table.masaNo);
    const hasRequest =
      session && session.talepler && session.talepler.length > 0;

    let requestsHTML = "";
    if (hasRequest) {
      const badges = session.talepler
        .map((t) => `<span class="req-badge">${t}</span>`)
        .join("");
      requestsHTML = `
            <div class="card-requests">
                ${badges}
            </div>
        `;
    }

    const card = document.createElement("div");
    card.className = `table-card ${session ? "status-active" : "status-empty"} ${hasRequest ? "has-request" : ""}`;

    // YENİ: 4 adet sandalye HTML'i masanın etrafına yerleştiriliyor!
    card.innerHTML = `
        <div class="chair chair-v chair-top"></div>
        <div class="chair chair-v chair-bottom"></div>
        <div class="chair chair-h chair-left"></div>
        <div class="chair chair-h chair-right"></div>
        
        <div class="ping"></div>
        <h2>${table.masaNo}</h2>
        <p style="font-weight: 600; color: ${session ? "var(--green-dark)" : "#94a3b8"}; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            ${session ? "Dolu" : "Boş"}
        </p>
        ${session ? `<p style="font-size: 20px; font-weight: 700; margin-top: 8px; color: var(--black);">${session.genelToplam} ₺</p>` : ""}
        ${requestsHTML}
    `;

    // Tıklanınca popup aç
    card.onclick = () => openModal(table.masaNo, session);
    grid.appendChild(card);
  });
}
function openModal(masaNo, session) {
  document.getElementById("modal-table-title").innerText =
    `Masa ${masaNo} - Detaylar`;
  const unconfirmedDiv = document.getElementById("unconfirmed-orders");
  const confirmedDiv = document.getElementById("confirmed-orders");
  const reqDiv = document.getElementById("modal-requests");

  unconfirmedDiv.innerHTML = "";
  confirmedDiv.innerHTML = "";
  reqDiv.innerHTML = "";

  if (!session) {
    unconfirmedDiv.innerHTML = "<p>Bu masa şu an boş.</p>";
    confirmedDiv.innerHTML = "<p>Bu masa şu an boş.</p>";
  } else {
    // Bekleyen talepleri göster (Butonlu Versiyon)
    if (session.talepler && session.talepler.length > 0) {
      let reqList = session.talepler
        .map(
          (talep) => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff0f1; padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #ff4757;">
            <span style="color: #ff4757; font-weight: bold;">${talep}</span>
            <button onclick="confirmRequest('${session.hashcode}', '${talep}')" style="background: #ff4757; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: 0.2s;">Tamamlandı ✓</button>
        </div>
      `,
        )
        .join("");

      reqDiv.innerHTML = `<h3 style="margin-top: 0; color: #ff4757;">🔔 Bekleyen Talepler</h3>${reqList}`;
    }

    // Siparişleri listele ve ayır
    if (session.siparisler && session.siparisler.length > 0) {
      session.siparisler.forEach((siparis, index) => {
        let urunlerHTML =
          siparis.urunler && siparis.urunler.length > 0
            ? siparis.urunler
                .map(
                  (u) => `<li>${u.quantity}x <strong>${u.isim}</strong></li>`,
                )
                .join("")
            : "<li>Ürün detayı bulunamadı.</li>";

        // Siparişin durumuna göre kart oluştur
        const isConfirmed = siparis.durum === "onaylandı";
        const orderHTML = `
            <div class="order-item" style="background: white; border-left: 4px solid ${isConfirmed ? "#2ed573" : "#ff4757"};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong>${index + 1}. Sipariş</strong>
                    <span style="color: #666;">🕒 ${siparis.zaman}</span>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #2f3542;">
                    ${urunlerHTML}
                </ul>
                <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                    ${
                      !isConfirmed
                        ? `<button class="confirm-btn" onclick="confirmOrder('${session.hashcode}', ${index})">Siparişi Al (Onayla)</button>`
                        : `<span style="color: #2ed573; font-weight: bold;">✓ Sipariş Alındı / Hazırlanıyor</span>`
                    }
                </div>
            </div>
        `;

        // Durum "onaylandı" ise sağa, değilse sola at
        if (isConfirmed) {
          confirmedDiv.innerHTML += orderHTML;
        } else {
          unconfirmedDiv.innerHTML += orderHTML;
        }
      });

      // Eğer kolonlar boş kaldıysa bilgi mesajı yazdır
      if (unconfirmedDiv.innerHTML === "")
        unconfirmedDiv.innerHTML =
          "<p style='color:#747d8c; font-style:italic;'>Bekleyen yeni sipariş yok.</p>";
      if (confirmedDiv.innerHTML === "")
        confirmedDiv.innerHTML =
          "<p style='color:#747d8c; font-style:italic;'>Henüz onaylanan sipariş yok.</p>";
    } else {
      unconfirmedDiv.innerHTML = "<p>Sipariş yok.</p>";
      confirmedDiv.innerHTML = "<p>Sipariş yok.</p>";
    }
  }

  document.getElementById("order-modal").style.display = "flex";
}

// Waiter "Siparişi Al" butonuna bastığında çalışır
async function confirmOrder(hashcode, index) {
  try {
    await fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hashcode: hashcode, orderIndex: index }),
    });

    // Modalı anlık kapatıp verileri yeniliyoruz ki sipariş anında sağ sütuna geçsin
    document.getElementById("order-modal").style.display = "none";
    await fetchData();
  } catch (error) {
    console.error("Sipariş onaylanamadı:", error);
  }
}
// Waiter "Tamamlandı" butonuna bastığında çalışır
async function confirmRequest(hashcode, talep) {
  try {
    await fetch("/api/session/request/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hashcode: hashcode, talep: talep }),
    });

    // Modalı anlık kapatıp verileri yeniliyoruz ki rozet ekrandan silinsin
    document.getElementById("order-modal").style.display = "none";
    await fetchData();
  } catch (error) {
    console.error("Talep onaylanamadı:", error);
  }
}

function closeModal(event, forceClose = false) {
  if (
    forceClose ||
    (event && event.target && event.target.id === "order-modal")
  ) {
    document.getElementById("order-modal").style.display = "none";
  }
}

// Güvenli Çıkış Fonksiyonu
async function logout() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch (error) {
    console.error("Çıkış yapılırken hata:", error);
  }
  // Her halükarda login sayfasına yönlendir
  window.location.href = "/login.html";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fetchData,
    renderTables,
    openModal,
    confirmOrder, // for staff.js
    toggleIngredient,
    renderIngredients, // for ingredients.js
  };
}
