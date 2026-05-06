// ==========================================
// 1. GLOBAL DEĞİŞKENLER VE VERİ ÇEKME
// ==========================================
let menuData = [];
let isVeganOnly = false;
let unwantedAllergens = new Set();
let activeCategory = "Hepsi"; // Yeni Kategori Değişkeni

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/menu")
    .then((res) => res.json())
    .then((data) => {
      menuData = data;
      renderCategories(); // Kategorileri Dinamik Oluştur
      renderMenu();
    })
    .catch((err) => {
      console.error("Menü yükleme hatası:", err);
      document.getElementById("menu-list").innerHTML =
        "<p style='color:red;'>Menü yüklenirken bir hata oluştu.</p>";
    });
});

// ==========================================
// 1.5 DİNAMİK KATEGORİ OLUŞTURMA
// ==========================================
function renderCategories() {
  const categoryBar = document.getElementById("category-bar");

  // Veritabanından gelen tüm ürünlerden benzersiz kategorileri çıkar ("Hepsi" default)
  const uniqueCategories = [
    "Hepsi",
    ...new Set(
      menuData.map((item) => item.kategori).filter((k) => k && k.trim() !== ""),
    ),
  ];

  categoryBar.innerHTML = ""; // Temizle

  uniqueCategories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `category-tab ${cat === activeCategory ? "active" : ""}`;
    btn.innerText = cat;
    btn.onclick = () => selectCategory(cat);
    categoryBar.appendChild(btn);
  });
}

function selectCategory(cat) {
  activeCategory = cat;
  renderCategories(); // Sınıfları(active) güncellemek için tekrar çiz
  renderMenu(); // Menüyü filtrele
}

// ==========================================
// 2. EKRANA ÇİZME (RENDER) VE FİLTRELEME
// ==========================================
function renderMenu() {
  const list = document.getElementById("menu-list");
  list.innerHTML = "";

  // Filtreleme Mantığı
  const filteredData = menuData.filter((item) => {
    // Kategori Filtresi
    if (activeCategory !== "Hepsi" && item.kategori !== activeCategory)
      return false;

    // Vegan filtresi aktifse ve ürün vegan değilse gizle
    if (isVeganOnly && !item.vegan) return false;

    // Alerjen filtresi: İstenmeyen alerjenlerden BİRİ bile üründe varsa gizle
    if (
      unwantedAllergens.size > 0 &&
      item.alerjenler &&
      Array.isArray(item.alerjenler)
    ) {
      const hasAllergen = item.alerjenler.some((a) => unwantedAllergens.has(a));
      if (hasAllergen) return false;
    }
    return true;
  });

  // Sonuç yoksa uyarı ver
  if (filteredData.length === 0) {
    list.innerHTML =
      "<p style='color:gray; padding: 20px; grid-column: 1/-1;'>Seçtiğiniz filtrelere uygun ürün bulunamadı. 😔</p>";
    return;
  }

  // Kartları oluştur
  filteredData.forEach((item) => {
    let guncelMiktar = getCartQuantity(item.id || item._id);
    let div = document.createElement("div");
    div.className = "menu-item";
    // MongoDB objeleri _id kullanabilir, fallback olarak ikisini de destekleyelim
    const itemId = item._id || item.id;
    div.onclick = () => openItemModal(itemId);

    let veganBadge = item.vegan
      ? `<span style="font-size: 10px; background: #e8f5e9; color: #2e7d32; padding: 3px 6px; border-radius: 8px; border: 1px solid #a5d6a7; margin-left:8px; vertical-align: middle;">🌱 Vegan</span>`
      : "";

    div.innerHTML = `
           <div class="menu-item-top">
               <div style="flex: 1;">
                   <div style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #2C2A29; margin-bottom: 8px;">
                       ${item.isim} ${veganBadge}
                   </div>
                   <div style="font-weight: 700; color: #2E7D32; font-size: 16px;">${item.fiyat} TL</div>
               </div>
               <img src="${item.resim || "/images/americano.jpg"}" class="item-thumbnail" alt="${item.isim}" onerror="this.src='/images/americano.jpg'">
           </div>
           
           <div class="item-controls" onclick="event.stopPropagation()">
               <button onclick="sepeteEkle('${itemId}', -1)" style="padding: 5px 20px; font-size: 18px; border: none; border-radius: 8px; background: #FDECEA; color: #E74C3C; font-weight:bold; cursor:pointer;">-</button>
               <span id="qty-${itemId}" style="font-weight: bold; font-size: 18px; width: 30px; text-align: center; color: #333;">${guncelMiktar}</span>
               <button onclick="sepeteEkle('${itemId}', 1)" style="padding: 5px 20px; font-size: 18px; border: none; border-radius: 8px; background: #E8F5E9; color: #2E7D32; font-weight:bold; cursor:pointer;">+</button>
           </div>
        `;
    list.appendChild(div);
  });
}

