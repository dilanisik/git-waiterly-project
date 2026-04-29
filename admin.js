// ══════════════════════════════════════════
// EMPLOYEE DATA (hardcoded, DB bağlanacak)
// ══════════════════════════════════════════
let employeesData = [
  { id:1, ad:"Ayşe Kaya",     rol:"Baş Garson",  telefon:"+90 532 111 22 33", email:"ayse.kaya@waiterly.com",     baslangic:"Mart 2021",    durum:"active",   foto:null, emoji:"👩",   notlar:"" },
  { id:2, ad:"Mehmet Demir",  rol:"Garson",       telefon:"+90 544 222 33 44", email:"mehmet.demir@waiterly.com",  baslangic:"Haziran 2022", durum:"active",   foto:null, emoji:"👨",   notlar:"" },
  { id:3, ad:"Zeynep Arslan", rol:"Kasiyer",      telefon:"+90 505 333 44 55", email:"zeynep.arslan@waiterly.com", baslangic:"Ocak 2023",    durum:"active",   foto:null, emoji:"👩",   notlar:"" },
  { id:4, ad:"Ali Çelik",     rol:"Garson",       telefon:"+90 553 444 55 66", email:"ali.celik@waiterly.com",     baslangic:"Eylül 2023",   durum:"inactive", foto:null, emoji:"👨",   notlar:"" },
  { id:5, ad:"Fatma Yıldız",  rol:"Mutfak Şefi",  telefon:"+90 561 555 66 77", email:"fatma.yildiz@waiterly.com",  baslangic:"Şubat 2020",   durum:"active",   foto:null, emoji:"👩‍🍳", notlar:"" },
  { id:6, ad:"Kerem Şahin",   rol:"Garson",       telefon:"+90 542 666 77 88", email:"kerem.sahin@waiterly.com",   baslangic:"Temmuz 2024",  durum:"active",   foto:null, emoji:"👨",   notlar:"" },
];

let editingEmpId = null;
let modalPhotoBase64 = null;
let menuImageBase64 = null;

// ══════════════════════════════════════════
// RENDER EMPLOYEES
// ══════════════════════════════════════════
function renderEmployees() {
  const grid = document.getElementById("employees-grid");
  if(!grid) return;
  grid.innerHTML = "";
  employeesData.forEach(emp => {
    const statusClass = emp.durum === "active" ? "status-active" : "status-inactive";
    const statusLabel = emp.durum === "active" ? "Aktif" : "İzinli";
    const photoHtml = emp.foto
      ? `<img src="${emp.foto}" alt="${emp.ad}" />`
      : `<div class="employee-photo-placeholder">${emp.emoji}</div>`;

    grid.innerHTML += `
      <div class="employee-card" onclick="openEditModal(${emp.id})">
        <div class="employee-edit-overlay">
          <button class="employee-edit-btn">✏️ Düzenle</button>
        </div>
        <div class="employee-photo-wrap">
          ${photoHtml}
          <span class="employee-role-badge">${emp.rol}</span>
        </div>
        <div class="employee-info">
          <div class="employee-name">${emp.ad}</div>
          <div class="employee-meta">ID #${emp.id} · Başlangıç: ${emp.baslangic}</div>
          <div class="employee-details">
            <div class="employee-detail-row"><span class="icon">📞</span><span>${emp.telefon}</span></div>
            <div class="employee-detail-row"><span class="icon">✉️</span><span>${emp.email}</span></div>
            <div class="employee-detail-row"><span class="icon">●</span><span class="status-badge ${statusClass}">${statusLabel}</span></div>
            ${emp.notlar ? `<div class="employee-detail-row"><span class="icon">📝</span><span>${emp.notlar}</span></div>` : ""}
          </div>
        </div>
      </div>`;
  });
}

// ══════════════════════════════════════════
// MODAL FOR EMPLOYEES
// ══════════════════════════════════════════
function openEditModal(id) {
  const emp = employeesData.find(e => e.id === id);
  if (!emp) return;
  editingEmpId = id;
  modalPhotoBase64 = emp.foto || null;

  document.getElementById("modal-ad").value = emp.ad;
  document.getElementById("modal-rol").value = emp.rol;
  document.getElementById("modal-telefon").value = emp.telefon;
  document.getElementById("modal-email").value = emp.email;
  document.getElementById("modal-baslangic").value = emp.baslangic;
  document.getElementById("modal-durum").value = emp.durum;
  document.getElementById("modal-notlar").value = emp.notlar || "";
  document.getElementById("modal-photo-file").value = "";

  const display = document.getElementById("modal-photo-display");
  display.innerHTML = emp.foto ? `<img src="${emp.foto}" alt="${emp.ad}" />` : emp.emoji;

  document.getElementById("emp-modal").classList.add("open");
}

