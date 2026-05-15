window.onload = function() {
    fisDinamikDoldur();
};  

function fisDinamikDoldur() {
    // 1. Verileri Hafızadan Al
    const history = JSON.parse(localStorage.getItem("orderHistory")) || [];
    const bodyAlan = document.getElementById("fis-body");
    const toplamLabel = document.getElementById("toplam-tutar");

    if (history.length === 0) {
        bodyAlan.innerHTML = "<p style='text-align:center; color:gray;'>Henüz sipariş yok.</p>";
        return;
    }

    bodyAlan.innerHTML = ""; // İçini temizle
    let genelToplam = 0;

    // 2. Siparişleri Tek Tek İşle
    history.forEach((siparis, index) => {
        genelToplam += siparis.toplamTutar;

        // Her sipariş grubu için bir başlık (Örn: Sipariş #1)
        const grupBaslik = document.createElement("div");
        grupBaslik.className = "kategori-baslik";
        grupBaslik.innerText = `SİPARİŞ #${index + 1} - ${siparis.zaman}`;
        bodyAlan.appendChild(grupBaslik);

        // Siparişin içindeki her ürünü fişe ekle
        siparis.urunler.forEach(urunText => {
            // urunText formatı: "1x Hamburger"
            const satir = document.createElement("div");
            satir.className = "fis-satir";
            
            // Ürün adı ve miktarını ayırabilir veya direkt yazabilirsin
            satir.innerHTML = `
                <span>${urunText}</span>
                <span>..........</span> 
            `;
            bodyAlan.appendChild(satir);
        });
    });

    // 3. Toplamı Güncelle
    toplamLabel.innerText = genelToplam.toFixed(2) + " TL";
}