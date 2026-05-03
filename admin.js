let employeesData = [];
let editingEmpId = null;
let modalPhotoBase64 = null;
let menuImageBase64 = null;

// ══════════════════════════════════════════
// RENDER EMPLOYEES
// ══════════════════════════════════════════
function loadAdminEmployees() {
  fetch("/api/users").then(r => r.json()).then(data => {
      employeesData = data;
      renderEmployees();
  });
}

function renderEmployees() {
  const grid = document.getElementById("employees-grid");
  if(!grid) return;
  grid.innerHTML = "";
  employeesData.forEach(emp => {
    const statusClass = emp.durum === "active" ? "status-active" : "status-inactive";
    const statusLabel = emp.durum === "active" ? "Aktif" : "İzinli";
    const photoHtml = emp.foto ? `<img src="${emp.foto}" alt="${emp.ad}" />` : `<div class="employee-photo-placeholder">${emp.emoji || "👤"}</div>`;

    grid.innerHTML += `
      <div class="employee-card" onclick="openEditModal(${emp.id})">
        <div class="employee-edit-overlay"><button class="employee-edit-btn">✏️ Düzenle</button></div>
        <div class="employee-photo-wrap">${photoHtml}<span class="employee-role-badge">${emp.rol}</span></div>
        <div class="employee-info">
          <div class="employee-name">${emp.ad}</div>
          <div class="employee-meta">ID #${emp.id} · Başlangıç: ${emp.baslangic || '-'}</div>
          <div class="employee-details">
            <div class="employee-detail-row"><span class="icon">📞</span><span>${emp.telefon || '-'}</span></div>
            <div class="employee-detail-row"><span class="icon">✉️</span><span>${emp.email || '-'}</span></div>
            <div class="employee-detail-row"><span class="icon">●</span><span class="status-badge ${statusClass}">${statusLabel}</span></div>
          </div>
          <button class="btn-delete" style="width:100%; margin-top:10px;" onclick="event.stopPropagation(); deleteEmployee(${emp.id})">Sil</button>
        </div>
      </div>`;
  });
}

function openEditModal(id) {
  const emp = employeesData.find(e => e.id === id);
  if (!emp) return;
  editingEmpId = id;
  modalPhotoBase64 = emp.foto || null;
  document.getElementById("modal-ad").value = emp.ad;
  document.getElementById("modal-rol").value = emp.rol;
  document.getElementById("modal-telefon").value = emp.telefon || "";
  document.getElementById("modal-email").value = emp.email || "";
  document.getElementById("modal-baslangic").value = emp.baslangic || "";
  document.getElementById("modal-durum").value = emp.durum || "active";
  document.getElementById("modal-notlar").value = emp.notlar || "";
  
  const display = document.getElementById("modal-photo-display");
  display.innerHTML = emp.foto ? `<img src="${emp.foto}" alt="${emp.ad}" />` : (emp.emoji || "👤");
  document.getElementById("emp-modal").classList.add("open");
}

function closeModal() { document.getElementById("emp-modal").classList.remove("open"); editingEmpId = null; }

function saveEmployee() {
  const ad = document.getElementById("modal-ad").value.trim();
  const rol = document.getElementById("modal-rol").value.trim();
  if (!ad || !rol) return alert("Ad ve Rol zorunludur!");
  
  const updatedData = {
    ad, rol,
    telefon: document.getElementById("modal-telefon").value.trim(),
    email: document.getElementById("modal-email").value.trim(),
    baslangic: document.getElementById("modal-baslangic").value.trim(),
    durum: document.getElementById("modal-durum").value,
    notlar: document.getElementById("modal-notlar").value.trim(),
    foto: modalPhotoBase64
  };

  fetch(`/api/users/${editingEmpId}`, {
    method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(updatedData)
  }).then(() => { closeModal(); loadAdminEmployees(); });
}

let newEmpPhotoBase64 = null;
function previewNewEmpPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { newEmpPhotoBase64 = e.target.result; document.getElementById("new-emp-photo-display").innerHTML = `<img src="${newEmpPhotoBase64}" />`; };
  reader.readAsDataURL(file);
}