function closeModal() {
  document.getElementById("emp-modal").classList.remove("open");
  editingEmpId = null;
  modalPhotoBase64 = null;
}

document.getElementById("emp-modal").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});

function previewModalPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    modalPhotoBase64 = e.target.result;
    document.getElementById("modal-photo-display").innerHTML = `<img src="${modalPhotoBase64}" alt="Önizleme" />`;
  };
  reader.readAsDataURL(file);
}

function saveEmployee() {
  const idx = employeesData.findIndex(e => e.id === editingEmpId);
  if (idx === -1) return;
  const ad = document.getElementById("modal-ad").value.trim();
  const rol = document.getElementById("modal-rol").value.trim();
  if (!ad || !rol) { alert("Ad ve Rol zorunludur!"); return; }

  employeesData[idx] = {
    ...employeesData[idx],
    ad,
    rol,
    telefon: document.getElementById("modal-telefon").value.trim(),
    email: document.getElementById("modal-email").value.trim(),
    baslangic: document.getElementById("modal-baslangic").value.trim(),
    durum: document.getElementById("modal-durum").value,
    notlar: document.getElementById("modal-notlar").value.trim(),
    foto: modalPhotoBase64 || employeesData[idx].foto,
  };

  closeModal();
  renderEmployees();
}

let newEmpPhotoBase64 = null;

function previewNewEmpPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    newEmpPhotoBase64 = e.target.result;
    const display = document.getElementById("new-emp-photo-display");
    display.innerHTML = `<img src="${newEmpPhotoBase64}" alt="Önizleme" />`;
  };
  reader.readAsDataURL(file);
}

function addNewEmployee() {
  const ad = document.getElementById("new-emp-ad").value.trim();
  const rol = document.getElementById("new-emp-rol").value.trim();
  if (!ad || !rol) { alert("Ad ve Rol zorunludur!"); return; }

  const newEmp = {
    id: employeesData.length > 0 ? Math.max(...employeesData.map(e => e.id)) + 1 : 1,
    ad,
    rol,
    telefon: document.getElementById("new-emp-telefon").value.trim(),
    email: document.getElementById("new-emp-email").value.trim(),
    baslangic: document.getElementById("new-emp-baslangic").value.trim(),
    durum: document.getElementById("new-emp-durum").value,
    notlar: document.getElementById("new-emp-notlar").value.trim(),
    foto: newEmpPhotoBase64 || null,
    emoji: "👤",
  };

  employeesData.push(newEmp);
  renderEmployees();

  ["new-emp-ad","new-emp-rol","new-emp-telefon","new-emp-baslangic","new-emp-email","new-emp-notlar"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("new-emp-durum").value = "active";
  document.getElementById("new-emp-photo-file").value = "";
  document.getElementById("new-emp-photo-display").innerHTML = "👤";
  newEmpPhotoBase64 = null;

  alert("✅ Çalışan başarıyla eklendi!");
}

// ══════════════════════════════════════════
// MENU IMAGE PREVIEW
// ══════════════════════════════════════════
function previewMenuImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    menuImageBase64 = e.target.result;
    document.getElementById("upload-placeholder").style.display = "none";
    document.getElementById("upload-preview-wrap").style.display = "block";
    document.getElementById("upload-preview-img").src = menuImageBase64;
    document.getElementById("add-resim").value = "";
  };
  reader.readAsDataURL(file);
}

// ══════════════════════════════════════════
// PANEL LOGIC
// ══════════════════════════════════════════
function switchPanel(name) {
  document.getElementById("admin-nav").style.display = "none";
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-card").forEach(c => c.classList.remove("active"));
  document.getElementById(`panel-${name}`).classList.add("active");
  document.getElementById(`btn-${name}`).classList.add("active");
  
  if (name === "menu") loadAdminMenu();
  else if (name === "orders") loadOrders();
  else if (name === "requests") loadAdminRequests();
  else if (name === "employees") renderEmployees();
  else if (name === "moods") loadAdminMoods(); 
}

function goBackToNav() {
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-card").forEach(c => c.classList.remove("active"));
  document.getElementById("admin-nav").style.display = "grid";
}

