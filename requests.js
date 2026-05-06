// Kutuyu açan ve içine mesajı yazan fonksiyon
function bildirimGoster(mesaj) {
  document.getElementById("bildirimMesaji").innerText = mesaj;
  // display = "flex" yapıyoruz ki kutu ekranın tam ortasına gelsin
  document.getElementById("bildirimKutusu").style.display = "flex";
}

// "Kapat" butonuna basılınca kutuyu gizleyen fonksiyon
function bildirimiKapat() {
  document.getElementById("bildirimKutusu").style.display = "none";
}

// YENİ: Talebi veritabanına gönderen fonksiyon
async function sendRequestToServer(talepMetni) {
  const sessionHash = localStorage.getItem("sessionHash");

  // Eğer müşteri QR kodu okutmadan bu sayfaya girdiyse uyar
  if (!sessionHash) {
    return false;
  }

  try {
    const response = await fetch("/api/session/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hashcode: sessionHash,
        talep: talepMetni,
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Talep gönderilemedi:", error);
    return false;
  }
}

function istekleriGoster() {
  fetch("/api/requests")
    .then((res) => res.json())
    .then((data) => {
      renderRequests(data);
    });
}

function renderRequests(istekler) {
  const requestList = document.getElementById("request-list");
  requestList.innerHTML = ""; // Önceki ekranı temizler

  istekler.forEach((item) => {
    let clone; // temiz şablon için

    if (item.id === 5 || item.istek.includes("Özel")) {
      const template = document.getElementById("special-request-template");
      clone = template.content.cloneNode(true);

      const buton = clone.querySelector(".request-button");
      const inputArea = clone.querySelector(".input-area");
      const gonderButonu = clone.querySelector(".gonderButonu");
      const input = clone.querySelector(".ozel-not");

      clone.querySelector(".request-text").innerText = "🔔 " + item.istek;

      buton.onclick = () => {
        inputArea.style.display =
          inputArea.style.display === "none" ? "block" : "none";
      };

      gonderButonu.onclick = async () => {
        let mesaj = input.value.trim();
        let gonderilecekMetin = mesaj ? `Özel İstek: ${mesaj}` : item.istek;

        // 1. Önce sunucuya gönder
        const basarili = await sendRequestToServer(gonderilecekMetin);

        // 2. Başarılıysa müşteriye bildirimi göster
        if (basarili) {
          let gosterilecekMesaj = mesaj
            ? "(Not: " + mesaj + ") isteğiniz garsonumuza iletilmiştir :)"
            : "İsteğiniz garsonumuza iletilmiştir :)";
          bildirimGoster(gosterilecekMesaj);
        } else {
          bildirimGoster(
            "Hata: Talep iletilemedi. Lütfen QR kodu okutarak giriş yaptığınızdan emin olun.",
          );
        }

        inputArea.style.display = "none";
        input.value = "";
      };
    } else {
      // Normal şablonu kopyala
      const template = document.getElementById("normal-request-template");
      clone = template.content.cloneNode(true);

      clone.querySelector(".request-text").innerText = "🔔 " + item.istek;

      clone.querySelector(".request-button").onclick = async () => {
        // 1. Önce sunucuya gönder
        const basarili = await sendRequestToServer(item.istek);

        // 2. Başarılıysa müşteriye bildir
        if (basarili) {
          bildirimGoster(
            "'" + item.istek + "' isteğiniz garsonumuza iletilmiştir :)",
          );
        } else {
          bildirimGoster(
            "Hata: Talep iletilemedi. Lütfen QR kodu okutarak giriş yaptığınızdan emin olun.",
          );
        }
      };
    }
    requestList.appendChild(clone);
  });
}

// Sayfa yüklendiği anda istekleri otomatik olarak getirir
window.addEventListener("load", function () {
  if (document.getElementById("request-list")) {
    istekleriGoster();
  }
});