function addNewEmployee() {
  const ad = document.getElementById("new-emp-ad").value.trim();
  const rol = document.getElementById("new-emp-rol").value.trim();
  const email = document.getElementById("new-emp-email").value.trim();
  if (!ad || !rol) return alert("Ad ve Rol zorunludur!");

  const newEmp = {
    ad, rol, email,
    telefon: document.getElementById("new-emp-telefon").value.trim(),
    baslangic: document.getElementById("new-emp-baslangic").value.trim(),
    durum: document.getElementById("new-emp-durum").value,
    notlar: document.getElementById("new-emp-notlar").value.trim(),
    foto: newEmpPhotoBase64 || null,
    password: "1234",
    emoji: "👤",
  };

  fetch("/api/users", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(newEmp) })
    .then(() => { alert("✅ Çalışan eklendi!"); loadAdminEmployees(); });
}

function deleteEmployee(id) {
    if(confirm("Çalışanı silmek istiyor musunuz?")) fetch(`/api/users/${id}`, {method:"DELETE"}).then(() => loadAdminEmployees());
}

// ══════════════════════════════════════════
// PANEL LOGIC
// ══════════════════════════════════════════
function switchPanel(name) {
  document.getElementById("admin-nav").style.display = "none";
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
  
  const targetPanel = document.getElementById(`panel-${name}`);
  if(targetPanel) targetPanel.classList.add("active");
  
  if (name === "menu") loadAdminMenu();
  else if (name === "orders") loadOrders();
  else if (name === "requests") loadAdminRequests();
  else if (name === "employees") loadAdminEmployees();
  else if (name === "moods") loadAdminMoods();
  else if (name === "ingredients") loadAdminIngredients();
}

function goBackToNav() {
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
  document.getElementById("admin-nav").style.display = "grid";
}

// ══════════════════════════════════════════
// İÇERİK (INGREDIENT) MANTIĞI
// ══════════════════════════════════════════
let currentIngredientsData = [];

function loadAdminIngredients() {
  const select = document.getElementById("add-ing-isim");
  if(select) select.innerHTML = '<option value="">-- Yükleniyor... --</option>';

  Promise.all([
    fetch("/api/ingredients").then(r => r.json()),
    fetch("/api/menu").then(r => r.json())
  ]).then(([ingredientsData, menuData]) => {
      currentIngredientsData = ingredientsData;
      
      const tbody = document.getElementById("admin-ingredient-list");
      if(tbody) {
        tbody.innerHTML = "";
        ingredientsData.forEach(ing => {
          tbody.innerHTML += `<tr>
            <td>#${ing.id}</td><td><strong>${ing.isim}</strong></td><td>${ing.emoji}</td>
            <td><span style="background:#e8f5e9; padding:4px 8px; border-radius:4px; font-size:12px; color:#2e7d32;">${Array.isArray(ing.etiketler) ? ing.etiketler.join(", ") : "-"}</span></td>
            <td>
              <button class="btn-delete" onclick="deleteIngredient(${ing.id})">Sil</button>
            </td>
          </tr>`;
        });
      }

      // Menüden malzemeleri toplama (Bozuk/Eski veriye karşı %100 korumalı)
      let allIngs = new Set();
      if(Array.isArray(menuData)) {
          menuData.forEach(m => {
            if (m.icerik && Array.isArray(m.icerik)) {
              m.icerik.forEach(i => {
                  if (typeof i === 'string' && i.trim() !== "") {
                      allIngs.add(i.trim());
                  }
              });
            }
          });
      }

      if(select) {
        select.innerHTML = '<option value="">-- Menüden Malzeme Seçin --</option>';
        Array.from(allIngs).sort((a,b) => a.localeCompare(b, 'tr-TR')).forEach(ing => {
          let isAlreadyExcluded = ingredientsData.some(ex => typeof ex.isim === 'string' && ex.isim.toLocaleLowerCase('tr-TR') === ing.toLocaleLowerCase('tr-TR'));
          if (!isAlreadyExcluded) {
              select.innerHTML += `<option value="${ing}">${ing}</option>`;
          }
        });
      }
  }).catch(err => {
      console.error("Malzemeler yüklenemedi:", err);
      if(select) select.innerHTML = '<option value="">Sunucu Hatası!</option>';
  });
}

function addNewIngredient() {
  const isim = document.getElementById("add-ing-isim").value.trim();
  const emoji = document.getElementById("add-ing-emoji").value.trim() || "🚫";
  const etiketInput = document.getElementById("add-ing-etiketler").value.trim();
  
  if (!isim) return alert("⚠️ Menüden kısıtlanacak bir içerik seçmelisiniz!");
  
  const etiketler = etiketInput ? etiketInput.split(",").map(e => e.trim().toLowerCase()) : [isim.toLowerCase()];
  
  fetch("/api/ingredients", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({isim, emoji, etiketler})})
    .then(() => { resetIngredientForm(); loadAdminIngredients(); });
}