// ══════════════════════════════════════════
// REQUESTS
// ══════════════════════════════════════════
function loadAdminRequests() {
  fetch("/api/requests").then(r => r.json()).then(data => {
    const tbody = document.getElementById("admin-request-list");
    if(!tbody) return;
    tbody.innerHTML = "";
    data.forEach(item => {
      const silBtn = item.id === 5 ? "" : `<button class="btn-delete" onclick="deleteRequest(${item.id})">Sil</button>`;
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
  if (confirm("Bu isteği silmek istediğinize emin misiniz?"))
    fetch(`/api/requests/${id}`, {method:"DELETE"}).then(() => loadAdminRequests());
}

// ══════════════════════════════════════════
// MENU
// ══════════════════════════════════════════
let currentMenuData = []; 
let editingMenuId = null; 

function loadAdminMenu() {
  fetch("/api/menu").then(r => r.json()).then(data => {
    currentMenuData = data; 
    const tbody = document.getElementById("admin-menu-list");
    if(!tbody) return;
    tbody.innerHTML = "";
    data.forEach(item => {
      const imgSrc = item.resim || "/images/americano.jpg";
      tbody.innerHTML += `<tr>
        <td><img class="menu-thumb" src="${imgSrc}" alt="${item.isim}" onerror="this.src='/images/americano.jpg'" /></td>
        <td>#${item.id}</td>
        <td><strong>${item.isim}</strong></td>
        <td>${item.fiyat} TL</td>
        <td>${item.aciklama || "-"}</td>
        <td>${item.alerjenler ? item.alerjenler.join(", ") : "-"}</td>
        <td><span style="background:#eee; padding:4px 8px; border-radius:4px; font-size:12px; color:#555;">${item.etiketler ? item.etiketler.join(", ") : "-"}</span></td>
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
  if (!item) return;

  editingMenuId = id;

  document.getElementById("add-isim").value = item.isim;
  document.getElementById("add-fiyat").value = item.fiyat;
  document.getElementById("add-aciklama").value = item.aciklama || "";
  document.getElementById("add-alerjenler").value = item.alerjenler ? item.alerjenler.join(", ") : "";
  document.getElementById("add-etiketler").value = item.etiketler ? item.etiketler.join(", ") : "";

  menuImageBase64 = null;
  if (item.resim && !item.resim.startsWith("data:")) {
    document.getElementById("add-resim").value = item.resim;
  } else {
    document.getElementById("add-resim").value = "";
  }

  if (item.resim) {
    document.getElementById("upload-placeholder").style.display = "none";
    document.getElementById("upload-preview-wrap").style.display = "block";
    document.getElementById("upload-preview-img").src = item.resim;
  }

  document.querySelector(".add-form h3").innerText = "✏️ Ürünü Düzenle";
  const btnSubmit = document.querySelector(".add-form .btn-submit");
  btnSubmit.innerText = "💾 Değişiklikleri Kaydet";
  btnSubmit.setAttribute("onclick", "saveMenuItem()");

  if (!document.getElementById("cancel-edit-btn")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancel-edit-btn";
    cancelBtn.className = "btn-modal-cancel";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.innerText = "İptal";
    cancelBtn.onclick = resetMenuForm;
    btnSubmit.parentNode.insertBefore(cancelBtn, btnSubmit.nextSibling);
  }

  document.querySelector(".add-form").scrollIntoView({ behavior: 'smooth' });
}

function resetMenuForm() {
  editingMenuId = null;
  
  document.querySelector(".add-form h3").innerText = "Yeni Ürün Ekle";
  const btnSubmit = document.querySelector(".add-form .btn-submit");
  btnSubmit.innerText = "✅ Menüye Ekle";
  btnSubmit.setAttribute("onclick", "addNewItem()");
  
  const cancelBtn = document.getElementById("cancel-edit-btn");
  if (cancelBtn) cancelBtn.remove();

  ["add-isim", "add-fiyat", "add-aciklama", "add-alerjenler", "add-etiketler", "add-resim"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("add-resim-file").value = "";
  menuImageBase64 = null;
  document.getElementById("upload-placeholder").style.display = "block";
  document.getElementById("upload-preview-wrap").style.display = "none";
}

function saveMenuItem() {
  const isim = document.getElementById("add-isim").value.trim();
  const fiyat = document.getElementById("add-fiyat").value;
  if (!isim || !fiyat) { alert("⚠️ Ürün adı ve fiyat zorunludur!"); return; }
  
  const aciklama = document.getElementById("add-aciklama").value.trim();
  const alerjenInput = document.getElementById("add-alerjenler").value.trim();
  const etiketInput = document.getElementById("add-etiketler").value.trim();
  const manualResim = document.getElementById("add-resim").value.trim();
  
  const alerjenler = alerjenInput ? alerjenInput.split(",").map(a => a.trim()) : [];
  const etiketler = etiketInput ? etiketInput.split(",").map(e => e.trim()) : []; 
  const resim = menuImageBase64 || manualResim || "/images/americano.jpg";

  fetch(`/api/menu/${editingMenuId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isim, fiyat: parseFloat(fiyat), aciklama, alerjenler, etiketler, resim }) 
  }).then(r => {
    if (r.ok) {
      loadAdminMenu();
      alert("✅ Ürün başarıyla güncellendi!");
      resetMenuForm();
    } else {
      alert("⚠️ Güncelleme sırasında bir hata oluştu.");
    }
  });
}

function addNewItem() {
  const isim = document.getElementById("add-isim").value.trim();
  const fiyat = document.getElementById("add-fiyat").value;
  if (!isim || !fiyat) { alert("⚠️ Ürün adı ve fiyat zorunludur!"); return; }
  
  const aciklama = document.getElementById("add-aciklama").value.trim();
  const alerjenInput = document.getElementById("add-alerjenler").value.trim();
  const etiketInput = document.getElementById("add-etiketler").value.trim();
  const manualResim = document.getElementById("add-resim").value.trim();
  
  const alerjenler = alerjenInput ? alerjenInput.split(",").map(a => a.trim()) : [];
  const etiketler = etiketInput ? etiketInput.split(",").map(e => e.trim()) : []; 
  const resim = menuImageBase64 || manualResim || "/images/americano.jpg";

  fetch("/api/menu", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({isim, fiyat:parseFloat(fiyat), aciklama, alerjenler, etiketler, puan:5.0, resim})
  }).then(r => {
    if (r.ok) {
      loadAdminMenu();
      alert("✅ Ürün başarıyla eklendi!");
      resetMenuForm(); 
    }
  });
}

function deleteItem(id) {
  if (confirm("Silinsin mi?"))
    fetch(`/api/menu/${id}`, {method:"DELETE"}).then(() => loadAdminMenu());
}

// ══════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orderHistory")) || [];
  const tbody = document.getElementById("admin-order-list");
  if(!tbody) return;
  tbody.innerHTML = "";
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;padding:30px;">Henüz sipariş kaydı yok.</td></tr>`;
    return;
  }
  [...orders].reverse().forEach((order, index) => {
    const urunDetay = order.urunler.map(u => `${u.miktar||u.quantity}x ${u.isim}`).join(", ");
    tbody.innerHTML += `<tr>
      <td>${order.tarih||"-"}</td><td>${order.saat||"-"}</td><td>${urunDetay}</td>
      <td><strong>${order.toplamTutar.toFixed(2)} TL</strong></td>
      <td><button class="btn-delete" onclick="deleteOrder(${orders.length-1-index})">Sil</button></td>
    </tr>`;
  });
}

function deleteOrder(idx) {
  if (confirm("Silinsin mi?")) {
    let orders = JSON.parse(localStorage.getItem("orderHistory")) || [];
    orders.splice(idx, 1);
    localStorage.setItem("orderHistory", JSON.stringify(orders));
    loadOrders();
  }
}

function addManualOrder() {
  const urun = document.getElementById("manual-urunler").value.trim();
  const tutar = parseFloat(document.getElementById("manual-tutar").value);
  if (!urun || !tutar) return alert("Eksik bilgi!");
  const simdi = new Date();
  const history = JSON.parse(localStorage.getItem("orderHistory")) || [];
  history.push({
    tarih: simdi.toLocaleDateString("tr-TR"),
    saat: simdi.toLocaleTimeString("tr-TR", {hour:"2-digit",minute:"2-digit"}),
    toplamTutar: tutar,
    urunler: [{isim:urun, quantity:1}]
  });
  localStorage.setItem("orderHistory", JSON.stringify(history));
  loadOrders();
}

function logout() {
  fetch("/api/logout", {method:"POST"}).then(() => window.location.href = "/login.html");
}

document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });


