let menu = [];
let uniqueIngredients = [];
let selectedIngredients = new Set();
let excludedFromDB = []; // Admin panelinden gizlenen malzemeler

// 1. Verileri Çekme
async function fetchInitialData() {
    try {
        let menuRes = await fetch("/api/menu");
        if (menuRes.ok) {
            menu = await menuRes.json();
        }

        try {
            let excRes = await fetch("/api/ingredients");
            if (excRes.ok) {
                let excludedData = await excRes.json();
                excludedFromDB = excludedData
                    .filter(item => typeof item.isim === 'string')
                    .map(item => item.isim.toLocaleLowerCase('tr-TR').trim());
            }
        } catch (e) {
            console.warn("Yasaklı malzemeler tablosu henüz boş veya çekilemedi.");
        }

        extractIngredients();
        renderIngredients();

    } catch (err) {
        console.error("Veriler yüklenirken hata:", err);
        document.getElementById("ingredients-grid").innerHTML = "<p style='color:red;'>Bağlantı hatası: Lütfen sayfayı yenileyin.</p>";
    }
}

fetchInitialData();

// 2. Menüden Malzemeleri Çıkarma ve Filtreleme
function extractIngredients() {
    let allRawIngredients = new Set();
    
    // Tüm menüden içerikleri topla
    menu.forEach(item => {
        if (item.icerik && Array.isArray(item.icerik)) {
            item.icerik.forEach(ing => {
                if (typeof ing === 'string' && ing.trim() !== '') {
                    allRawIngredients.add(ing.trim());
                }
            });
        }
    });

    let rawArray = Array.from(allRawIngredients);

    // Kısıtlama Veritabanından gelenleri ÇIKART
    let validIngredients = rawArray.filter(ing => {
        if (typeof ing !== 'string') return false;
        let lowerIng = ing.toLocaleLowerCase('tr-TR').trim();
        let isExcluded = excludedFromDB.includes(lowerIng);
        return !isExcluded; 
    });

    // Alfabetik sıralama yapıyoruz
    uniqueIngredients = validIngredients.sort((a, b) => a.localeCompare(b, 'tr-TR'));
}

// 3. Malzemeleri Ekrana Çizme
function renderIngredients() {
    const grid = document.getElementById("ingredients-grid");
    grid.innerHTML = "";

    if (uniqueIngredients.length === 0) {
        grid.innerHTML = "<p style='color:#666;'>Şu an seçilebilecek içerik bulunmuyor.</p>";
        return;
    }

    uniqueIngredients.forEach(ing => {
        let div = document.createElement("div");
        div.className = "ingredient-card";
        
        let colors = ["4CAF50", "FF9800", "E91E63", "00BCD4", "9C27B0", "F44336"];
        let randomColor = colors[ing.length % colors.length];
        let genericPic = `https://placehold.co/100x100/eeeeee/${randomColor}?text=${ing.charAt(0)}&font=Montserrat`;

        div.innerHTML = `
            <img src="${genericPic}" class="ingredient-img" alt="${ing}">
            <div class="ingredient-name">${ing}</div>
        `;

        div.onclick = () => toggleIngredient(ing, div);
        grid.appendChild(div);
    });
}

function toggleIngredient(ingredient, element) {
    if (selectedIngredients.has(ingredient)) {
        selectedIngredients.delete(ingredient);
        element.classList.remove("selected");
    } else {
        selectedIngredients.add(ingredient);
        element.classList.add("selected");
    }
}

// 4. Seçilen Malzemelere Göre Ürünleri Gösterme
function showMatchingProducts() {
    if (selectedIngredients.size === 0) {
        alert("Lütfen en az bir malzeme seçin.");
        return;
    }

    const matchedList = document.getElementById("matched-menu-list");
    matchedList.innerHTML = "";

    const matchingProducts = menu.filter(item => {
        if (!item.icerik || !Array.isArray(item.icerik)) return false;
        
        // Müşterinin seçtiği TÜM malzemeler bu ürünün içinde var mı kontrol et
        let lowerItemIngs = item.icerik
            .filter(i => typeof i === 'string')
            .map(i => i.toLocaleLowerCase('tr-TR').trim());
            
        return Array.from(selectedIngredients).every(selected => {
            return lowerItemIngs.includes(selected.toLocaleLowerCase('tr-TR').trim());
        });
    });

    if (matchingProducts.length === 0) {
        matchedList.innerHTML = "<p style='color:red; text-align:center;'>Bu içeriklere sahip ürün bulunamadı.</p>";
    } else {
        matchingProducts.forEach(item => renderMenuItem(item, matchedList));
    }

    document.getElementById("products-modal-overlay").style.display = "block";
}