function deleteIngredient(id) {
  if (confirm("Bu içerik kısıtlamadan çıkarılsın mı?")) 
      fetch(`/api/ingredients/${id}`, {method:"DELETE"}).then(() => loadAdminIngredients());
}

function resetIngredientForm() {
  document.getElementById("add-ing-isim").value = "";
  document.getElementById("add-ing-emoji").value = "";
  document.getElementById("add-ing-etiketler").value = "";
}

// ══════════════════════════════════════════
// REQUESTS
// ══════════════════════════════════════════
function loadAdminRequests() {
  fetch("/api/requests").then(r => r.json()).then(data => {
    const tbody = document.getElementById("admin-request-list");
    tbody.innerHTML = "";
    data.forEach(item => {
      const silBtn = item.istek.includes("Özel İstek") ? "" : `<button class="btn-delete" onclick="deleteRequest(${item.id})">Sil</button>`;
      tbody.innerHTML += `<tr><td>#${item.id}</td><td>${item.istek}</td><td style="text-align:right;">${silBtn}</td></tr>`;
    });
  });
}
function addNewRequest() {
  const text = document.getElementById("add-request-text").value.trim();
  if (!text) return alert("İstek metni boş olamaz!");
  fetch("/api/requests", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({istek:text}) })
    .then(() => { document.getElementById("add-request-text").value=""; loadAdminRequests(); });
}
function deleteRequest(id) {
  if (confirm("Silinsin mi?")) fetch(`/api/requests/${id}`, {method:"DELETE"}).then(() => loadAdminRequests());
}

// ══════════════════════════════════════════
// MOOD YÖNETİMİ
// ══════════════════════════════════════════
let currentMoodsData = [];
let editingMoodId = null;

function loadAdminMoods() {
  fetch("/api/moods").then(r=>r.json()).then(data => {
      currentMoodsData = data;
      const tbody = document.getElementById("admin-mood-list");
      tbody.innerHTML = "";
      data.forEach(mood => {
        tbody.innerHTML += `<tr>
          <td>#${mood.id}</td><td><strong>${mood.isim}</strong></td><td>${mood.emoji}</td>
          <td><span style="background:#e3f2fd; padding:4px 8px; border-radius:4px; font-size:12px; color:#1565c0;">${Array.isArray(mood.etiketler) ? mood.etiketler.join(", ") : "-"}</span></td>
          <td>
            <button class="btn-submit" style="padding:8px 12px; font-size:12px; background:#2196f3; margin-right:4px;" onclick="editMood(${mood.id})">✏️</button>
            <button class="btn-delete" onclick="deleteMood(${mood.id})">Sil</button>
          </td>
        </tr>`;
      });
  });
}

function addNewMood() {
  const isim = document.getElementById("add-mood-isim").value.trim();
  const emoji = document.getElementById("add-mood-emoji").value.trim() || "✨";
  const etiketInput = document.getElementById("add-mood-etiketler").value.trim();
  if (!isim || !etiketInput) return alert("⚠️ İsim ve etiketler zorunludur!");
  
  const etiketler = etiketInput.split(",").map(e => e.trim().toLowerCase());
  fetch("/api/moods", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({isim, emoji, etiketler})})
    .then(() => { resetMoodForm(); loadAdminMoods(); });
}

function editMood(id) {
  const mood = currentMoodsData.find(m => m.id === id);
  if (!mood) return;
  editingMoodId = id;
  document.getElementById("add-mood-isim").value = mood.isim;
  document.getElementById("add-mood-emoji").value = mood.emoji;
  document.getElementById("add-mood-etiketler").value = Array.isArray(mood.etiketler) ? mood.etiketler.join(", ") : "";
  
  document.querySelector("#mood-add-form h3").innerText = "✏️ Ruh Halini Düzenle";
  document.querySelector("#mood-add-form .btn-submit").setAttribute("onclick", "saveMood()");
}