// ══════════════════════════════════════════
// MOOD YÖNETİMİ
// ══════════════════════════════════════════
let currentMoodsData = JSON.parse(localStorage.getItem('moodsDB')) || [
  { id: 1, isim: "Enerjik Hissetmek", emoji: "⚡", etiketler: ["enerjik", "kafein", "uyandirici"] },
  { id: 2, isim: "Rahatlamak İstiyorum", emoji: "🧘‍♀️", etiketler: ["rahatlatici", "kafeinsiz", "sicak"] },
  { id: 3, isim: "Tatlı Krizi", emoji: "🍫", etiketler: ["tatli", "cikolatali", "kremali"] }
];
let editingMoodId = null;

function loadAdminMoods() {
  localStorage.setItem('moodsDB', JSON.stringify(currentMoodsData));
  
  const tbody = document.getElementById("admin-mood-list");
  if(!tbody) return;
  tbody.innerHTML = "";
  
  currentMoodsData.forEach(mood => {
    tbody.innerHTML += `<tr>
      <td>#${mood.id}</td>
      <td><strong>${mood.isim}</strong></td>
      <td>${mood.emoji}</td>
      <td><span style="background:#e3f2fd; padding:4px 8px; border-radius:4px; font-size:12px; color:#1565c0;">${mood.etiketler.join(", ")}</span></td>
      <td>
        <button class="btn-submit" style="padding:8px 12px; font-size:12px; background:#2196f3; margin-right:4px;" onclick="editMood(${mood.id})">✏️</button>
        <button class="btn-delete" onclick="deleteMood(${mood.id})">Sil</button>
      </td>
    </tr>`;
  });
}

