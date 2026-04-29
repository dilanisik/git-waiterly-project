// --- SEPET İŞLEMLERİ (Menü Script ile Birebir Aynı) ---
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
            // menuData üzerinden ürünü bul
            let menuItem = menuData.find(m => m.id === id);
            if (menuItem) {
                cart.push({ ...menuItem, quantity: 1 });
            }
        }
    } else if (change < 0 && existingItem) {
        existingItem.quantity -= 1;
        if (existingItem.quantity <= 0) {
            cart = cart.filter(c => c.id !== id);
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    // UI'daki miktarı dinamik olarak güncelle
    const qtyElement = document.getElementById(`qty-${id}`);
    if (qtyElement) {
        qtyElement.innerText = getCartQuantity(id);
    }
}
// -----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Moods created by Admin
    // Since we don't have a DB yet, we grab it from localStorage where admin.js saved it, 
    // or use defaults if empty.
    const defaultMoods = [
        { id: 1, isim: "Enerjik Hissetmek", emoji: "⚡", tags: ["enerjik", "soguk", "kafein"] },
        { id: 2, isim: "Rahatlamak İstiyorum", emoji: "🧘‍♀️", tags: ["rahatlatici", "sicak"] }
    ];
    const moodsData = JSON.parse(localStorage.getItem('moodsDB')) || defaultMoods;
    
    const container = document.getElementById('mood-buttons-container');

    // Render Mood Buttons
    moodsData.forEach(mood => {
        const btn = document.createElement('button');
        btn.className = 'mood-btn';
        btn.innerHTML = `<span>${mood.emoji}</span> ${mood.isim}`;
        btn.onclick = () => selectMood(mood, btn);
        container.appendChild(btn);
    });
});

let menuData = [];

// Fetch menu data from your existing backend API
fetch('/api/menu')
    .then(res => res.json())
    .then(data => {
        menuData = data;
    })
    .catch(err => console.error("Menü yüklenemedi:", err));

function selectMood(mood, clickedBtn) {
    // Check if the button is already active
    const isActive = clickedBtn.classList.contains('active');
    
    // UI Update: Remove active class from all buttons
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));

    const resultsContainer = document.getElementById('results-container');
    const title = document.getElementById('results-title');

    // If it was already active, we unselect it and clear the page
    if (isActive) {
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; color:#888;">Lütfen bir ruh hali seçin.</p>';
        title.style.display = 'none';
        return; 
    }

    // Otherwise, activate the clicked button
    clickedBtn.classList.add('active');

    // Filter Logic
    const moodTagsArray = mood.tags || mood.etiketler || [];
    const targetTags = moodTagsArray.map(t => t.toLowerCase());
    
    const matchedProducts = menuData.filter(product => {
        const productTagsArray = product.tags || product.etiketler;
        if (!productTagsArray || !Array.isArray(productTagsArray)) return false;
        
        const productTags = productTagsArray.map(t => t.toLowerCase());
        return productTags.some(tag => targetTags.includes(tag));
    });

    renderResults(matchedProducts);
}

function renderResults(products) {
    const resultsContainer = document.getElementById('results-container');
    const title = document.getElementById('results-title');
    
    resultsContainer.innerHTML = '';
    title.style.display = 'block';

    if (products.length === 0) {
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; color:#888;">Bu ruh haline uygun ürün bulunamadı. Lütfen başka bir ruh hali seçin.</p>';
        return;
    }

    products.forEach(product => {
        const imgSrc = product.resim || "/images/americano.jpg";
        let guncelMiktar = getCartQuantity(product.id);
        
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Vegan etiketi (opsiyonel olarak menu_scriptteki gibi ekleyebilirsiniz)
        let veganBadge = product.vegan ? `<span style="font-size: 12px; background: #e8f5e9; color: #2e7d32; padding: 3px 8px; border-radius: 12px; font-weight: bold; border: 1px solid #a5d6a7; margin-left: 10px;">🌱 Vegan</span>` : "";

        card.innerHTML = `
            <img src="${imgSrc}" class="product-img" alt="${product.isim}" onerror="this.src='/images/americano.jpg'">
            <div class="product-info">
                <h3 class="product-title">${product.isim} ${veganBadge}</h3>
                <p class="product-desc">${product.aciklama || "Harika bir tercih."}</p>
                <div class="product-price">${product.fiyat} TL</div>
                
                <div class="item-controls" onclick="event.stopPropagation()">
                    <button class="btn-minus" onclick="sepeteEkle(${product.id}, -1)">-</button>
                    <span id="qty-${product.id}" class="item-qty">${guncelMiktar}</span>
                    <button class="btn-plus" onclick="sepeteEkle(${product.id}, 1)">+</button>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}
