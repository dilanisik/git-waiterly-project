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

function istekleriGoster() {
  fetch("/api/requests")
    .then(res => res.json())
    .then(data => {
      renderRequests(data);
    });
}

function renderRequests(istekler){
  const requestList = document.getElementById("request-list");
  requestList.innerHTML = ""; // Önceki ekranı temizler

  istekler.forEach(item => {
  let clone; // temiz şablon için

     if(item.id===5){
      const template = document.getElementById("special-request-template");
      clone = template.content.cloneNode(true);

      const buton =clone.querySelector(".request-button");
      const inputArea = clone.querySelector(".input-area");
      const gonderButonu= clone.querySelector(".gonderButonu");
      const input = clone.querySelector(".ozel-not");

      clone.querySelector(".request-text").innerText = "🔔 " + item.istek;

        buton.onclick = () => {
            inputArea.style.display =inputArea.style.display === "none" ? "block" : "none";
        };
        gonderButonu.onclick = () => {
          let mesaj = input.value.trim();

          let gosterilecekMesaj = mesaj
            ? "(Not: " + mesaj + ") isteğiniz garsonumuza iletilmiştir :)"
            : "İsteğiniz garsonumuza iletilmiştir :)";

          bildirimGoster(gosterilecekMesaj);

          inputArea.style.display = "none";
          input.value = "";
        };
      } else {
          // Normal şablonu kopyala
          const template = document.getElementById("normal-request-template");
          clone = template.content.cloneNode(true);
          
          clone.querySelector(".request-text").innerText = "🔔 " + item.istek;
          clone.querySelector(".request-button").onclick = () => {
              bildirimGoster("'" + item.istek + "' isteğiniz garsonumuza iletilmiştir :)");
          };
      }
      requestList.appendChild(clone);
  });
}

// Sayfa yüklendiği anda istekleri otomatik olarak getirir
window.addEventListener('load', function() {
    if (document.getElementById("request-list")) {
        istekleriGoster();
    }
});