// ... (Sepet İşlemleri, Filtre Çekmecesi, vb Kodlar aynı kalacak[cite: 11]) ...

// ==========================================
// 3. SEPET İŞLEMLERİ (Local Storage)
// ==========================================
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
  let item = cart.find((c) => c.id === id || c._id === id);
  return item ? item.quantity : 0;
}

function sepeteEkle(id, change) {
  let cart = getSafeCart();
  let existingItem = cart.find((c) => c.id === id || c._id === id);

  if (change > 0) {
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      let menuItem = menuData.find((m) => m.id === id || m._id === id);
      if (menuItem) cart.push({ ...menuItem, quantity: 1 });
    }
  } else if (change < 0 && existingItem) {
    existingItem.quantity -= 1;
    if (existingItem.quantity <= 0) {
      cart = cart.filter((c) => c.id !== id && c._id !== id);
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  const qtyElement = document.getElementById(`qty-${id}`);
  if (qtyElement) {
    qtyElement.innerText = getCartQuantity(id);
  }
}

// ==========================================
// 4. MODAL (ÜRÜN DETAY) İŞLEMLERİ
// ==========================================
function openItemModal(id) {
  const item = menuData.find((m) => m.id === id || m._id === id);
  if (!item) return;

  let veganModalIcon = item.vegan ? " 🌱" : "";

  document.getElementById("modal-img").src =
    item.resim || "/images/americano.jpg";
  document.getElementById("modal-title").innerText = item.isim + veganModalIcon;
  document.getElementById("modal-rating").innerText = item.puan || "Yeni";
  document.getElementById("modal-price").innerText = item.fiyat + " TL";
  document.getElementById("modal-text").innerText =
    item.aciklama || "Bu ürün için açıklama bulunmuyor.";

  let icerikMetni =
    item.icerik && Array.isArray(item.icerik) ? item.icerik.join(", ") : "-";
  document.getElementById("modal-ingredients").innerText = icerikMetni;

  const alerjenKutu = document.getElementById("modal-allergens-container");
  if (
    item.alerjenler &&
    Array.isArray(item.alerjenler) &&
    item.alerjenler.length > 0
  ) {
    document.getElementById("modal-allergens").innerText =
      item.alerjenler.join(", ");
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

// ==========================================
// 5. FİLTRE ÇEKMECESİ İŞLEMLERİ
// ==========================================
function openFilterDrawer() {
  document.getElementById("filter-drawer").classList.add("open");
  document.getElementById("filter-overlay").style.display = "block";
}

function closeFilterDrawer() {
  document.getElementById("filter-drawer").classList.remove("open");
  document.getElementById("filter-overlay").style.display = "none";
  renderMenu();
}

function toggleVegan(btn) {
  isVeganOnly = !isVeganOnly;
  if (isVeganOnly) {
    btn.classList.add("vegan-selected");
  } else {
    btn.classList.remove("vegan-selected");
  }
  renderMenu();
}

function toggleAllergen(allergenName, btn) {
  if (unwantedAllergens.has(allergenName)) {
    unwantedAllergens.delete(allergenName);
    btn.classList.remove("allergen-selected");
  } else {
    unwantedAllergens.add(allergenName);
    btn.classList.add("allergen-selected");
  }
  renderMenu();
}

function clearFilters() {
  isVeganOnly = false;
  unwantedAllergens.clear();

  document.getElementById("vegan-btn").classList.remove("vegan-selected");
  document
    .querySelectorAll(".allergen-selected")
    .forEach((el) => el.classList.remove("allergen-selected"));

  renderMenu();
}

// Conditional Export for Testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderCategories, selectCategory, renderMenu, 
        toggleVegan, toggleAllergen, clearFilters,
        sepeteEkle, openItemModal, closeItemModal 
    };
}