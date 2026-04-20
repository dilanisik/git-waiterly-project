let menu = [];
let activeAllergensToAvoid = []; // Array holding all selected allergens

function menuyuGoster() {
  fetch("/api/menu")
    .then((res) => res.json())
    .then((data) => {
      menu = data;
      rendermenu();
    });
}

function rendermenu() {
  const menuList = document.getElementById("menu-list");
  menuList.innerHTML = "";

  menu.forEach((item) => {
    // NEW MULTI-FILTER LOGIC:
    // Check if the item's allergens array contains ANY of the allergens the user wants to avoid
    if (activeAllergensToAvoid.length > 0 && item.alerjenler) {
      const containsForbiddenAllergen = item.alerjenler.some((alerjen) =>
        activeAllergensToAvoid.includes(alerjen),
      );

      // If it contains something they are allergic to, skip rendering this item!
      if (containsForbiddenAllergen) {
        return;
      }
    }

    let div = document.createElement("div");
    div.className = "menu-item";
    div.style =
      "margin: 15px auto; padding: 15px; border: 1px solid #ddd; border-radius: 8px; width: 80%; max-width: 400px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";

    div.innerHTML = `
       <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
           <span style="font-weight: bold; font-size: 18px; color: #333;">${item.isim} - ${item.fiyat} TL</span>
           <button onclick="openItemModal(${item.id})" style="background: none; border: none; font-size: 22px; cursor: pointer; padding: 0;" title="İçerik ve Alerjen Bilgisi">ℹ️</button>
       </div>
       <div>
           <button onclick="addToCart(${item.id})" style="padding: 8px 20px; cursor: pointer; border-color: #4CAF50; color: #4CAF50; font-weight:bold;">Ekle (+)</button>
           <button onclick="removeFromCart(${item.id})" style="padding: 8px 20px; cursor: pointer; border-color: #ff4c4c; color: #ff4c4c; font-weight:bold; margin-left: 5px;">Çıkar (-)</button>
       </div>
    `;

    menuList.appendChild(div);
  });
}

// --- DRAWER FILTER LOGIC ---

function openFilterDrawer() {
  const overlay = document.getElementById("filter-overlay");
  const drawer = document.getElementById("filter-drawer");

  overlay.style.display = "block"; // Show dark background

  // Slight timeout allows the display:block to register before we animate the slide-in
  setTimeout(() => {
    drawer.classList.add("open");
  }, 10);
}

function closeFilterDrawer(event) {
  // If an event is passed, ensure the user clicked the dark overlay, not the white drawer itself
  if (event && event.target.id !== "filter-overlay") return;

  const overlay = document.getElementById("filter-overlay");
  const drawer = document.getElementById("filter-drawer");

  drawer.classList.remove("open"); // Slide out

  // Wait for the slide-out animation (0.3s) to finish before hiding the background
  setTimeout(() => {
    overlay.style.display = "none";
  }, 300);
}

function applyFilters() {
  // Gather all checkboxes that the user checked
  const checkboxes = document.querySelectorAll(
    '#filter-drawer input[type="checkbox"]:checked',
  );

  // Convert the checked elements into an array of their values (e.g., ["Gluten", "Yumurta"])
  activeAllergensToAvoid = Array.from(checkboxes).map((cb) => cb.value);

  rendermenu(); // Re-draw the menu with the active filters
  closeFilterDrawer(); // Close the drawer
}

function clearFilters() {
  // Uncheck all boxes
  const checkboxes = document.querySelectorAll(
    '#filter-drawer input[type="checkbox"]',
  );
  checkboxes.forEach((cb) => (cb.checked = false));

  // Empty our active avoidance list
  activeAllergensToAvoid = [];

  rendermenu(); // Re-draw the full menu
  closeFilterDrawer(); // Close the drawer
}

// --- ITEM DETAILS MODAL LOGIC ---

function openItemModal(id) {
  const item = menu.find((m) => m.id === id);
  if (!item) return;

  document.getElementById("modal-img").src = item.resim;
  document.getElementById("modal-title").innerText = item.isim;
  document.getElementById("modal-rating").innerText = item.puan;
  document.getElementById("modal-price").innerText = item.fiyat + " TL";
  document.getElementById("modal-ingredients").innerText =
    item.icerik.join(", ");

  const alerjenKutu = document.getElementById("modal-allergens-container");
  if (item.alerjenler && item.alerjenler.length > 0) {
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

window.addEventListener("load", function () {
  if (document.getElementById("menu-list")) {
    menuyuGoster();
  }
});