function closeProductsModal(event) {
    if (event && event.target.id !== "products-modal-overlay") return;
    document.getElementById("products-modal-overlay").style.display = "none";
}

// 5. Ürün Kartını Çizme
function renderMenuItem(item, container) {
    let guncelMiktar = getCartQuantity(item.id);
    let div = document.createElement("div");
    div.className = "menu-item";
    
    div.onclick = () => openItemModal(item.id);

    let veganBadge = item.vegan ? `
      <div style="text-align: right; margin-top: 10px;">
        <span style="font-size: 12px; background: #e8f5e9; color: #2e7d32; padding: 3px 10px; border-radius: 12px; font-weight: bold; border: 1px solid #a5d6a7;">🌱 Vegan</span>
      </div>` : "";

    div.innerHTML = `
       <div class="menu-item-top">
           <div style="flex: 1;">
               <div style="font-weight: bold; font-size: 19px; color: #333; margin-bottom: 2px;">
                   ${item.isim}
               </div>
               <div style="font-size: 13px; color: #888; margin-bottom: 8px; line-height: 1.2;">${item.aciklama || ""}</div>
               <div style="font-weight: bold; color: #4CAF50; font-size: 16px;">${item.fiyat} TL</div>
           </div>
           <img src="${item.resim}" class="item-thumbnail" alt="${item.isim}">
       </div>
       
       <div class="item-controls" onclick="event.stopPropagation()">
           <button onclick="handleAddToCartFromIngredients(${item.id}, -1)" style="padding: 5px 20px; font-size: 18px; border-color: #ff4c4c; color: #ff4c4c; font-weight:bold; cursor:pointer;">-</button>
           <span id="qty-ing-${item.id}" style="font-weight: bold; font-size: 18px; width: 30px; text-align: center; color: #333;">${guncelMiktar}</span>
           <button onclick="handleAddToCartFromIngredients(${item.id}, 1)" style="padding: 5px 20px; font-size: 18px; border-color: #4CAF50; color: #4CAF50; font-weight:bold; cursor:pointer;">+</button>
       </div>
       ${veganBadge}
    `;

    container.appendChild(div);
}

// 6. Ürün Detay Modalı İşlemleri
function openItemModal(id) {
    const item = menu.find((m) => m.id === id);
    if (!item) return;

    let veganModalIcon = item.vegan ? " 🌱" : "";

    document.getElementById("modal-img").src = item.resim;
    document.getElementById("modal-title").innerText = item.isim + veganModalIcon;
    document.getElementById("modal-rating").innerText = item.puan || "Yorum Yok";
    document.getElementById("modal-price").innerText = item.fiyat + " TL";
    document.getElementById("modal-text").innerText = item.aciklama || "Bu ürün için açıklama bulunmuyor.";
    
    let icerikMetni = (item.icerik && Array.isArray(item.icerik)) ? item.icerik.join(", ") : "";
    document.getElementById("modal-ingredients").innerText = icerikMetni;

    const alerjenKutu = document.getElementById("modal-allergens-container");
    if (item.alerjenler && Array.isArray(item.alerjenler) && item.alerjenler.length > 0) {
        document.getElementById("modal-allergens").innerText = item.alerjenler.join(", ");
        alerjenKutu.style.display = "block";
    } else {
        alerjenKutu.style.display = "none";
    }

    document.getElementById("product-info-overlay").style.display = "block";
}

function closeItemModal(event) {
    if (event && event.target.id !== "product-info-overlay") return;
    document.getElementById("product-info-overlay").style.display = "none";
}

// 7. Sepet İşlemleri
function getSafeCart() {
    try {
        let cart = JSON.parse(localStorage.getItem("cart"));
        if (!Array.isArray(cart)) return [];
        return cart;
    } catch (e) {
        return [];
    }
}

function getCartQuantity(id) {
    let cart = getSafeCart();
    let item = cart.find(c => c.id === id);
    return item ? item.quantity : 0;
}

function handleAddToCartFromIngredients(id, change) {
    let cart = getSafeCart();
    let existingItem = cart.find(c => c.id === id);

    if (change > 0) {
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            let menuItem = menu.find(m => m.id === id);
            cart.push({ ...menuItem, quantity: 1 });
        }
    } else if (change < 0 && existingItem) {
        existingItem.quantity -= 1;
        if (existingItem.quantity <= 0) {
            cart = cart.filter(c => c.id !== id);
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    document.getElementById(`qty-ing-${id}`).innerText = getCartQuantity(id);
}