function addNewMood() {
  const isim = document.getElementById("add-mood-isim").value.trim();
  const emoji = document.getElementById("add-mood-emoji").value.trim() || "✨";
  const etiketInput = document.getElementById("add-mood-etiketler").value.trim();
  
  if (!isim || !etiketInput) { alert("⚠️ İsim ve etiketler zorunludur!"); return; }
  
  const etiketler = etiketInput.split(",").map(e => e.trim().toLowerCase());
  const newId = currentMoodsData.length > 0 ? Math.max(...currentMoodsData.map(m => m.id)) + 1 : 1;

  currentMoodsData.push({ id: newId, isim, emoji, etiketler });
  
  alert("✅ Ruh hali başarıyla eklendi!");
  document.getElementById("add-mood-isim").value = "";
  document.getElementById("add-mood-emoji").value = "";
  document.getElementById("add-mood-etiketler").value = "";
  
  loadAdminMoods();
}

function editMood(id) {
  const mood = currentMoodsData.find(m => m.id === id);
  if (!mood) return;
  
  editingMoodId = id;
  document.getElementById("add-mood-isim").value = mood.isim;
  document.getElementById("add-mood-emoji").value = mood.emoji;
  document.getElementById("add-mood-etiketler").value = mood.etiketler.join(", ");
  
  document.querySelector("#mood-add-form h3").innerText = "✏️ Ruh Halini Düzenle";
  const btnSubmit = document.querySelector("#mood-add-form .btn-submit");
  btnSubmit.innerText = "💾 Kaydet";
  btnSubmit.setAttribute("onclick", "saveMood()");
  
  if (!document.getElementById("cancel-mood-btn")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancel-mood-btn";
    cancelBtn.className = "btn-delete";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.style.background = "#999";
    cancelBtn.innerText = "İptal";
    cancelBtn.onclick = resetMoodForm;
    btnSubmit.parentNode.insertBefore(cancelBtn, btnSubmit.nextSibling);
  }
}

function saveMood() {
  const isim = document.getElementById("add-mood-isim").value.trim();
  const emoji = document.getElementById("add-mood-emoji").value.trim() || "✨";
  const etiketInput = document.getElementById("add-mood-etiketler").value.trim();
  
  if (!isim || !etiketInput) { alert("⚠️ İsim ve etiketler zorunludur!"); return; }
  
  const idx = currentMoodsData.findIndex(m => m.id === editingMoodId);
  if (idx !== -1) {
    currentMoodsData[idx] = {
      id: editingMoodId,
      isim,
      emoji,
      etiketler: etiketInput.split(",").map(e => e.trim().toLowerCase())
    };
  }
  
  alert("✅ Ruh hali başarıyla güncellendi!");
  resetMoodForm();
  loadAdminMoods();
}

function resetMoodForm() {
  editingMoodId = null;
  document.getElementById("add-mood-isim").value = "";
  document.getElementById("add-mood-emoji").value = "";
  document.getElementById("add-mood-etiketler").value = "";
  
  document.querySelector("#mood-add-form h3").innerText = "Yeni Ruh Hali Ekle";
  const btnSubmit = document.querySelector("#mood-add-form .btn-submit");
  btnSubmit.innerText = "✅ Ruh Hali Ekle";
  btnSubmit.setAttribute("onclick", "addNewMood()");
  
  const cancelBtn = document.getElementById("cancel-mood-btn");
  if (cancelBtn) cancelBtn.remove();
}

function deleteMood(id) {
  if (confirm("Bu ruh halini silmek istediğinize emin misiniz?")) {
    currentMoodsData = currentMoodsData.filter(m => m.id !== id);
    loadAdminMoods();
  }
}