function saveMood() {
  const isim = document.getElementById("add-mood-isim").value.trim();
  const etiketler = document.getElementById("add-mood-etiketler").value.split(",").map(e => e.trim().toLowerCase());
  fetch(`/api/moods/${editingMoodId}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({isim, emoji: document.getElementById("add-mood-emoji").value, etiketler})})
    .then(() => { resetMoodForm(); loadAdminMoods(); });
}

function deleteMood(id) {
  if (confirm("Silinsin mi?")) fetch(`/api/moods/${id}`, {method:"DELETE"}).then(() => loadAdminMoods());
}

function resetMoodForm() {
  editingMoodId = null;
  document.getElementById("add-mood-isim").value = "";
  document.getElementById("add-mood-emoji").value = "";
  document.getElementById("add-mood-etiketler").value = "";
  document.querySelector("#mood-add-form h3").innerText = "Yeni Ruh Hali Ekle";
  document.querySelector("#mood-add-form .btn-submit").setAttribute("onclick", "addNewMood()");
}

// ══════════════════════════════════════════
// MENU YÖNETİMİ
// ══════════════════════════════════════════
let currentMenuData = []; 
let editingMenuId = null; 

function loadAdminMenu() {
  fetch("/api/menu").then(r => r.json()).then(data => {
    currentMenuData = data; 
    const tbody = document.getElementById("admin-menu-list");
    tbody.innerHTML = "";
    data.forEach(item => {
      const icerikMetni = item.icerik && Array.isArray(item.icerik) ? item.icerik.join(", ") : "-";
      const etiketMetni = item.tags && Array.isArray(item.tags) ? item.tags.join(", ") : "-";
      const alerjenMetni = item.alerjenler && Array.isArray(item.alerjenler) ? item.alerjenler.join(", ") : "-";
      
      tbody.innerHTML += `<tr>
        <td><img class="menu-thumb" src="${item.resim||"/images/americano.jpg"}" onerror="this.src='/images/americano.jpg'" /></td>
        <td>#${item.id}</td><td><strong>${item.isim}</strong></td><td>${item.fiyat} TL</td>
        <td><small><b>İçerik:</b> ${icerikMetni}<br><b>Açıklama:</b> ${item.aciklama || "-"}<br><b>Vegan:</b> ${item.vegan ? 'Evet' : 'Hayır'}</small></td>
        <td>${alerjenMetni}</td>
        <td><span style="background:#eee; padding:4px; font-size:11px;">${etiketMetni}</span></td>
        <td>
          <button class="btn-submit" style="padding:8px 12px; font-size:12px; background:#2196f3; margin-right:4px;" onclick="editMenu(${item.id})">✏️</button>
          <button class="btn-delete" onclick="deleteItem(${item.id})">Sil</button>
        </td>
      </tr>`;
    });
  });
}

function editMenu(id) {
  const item = currentMenuData.find(i => i.id === id);
  editingMenuId = id;
  
  document.getElementById("add-isim").value = item.isim;
  document.getElementById("add-fiyat").value = item.fiyat;
  document.getElementById("add-icerik").value = item.icerik && Array.isArray(item.icerik) ? item.icerik.join(", ") : "";
  document.getElementById("add-aciklama").value = item.aciklama || "";
  document.getElementById("add-alerjenler").value = item.alerjenler && Array.isArray(item.alerjenler) ? item.alerjenler.join(", ") : "";
  document.getElementById("add-etiketler").value = item.tags && Array.isArray(item.tags) ? item.tags.join(", ") : "";
  
  if (document.getElementById("add-vegan")) {
    document.getElementById("add-vegan").value = item.vegan ? "true" : "false";
  }
  if (document.getElementById("add-resim")) {
    document.getElementById("add-resim").value = item.resim || "";
  }
  
  document.querySelector("#panel-menu .add-form .btn-submit").setAttribute("onclick", "saveMenuItem()");
  document.querySelector("#panel-menu .add-form h3").innerText = "Ürün Düzenle";
}

function saveMenuItem() {
  const isim = document.getElementById("add-isim").value.trim();
  const fiyat = parseFloat(document.getElementById("add-fiyat").value) || 0;
  const icerik = document.getElementById("add-icerik").value.split(",").map(i => i.trim()).filter(i => i);
  const aciklama = document.getElementById("add-aciklama").value.trim();
  const alerjenler = document.getElementById("add-alerjenler").value.split(",").map(a => a.trim()).filter(a => a);
  const tags = document.getElementById("add-etiketler").value.split(",").map(e => e.trim()).filter(e => e);
  const vegan = document.getElementById("add-vegan") ? document.getElementById("add-vegan").value === "true" : false;
  
  let resim = document.getElementById("add-resim") ? document.getElementById("add-resim").value.trim() : "/images/americano.jpg";
  if (typeof menuImageBase64 !== 'undefined' && menuImageBase64) {
      resim = menuImageBase64;
  }

  if (!isim || icerik.length === 0) return alert("İsim ve İçerik (Malzemeler) zorunludur!");

  fetch(`/api/menu/${editingMenuId}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isim, fiyat, icerik, alerjenler, resim, aciklama, vegan, tags }) 
  }).then(() => { loadAdminMenu(); resetMenuForm(); });
}

