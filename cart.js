// cart.js - Menü ile %100 Uyumlu Versiyon

function getSafeCart() {
    try {
        let c = JSON.parse(localStorage.getItem("cart"));
        if (!Array.isArray(c)) return [];
        // quantity her zaman sayı olsun; undefined/null/NaN gelirse filtrele
        return c
            .map(item => ({ ...item, quantity: Number(item.quantity) || 0 }))
            .filter(item => item.quantity > 0);
    } catch(e) {
        return [];
    }
}

let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];

function bildirimGoster(mesaj){
    document.getElementById("bildirimMesaji").innerText = mesaj;
    document.getElementById("bildirimKutusu").style.display = "flex";
}

function bildirimiKapat() {
    document.getElementById("bildirimKutusu").style.display = "none";
}

function siparisVer(){
    let cart = getSafeCart();
    if(cart.length === 0) {
        alert("Sepetiniz boş! Lütfen menüden ürün ekleyin.");
        return;
    }

    let currentOrder = {
        zaman : new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute:'2-digit'}),
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

    // Geçmişe kaydet ve sepeti sıfırla
    orderHistory.push(currentOrder);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
    localStorage.removeItem("cart");

    document.getElementById("bildirimMesaji").innerHTML = "Siparişiniz başarıyla alındı! 😋<br>Ana sayfadan fişinize bakabilirsiniz.";
    document.getElementById("bildirimKutusu").style.display = "flex";

    renderCart();
}

function renderCart() {
    let cart = getSafeCart();
    const list = document.getElementById("cart-list");
    list.innerHTML = "";

    if (cart.length === 0) {
        list.innerHTML = "<p style='color: gray; font-style: italic; margin-top:20px;'>Sepetinizde henüz ürün yok.</p>";
        return;
    }

    cart.forEach(item => {
        let div = document.createElement("div");
        div.style = "margin: 10px auto; padding: 15px; border: 1px solid #ddd; border-radius: 8px; width: 90%; max-width: 450px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;";

        let infoDiv = document.createElement("div");
        infoDiv.style.textAlign = "left";
        infoDiv.innerHTML = `<strong style="font-size: 16px; color:#333;">${item.isim}</strong><br><span style="color: #4CAF50; font-weight: bold;">${item.fiyat * item.quantity} TL</span>`;

        let controlsDiv = document.createElement("div");
        controlsDiv.style.display = "flex";
        controlsDiv.style.alignItems = "center";
        
        controlsDiv.innerHTML = `
            <button onclick="removeFromCart(${item.id})" style="padding: 5px 15px; font-size: 18px; border: 1px solid #ff4c4c; color: #ff4c4c; border-radius:5px; background:white; cursor:pointer;">-</button>
            <span style="font-weight: bold; font-size: 18px; width: 35px; text-align:center;">${item.quantity}</span>
            <button onclick="addToCart(${item.id})" style="padding: 5px 15px; font-size: 18px; border: 1px solid #4CAF50; color: #4CAF50; border-radius:5px; background:white; cursor:pointer;">+</button>
        `;

        div.appendChild(infoDiv);
        div.appendChild(controlsDiv);
        list.appendChild(div);
    });
}

function addToCart(id) {
    let cart = getSafeCart();
    let item = cart.find(c => c.id === id);
    if (item) {
        item.quantity++;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

function removeFromCart(id) {
    let cart = getSafeCart();
    let item = cart.find(c => c.id === id);
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) cart = cart.filter(c => c.id !== id);
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

function renderHistory() {
    const historySection = document.getElementById("history-section");
    const historyList = document.getElementById("history-list");
    const totalSpentEl = document.getElementById("total-spent");

    if (orderHistory.length === 0) {
        historySection.style.display = "none";
        return;
    }

    historySection.style.display = "block";
    historyList.innerHTML = "";
    let overallTotal = 0;

    orderHistory.forEach(order => {
        let div = document.createElement("div");
        div.style = "text-align: left; margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;";

        let orderTitle = document.createElement("div");
        orderTitle.innerHTML = `<span style="color: #666; font-size: 13px;">⏱️ ${order.zaman}</span>`;
        div.appendChild(orderTitle);

        let itemsText = order.urunler.map(u => {
            if (typeof u === "string") return u;
            const qty = Number(u.quantity) || 1;
            const isim = u.isim || "Ürün";
            return `${qty}x ${isim}`;
        }).join(", ");
        let itemsDiv = document.createElement("div");
        itemsDiv.style = "font-weight: bold; font-size: 15px; color: #333; margin-top: 5px;";
        itemsDiv.innerText = itemsText;
        div.appendChild(itemsDiv);

        let totalDiv = document.createElement("div");
        totalDiv.style = "color: #4CAF50; font-weight: bold; margin-top: 5px;";
        totalDiv.innerText = `Tutar: ${order.toplamTutar} TL`;
        div.appendChild(totalDiv);

        overallTotal += order.toplamTutar;
        historyList.appendChild(div);
    });

    totalSpentEl.innerText = overallTotal;
}

window.addEventListener("load", () => {
    renderCart();
    renderHistory();
});