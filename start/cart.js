//hafızadan verileri çekiyoruz, geçmiş yoksa boş liste açıyoruz
let cart = JSON.parse(localStorage.getItem("cart")) || {};
let orderHistory= JSON.parse(localStorage.getItem("orderHistory")) || [];

//bildirim kutusu fonksiyonları
function bildirimGoster(mesaj){
    document.getElementById("bildirimMesaji").innerText = mesaj;
    document.getElementById("bildirimKutusu").style.display = "flex";
}

function bildirimiKapat() {
    document.getElementById("bildirimKutusu").style.display = "none";
}

// sipariş verme işlemi
function siparisVer(){
    if(Object.keys(cart).length=== 0) {
        bildirimGoster("Sepetin boşşşşşş Bişi ekle!");
        return;
    }

    let currentOrder = {
        zaman : new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute:'2-digit'}),
        urunler: [],
        toplamTutar: 0
    };
 //sepetteki her şeyi pskete doldur ve fiyatı hesapla
    for (let key in cart) {
        let item = cart[key];
        currentOrder.urunler.push(`${item.quantity}x ${item.isim}`);
        currentOrder.toplamTutar += (item.fiyat * item.quantity);
    }
 // sepeti geçmişe ekle ve kaydet
    orderHistory.push(currentOrder);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
 // sepeti boşalt ve kaydet
    cart = {}
    localStorage.setItem("cart", JSON.stringify(cart));
 //ekranı sayfa yenilemeden güncelle ve başarı mesajı ver
    renderCart();
    renderHistory();
    bildirimGoster("Siparişiniz mutfağa ulaştı! 👨‍🍳");
}

// ------ geçmişi ekrana çizme----------
function renderHistory(){
    const historySection = document.getElementById("history-section");
    const historyList = document.getElementById("history-list");
    const totalSpentSpan = document.getElementById("total-spent");

 // eğer bu fonk başka sayfada yanlışklıkla açılırsa hata vermesin diye güvenlik kilidi
    if (!historySection) return;
 // geçmiş boşsa kutuyu gizle
    if (orderHistory.length === 0){
       historySection.style.display = "none";
       return;
    }

    historySection.style.display = "block";
    historyList.innerHTML = ""; // TEMİZLEME
    let grandTotal=0;

    //her siparişi alt alta yaz
    orderHistory.forEach ((order,index) => {
        grandTotal += order.toplamTutar;

        let div = document.createElement("div");
        div.style = "text-align: left; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;";
        
        div.innerHTML = `
            <span style="font-size: 12px; color: #888;">⏱️ ${order.zaman}</span><br>
            <span style="font-weight: bold; color: #333;">${order.urunler.join(", ")}</span><br>
            <span style="color: #4CAF50; font-size: 14px; font-weight: bold;">Tutar: ${order.toplamTutar} TL</span>
        `;
        historyList.appendChild(div);
    });
    totalSpentSpan.innerText = grandTotal;
}

function renderCart(){
    let list = document.getElementById("cart-list");
    if (!list) return ; // başka sayfadaysak hop dur

    list.innerHTML = ""; //ekrani sil foşur foşur
    let baslik = document.createElement("h2");
    baslik.innerText = "Sipariş Sepeti:";
    list.appendChild(baslik);

    if( Object.keys(cart).length === 0) {
        list.innerHTML += "<p style='color: gray; font-style: italic;'>Sepetiniz şu an boş.</p>";
        return;
    }

    for (let key in cart) {
        let div = document.createElement("div");
        div.style = "margin: 10px 0; font-size: 16px;";
        div.innerText =`${cart[key].isim} x ${cart[key].quantity} ------------ (${cart[key].fiyat * cart[key].quantity} TL)`;
        list.appendChild(div);
    }
}


function addToCart(id) {
    const item = menu.find(m => m.id === id);
    if (!item) return;

    if (cart[id]) {
        cart[id].quantity++;
    } else {
        cart[id] = { isim: item.isim, fiyat: item.fiyat, quantity: 1 };
    }
    localStorage.setItem("cart", JSON.stringify(cart));
}

function removeFromCart(id) {
    if (cart[id]) {
        cart[id].quantity--;
        if (cart[id].quantity <= 0) {
            delete cart[id];
        }
    }
    localStorage.setItem("cart", JSON.stringify(cart));
}

function goToCart() {
    window.location.href = "cart.html";
}

// Sepeti temizle butonuna basınca sadece uyarı kutusunu göster
function clearCart() {
    if (Object.keys(cart).length === 0) {
        
        // Sadece küçük bir uyarı mesajı ver ve kutuyu GÖSTERME
        alert("Sepetiniz zaten boş! 🛒");
        
    } else {
    document.getElementById("onayKutusu").style.display = "block";
    }
}

// "Hayır" butonuna basınca kutuyu tekrar gizle
function sepetiSilHayir() {
    document.getElementById("onayKutusu").style.display = "none";
}

// "Evet" butonuna basınca asıl silme işlemini yap
function sepetiSilEvet() {
    cart = {}; 
    localStorage.removeItem("cart"); 
    window.location.reload();
}