function addNewItem() {
  const isim = document.getElementById("add-isim").value.trim();
  const fiyat = parseFloat(document.getElementById("add-fiyat").value) || 0;
  const icerik = document.getElementById("add-icerik").value.split(",").map(i => i.trim()).filter(i => i);
  const aciklama = document.getElementById("add-aciklama").value.trim();
  const alerjenler = document.getElementById("add-alerjenler").value.split(",").map(a => a.trim()).filter(a => a);
  const tags = document.getElementById("add-etiketler").value.split(",").map(e => e.trim()).filter(e => e);
  const vegan = document.getElementById("add-vegan") ? document.getElementById("add-vegan").value === "true" : false;
  
  let resim = document.getElementById("add-resim") ? document.getElementById("add-resim").value.trim() : "/images/americano.jpg";
  if (typeof menuImageBase64 !== 'undefined' && menuImageBase64) {
      resim = menuImageBase64;
  }

  if (!isim || icerik.length === 0) return alert("İsim ve İçerik (Malzemeler) zorunludur!");

  fetch("/api/menu", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isim, fiyat, puan: 0, icerik, alerjenler, resim, aciklama, vegan, tags })
  }).then(() => { loadAdminMenu(); resetMenuForm(); });
}

function previewMenuImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { 
      menuImageBase64 = e.target.result; 
      document.getElementById("upload-preview-img").src = menuImageBase64;
      document.getElementById("upload-preview-wrap").style.display = "block";
      document.getElementById("upload-placeholder").style.display = "none";
  };
  reader.readAsDataURL(file);
}

function resetMenuForm() {
  editingMenuId = null;
  document.getElementById("add-isim").value = "";
  document.getElementById("add-fiyat").value = "";
  document.getElementById("add-icerik").value = "";
  document.getElementById("add-aciklama").value = "";
  document.getElementById("add-alerjenler").value = "";
  document.getElementById("add-etiketler").value = "";
  if(document.getElementById("add-vegan")) document.getElementById("add-vegan").value = "false";
  if(document.getElementById("add-resim")) document.getElementById("add-resim").value = "";
  
  if (typeof menuImageBase64 !== 'undefined') menuImageBase64 = null;
  
  const previewWrap = document.getElementById("upload-preview-wrap");
  const placeholderWrap = document.getElementById("upload-placeholder");
  if(previewWrap) previewWrap.style.display = "none";
  if(placeholderWrap) placeholderWrap.style.display = "block";
  
  document.querySelector("#panel-menu .add-form .btn-submit").setAttribute("onclick", "addNewItem()");
  document.querySelector("#panel-menu .add-form h3").innerText = "Yeni Ürün Ekle";
}

function deleteItem(id) { if (confirm("Silinsin mi?")) fetch(`/api/menu/${id}`, {method:"DELETE"}).then(() => loadAdminMenu()); }

// ══════════════════════════════════════════
// ORDERS & OTHERS
// ══════════════════════════════════════════
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orderHistory")) || [];
  const tbody = document.getElementById("admin-order-list");
  tbody.innerHTML = "";
  
  [...orders].reverse().forEach((order, index) => {
    const urunDetay = order.urunler.map(u => `${u.miktar||u.quantity}x ${u.isim}`).join(", ");
    
    let formattedDate = "-";
    let formattedTime = order.zaman || "-";
    if (order.tarih) {
        const d = new Date(order.tarih);
        if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString("tr-TR");
            formattedTime = d.toLocaleTimeString("tr-TR", { hour: '2-digit', minute:'2-digit' });
        }
    }

    tbody.innerHTML += `<tr>
      <td>${formattedDate}</td>
      <td>${formattedTime}</td>
      <td>${urunDetay}</td>
      <td><strong>${order.toplamTutar} TL</strong></td>
      <td><button class="btn-delete" onclick="deleteOrder(${orders.length-1-index})">Sil</button></td>
    </tr>`;
  });
}
function deleteOrder(idx) { let orders = JSON.parse(localStorage.getItem("orderHistory")) || []; orders.splice(idx, 1); localStorage.setItem("orderHistory", JSON.stringify(orders)); loadOrders(); }
function logout() { fetch("/api/logout", {method:"POST"}).then(() => window.location.href = "/login.html"); }

window.addEventListener("pagehide", function() {
    navigator.sendBeacon("/api/logout");
});
