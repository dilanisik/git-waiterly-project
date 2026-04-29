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
    // UI Update for buttons
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Filter Logic: Find menu items that contain AT LEAST ONE tag matching the mood's tags
    const targetTags = mood.tags.map(t => t.toLowerCase());
    
    const matchedProducts = menuData.filter(product => {
        if (!product.tags || !Array.isArray(product.tags)) return false;
        
        const productTags = product.tags.map(t => t.toLowerCase());
        // Check if there is an intersection between product tags and mood tags
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
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${imgSrc}" class="product-img" alt="${product.isim}" onerror="this.src='/images/americano.jpg'">
            <div class="product-info">
                <h3 class="product-title">${product.isim}</h3>
                <p class="product-desc">${product.aciklama || "Harika bir tercih."}</p>
                <div class="product-price">${product.fiyat} TL</div>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}
