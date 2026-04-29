let menu = [];
let activeAllergensToAvoid = []; 
let isVeganOnly = false;

window.addEventListener("load", menuyuGoster);

function menuyuGoster() {
  fetch("/api/menu")
    .then((res) => {
        if(!res.ok) throw new Error("Sunucu menüyü göndermedi!");
        return res.json();
    })
    .then((data) => {
      menu = data;
      rendermenu();
    })
    .catch((err) => {
        console.error("HATA:", err);
        document.getElementById("menu-list").innerHTML = `<p style="color:red; font-weight:bold;">Menü yüklenirken bir hata oluştu.</p>`;
    });
}

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

function sepeteEkle(id, change) {
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
    document.getElementById(`qty-${id}`).innerText = getCartQuantity(id);
}

function rendermenu() {
  const menuList = document.getElementById("menu-list");
  menuList.innerHTML = "";

  menu.forEach((item) => {
    // Vegan Filtresi Kontrolü
    if (isVeganOnly && !item.vegan) return;

    // Alerjen Filtresi Kontrolü
    if (activeAllergensToAvoid.length > 0) {
        let hasAllergen = false;
        if (item.alerjenler) {
            hasAllergen = item.alerjenler.some(alerjen => activeAllergensToAvoid.includes(alerjen));
        }
        if (hasAllergen) return; 
    }

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
           <button onclick="sepeteEkle(${item.id}, -1)" style="padding: 5px 20px; font-size: 18px; border-color: #ff4c4c; color: #ff4c4c; font-weight:bold; cursor:pointer;">-</button>
           <span id="qty-${item.id}" style="font-weight: bold; font-size: 18px; width: 30px; text-align: center; color: #333;">${guncelMiktar}</span>
           <button onclick="sepeteEkle(${item.id}, 1)" style="padding: 5px 20px; font-size: 18px; border-color: #4CAF50; color: #4CAF50; font-weight:bold; cursor:pointer;">+</button>
       </div>
       ${veganBadge}
    `;

    menuList.appendChild(div);
  });

  if (menuList.innerHTML === "") {
    menuList.innerHTML = "<p style='color: #666;'>Seçtiğiniz filtrelere uygun ürün bulunamadı.</p>";
  }
}

// --- FİLTRE ÇEKMECESİ VE YENİ KUTUCUK (GRID) FONKSİYONLARI ---
function openFilterDrawer() {
  document.getElementById("filter-drawer").classList.add("open");
  document.getElementById("filter-overlay").style.display = "block";
}

function closeFilterDrawer() {
  document.getElementById("filter-drawer").classList.remove("open");
  document.getElementById("filter-overlay").style.display = "none";
}

// Vegan kartına tıklandığında
function toggleVegan(element) {
  isVeganOnly = !isVeganOnly;
  if (isVeganOnly) {
      element.classList.add("vegan-selected");
  } else {
      element.classList.remove("vegan-selected");
  }
  rendermenu(); // Tıklandığı an filtreyi uygula
}

// Alerjen kartlarına tıklandığında
function toggleAllergen(alerjen, element) {
  if (activeAllergensToAvoid.includes(alerjen)) {
      activeAllergensToAvoid = activeAllergensToAvoid.filter(a => a !== alerjen);
      element.classList.remove("allergen-selected");
  } else {
      activeAllergensToAvoid.push(alerjen);
      element.classList.add("allergen-selected");
  }
  rendermenu(); // Tıklandığı an filtreyi uygula
}

function clearFilters() {
  isVeganOnly = false;
  activeAllergensToAvoid = [];
  
  // Arayüzdeki seçimleri sıfırla
  document.getElementById("vegan-btn").classList.remove("vegan-selected");
  let allergenCards = document.querySelectorAll("#allergen-grid .filter-card");
  allergenCards.forEach(card => card.classList.remove("allergen-selected"));
  
  rendermenu();
  closeFilterDrawer();
}

// --- MODAL (BİLGİ EKRANI) FONKSİYONU ---
function openItemModal(id) {
  const item = menu.find((m) => m.id === id);
  if (!item) return;

  let veganModalIcon = item.vegan ? " 🌱" : "";

  document.getElementById("modal-img").src = item.resim;
  document.getElementById("modal-title").innerText = item.isim + veganModalIcon;
  document.getElementById("modal-rating").innerText = item.puan;
  document.getElementById("modal-price").innerText = item.fiyat + " TL";
  document.getElementById("modal-text").innerText = item.aciklama || "Bu ürün için açıklama bulunmuyor.";
  document.getElementById("modal-ingredients").innerText = (item.icerik && item.icerik.length > 0) ? item.icerik.join(", ") : "";

  const alerjenKutu = document.getElementById("modal-allergens-container");
  if (item.alerjenler && item.alerjenler.length > 0) {
    document.getElementById("modal-allergens").innerText = item.alerjenler.join(", ");
    alerjenKutu.style.display = "block";
  } else {
    alerjenKutu.style.display = "none";
  }

  document.getElementById("item-modal-overlay").style.display = "block";
}

function closeItemModal(event) {
  if (event && event.target.id !== "item-modal-overlay") return;
  document.getElementById("item-modal-overlay").style.display = "none";
}
