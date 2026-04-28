let menu = [];
let activeAllergensToAvoid = []; 
let isVeganOnly = false; // YENİ: Vegan filtresi durumu
let activeIngredientsToInclude = []; // YENİ: Seçilen içerikler

function menuyuGoster() {
  fetch("/api/menu")
    .then((res) => {
        if(!res.ok) throw new Error("Sunucu menüyü göndermedi!");
        return res.json();
    })
    .then((data) => {
      menu = data;
      populateIngredientDrawer(); // YENİ: İçerikleri tara ve listeyi oluştur
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

function rendermenu() {
  const menuList = document.getElementById("menu-list");
  menuList.innerHTML = "";

  menu.forEach((item) => {
    // VEGAN FİLTRESİ KONTROLÜ
    if (isVeganOnly && !item.vegan) {
        return; // Sadece vegan seçiliyse ve ürün vegan değilse atla (çizme)
    }

    // ALERJEN FİLTRESİ KONTROLÜ
    if (activeAllergensToAvoid.length > 0 && item.alerjenler) {
      const containsForbiddenAllergen = item.alerjenler.some((alerjen) =>
        activeAllergensToAvoid.includes(alerjen),
      );
      if (containsForbiddenAllergen) return;
    }

    // İÇERİK FİLTRESİ KONTROLÜ
    if (activeIngredientsToInclude.length > 0 && item.icerik) {
      // Seçilen TÜM içeriklerin bu üründe olmasını istiyorsak 'every' kullanıyoruz.
      // Sadece 1 tanesinin olması yeterliyse 'some' ile değiştirebilirsiniz.
      const hasRequiredIngredients = activeIngredientsToInclude.every((reqIng) =>
        item.icerik.some((itemIng) => itemIng.trim() === reqIng)
      );
      if (!hasRequiredIngredients) return;
    }

    let guncelMiktar = getCartQuantity(item.id);
    let div = document.createElement("div");
    div.className = "menu-item";
    div.onclick = () => openItemModal(item.id);

    // Eğer ürün vegansa kartın sağ altına rozet ekle
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
           <button onclick="handleRemoveFromCart(${item.id})" style="padding: 5px 20px; font-size: 18px; border-color: #ff4c4c; color: #ff4c4c; font-weight:bold;">-</button>
           <span id="qty-${item.id}" style="font-weight: bold; font-size: 18px; width: 30px; text-align: center; color: #333;">${guncelMiktar}</span>
           <button onclick="handleAddToCart(${item.id})" style="padding: 5px 20px; font-size: 18px; border-color: #4CAF50; color: #4CAF50; font-weight:bold;">+</button>
       </div>
       ${veganBadge}
    `;

    menuList.appendChild(div);
  });
}

// ... Sepet Ekle/Çıkar Fonksiyonları ...
function handleAddToCart(id) {
    let cart = getSafeCart();
    let existingItem = cart.find(c => c.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        let menuItem = menu.find(m => m.id === id);
        cart.push({ ...menuItem, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    document.getElementById(`qty-${id}`).innerText = getCartQuantity(id);
}

function handleRemoveFromCart(id) {
    let cart = getSafeCart();
    let existingItem = cart.find(c => c.id === id);
    if (existingItem) {
        existingItem.quantity -= 1;
        if (existingItem.quantity <= 0) {
            cart = cart.filter(c => c.id !== id);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        document.getElementById(`qty-${id}`).innerText = getCartQuantity(id);
    }
}

// --- FİLTRE VE ÇEKMECE FONKSİYONLARI ---
function openFilterDrawer() {
  const overlay = document.getElementById("filter-overlay");
  const drawer = document.getElementById("filter-drawer");
  overlay.style.display = "block";
  setTimeout(() => { drawer.classList.add("open"); }, 10);
}

function closeFilterDrawer(event) {
  if (event && event.target.id !== "filter-overlay") return;
  const overlay = document.getElementById("filter-overlay");
  const drawer = document.getElementById("filter-drawer");
  drawer.classList.remove("open");
  setTimeout(() => { overlay.style.display = "none"; }, 300);
}

function toggleVegan() {
  isVeganOnly = !isVeganOnly;
  const btn = document.getElementById("vegan-toggle-btn");
  if (isVeganOnly) {
    btn.style.background = "#4CAF50";
    btn.style.color = "white";
  } else {
    btn.style.background = "white";
    btn.style.color = "#4CAF50";
  }
  rendermenu();
}

function applyFilters() {
  // Sadece alerjen kutularını kontrol et (vegan toggle'a dokunmuyoruz)
  const checkboxes = document.querySelectorAll('.alerjen-cb:checked');
  activeAllergensToAvoid = Array.from(checkboxes).map((cb) => cb.value);
  
  rendermenu();
  closeFilterDrawer();
}

function clearFilters() {
  // Sadece alerjen kutularının işaretini kaldır (vegan toggle etkilenmez)
  const checkboxes = document.querySelectorAll('#filter-drawer input[type="checkbox"]');
  checkboxes.forEach((cb) => (cb.checked = false));
  
  activeAllergensToAvoid = [];
  
  rendermenu();
  closeFilterDrawer();
}

// --- İÇERİK FİLTRESİ FONKSİYONLARI ---
function populateIngredientDrawer() {
  const container = document.getElementById("ingredient-list-container");
  
  // Önce içeriği sıfırlayalım ve başlıkları ekleyelim
  container.innerHTML = `
      <h3 style="margin-top: 0; font-size: 16px; color: #4CAF50;">İçerikler</h3>
      <p style="font-size: 12px; color: #888; margin-top: 0; margin-bottom: 15px;">
        Üründe mutlaka olmasını istediğiniz içerikleri seçin:
      </p>
  `;

  // Menüyü tara ve benzersiz içerikleri bul (Set ile tekrarları engelleriz)
  let allIngredients = new Set();
  menu.forEach((item) => {
    if (item.icerik && Array.isArray(item.icerik)) {
      item.icerik.forEach((ing) => allIngredients.add(ing.trim()));
    }
  });

  // Alfabetik sıraya dizelim
  let sortedIngredients = Array.from(allIngredients).sort();

  // Her bir içerik için checkbox oluştur
  sortedIngredients.forEach((ing) => {
    let label = document.createElement("label");
    label.className = "filter-checkbox-container";
    label.innerHTML = `<input type="checkbox" value="${ing}" class="ingredient-cb"/> ${ing}`;
    container.appendChild(label);
  });
}

function openIngredientDrawer() {
  const overlay = document.getElementById("ingredient-overlay");
  const drawer = document.getElementById("ingredient-drawer");
  overlay.style.display = "block";
  setTimeout(() => { drawer.classList.add("open"); }, 10);
}

function closeIngredientDrawer(event) {
  if (event && event.target.id !== "ingredient-overlay") return;
  const overlay = document.getElementById("ingredient-overlay");
  const drawer = document.getElementById("ingredient-drawer");
  drawer.classList.remove("open");
  setTimeout(() => { overlay.style.display = "none"; }, 300);
}

function applyIngredientFilters() {
  const checkboxes = document.querySelectorAll('.ingredient-cb:checked');
  activeIngredientsToInclude = Array.from(checkboxes).map((cb) => cb.value);
  rendermenu();
  closeIngredientDrawer();
}

function clearIngredientFilters() {
  const checkboxes = document.querySelectorAll('#ingredient-drawer input[type="checkbox"]');
  checkboxes.forEach((cb) => (cb.checked = false));
  activeIngredientsToInclude = [];
  rendermenu();
  closeIngredientDrawer();
}

// --- MODAL (BİLGİ EKRANI) FONKSİYONU ---
function openItemModal(id) {
  const item = menu.find((m) => m.id === id);
  if (!item) return;

  // Modaldaki isme de vegan ikonu ekle
  let veganModalIcon = item.vegan ? " 🌱" : "";

  document.getElementById("modal-img").src = item.resim;
  document.getElementById("modal-title").innerText = item.isim + veganModalIcon;
  document.getElementById("modal-rating").innerText = item.puan;
  document.getElementById("modal-price").innerText = item.fiyat + " TL";
  document.getElementById("modal-text").innerText = item.aciklama || "Bu ürün için açıklama bulunmuyor.";
  document.getElementById("modal-ingredients").innerText = item.icerik.join(", ");

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

window.addEventListener("load", function () {
  if (document.getElementById("menu-list")) {
    menuyuGoster();
  }
});
