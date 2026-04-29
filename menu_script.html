<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Menü - Waiterly</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        text-align: center;
        margin-top: 50px;
        background-color: #f9f9f9;
        overflow-x: hidden;
        padding-bottom: 80px; 
      }

      button {
        padding: 10px 20px;
        border-radius: 5px;
        border: 1px solid #ccc;
        background-color: white;
        cursor: pointer;
        transition: 0.2s;
        -webkit-tap-highlight-color: transparent;
      }
      
      @media (hover: hover) { button:hover { background-color: #f0f0f0; } }
      button:active { background-color: #e0e0e0; }

      /* FLOATING CART BUTTON (SEPET BUTONU) */
      .floating-cart-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #ff9800;
        color: white;
        border: none;
        border-radius: 50px;
        padding: 15px 25px;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        z-index: 9000;
      }

      /* MENÜ LİSTESİ VE KART TASARIMI */
      .menu-item {
        margin: 15px auto;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 12px;
        width: 90%;
        max-width: 450px;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        text-align: left;
        cursor: pointer;
      }
      .menu-item-top { display: flex; justify-content: space-between; align-items: center; }
      .item-thumbnail {
        width: 70px;
        height: 70px;
        border-radius: 8px;
        object-fit: cover;
        margin-left: 15px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      .item-controls {
        margin-top: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
        padding-top: 10px;
        border-top: 1px dashed #eee; 
      }

      /* MODAL STYLES (BİLGİ EKRANI) */
      .item-modal-overlay {
        display: none;
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9998;
        backdrop-filter: blur(3px);
        overflow-y: auto;
      }
      .item-modal-card {
        background: #fff;
        width: 90%;
        max-width: 400px;
        border-radius: 12px;
        margin: 50px auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        position: relative;
        overflow: hidden;
      }
      .modal-close-btn {
        position: absolute;
        top: 10px; right: 10px;
        width: 35px; height: 35px;
        background: rgba(255, 255, 255, 0.9);
        border: none; border-radius: 50%;
        cursor: pointer; font-weight: bold; font-size: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      .product-info-img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      /* FİLTRE ÇEKMECESİ VE YENİ KUTUCUK TASARIMI */
      .filter-drawer {
        position: fixed;
        top: 0;
        right: -320px;
        width: 280px;
        height: 100%;
        background-color: white;
        box-shadow: -2px 0 5px rgba(0,0,0,0.2);
        transition: right 0.3s ease;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        padding: 20px;
        text-align: left;
        overflow-y: auto;
      }
      .filter-drawer.open { right: 0; }
      .filter-overlay {
        display: none;
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.4);
        z-index: 9998;
      }
      .drawer-footer { margin-top: 20px; display: flex; justify-content: space-between; padding-bottom: 20px;}
      
      /* YENİ GRID YAPISI */
      .filter-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .filter-card {
        background: white;
        border: 2px solid #ddd;
        border-radius: 10px;
        padding: 12px 5px;
        flex: 1 1 calc(50% - 10px);
        cursor: pointer;
        transition: 0.2s;
        text-align: center;
        font-size: 13px;
        font-weight: bold;
        box-sizing: border-box;
        color: #555;
        -webkit-tap-highlight-color: transparent;
      }
      .filter-card:active { transform: scale(0.95); }
      
      /* Seçili Vegan Kartı Stili */
      .filter-card.vegan-selected {
        border-color: #4CAF50;
        background-color: #e8f5e9;
        color: #2e7d32;
      }
      
      /* Seçili Alerjen Kartı Stili (İstenmeyen) */
      .filter-card.allergen-selected {
        border-color: #f44336;
        background-color: #ffebee;
        color: #d32f2f;
      }
    </style>
  </head>
  <body>
    <h1>Menü 🍽️</h1>

    <button onclick="window.location.href='/'">Anasayfaya Dön 🏠</button>
    <button onclick="openFilterDrawer()">Filtrele 🔍</button>
    <br><br>

    <div id="menu-list"></div>

    <button class="floating-cart-btn" onclick="window.location.href='/cart.html'">🛒 Sepete Git</button>

    <div id="filter-overlay" class="filter-overlay" onclick="closeFilterDrawer()"></div>
    <div id="filter-drawer" class="filter-drawer">
      <h3 style="margin-top: 0;">Filtreler</h3>
      
      <div class="filter-grid" style="margin-bottom: 20px;">
        <div id="vegan-btn" class="filter-card" style="flex: 1 1 100%; font-size: 15px;" onclick="toggleVegan(this)">
          🌱 Sadece Vegan
        </div>
      </div>
      
      <h4 style="margin-bottom: 10px; border-top: 1px dashed #ccc; padding-top: 15px;">İstemediğiniz Alerjenler</h4>
      
      <div class="filter-grid" id="allergen-grid">
        <div class="filter-card" onclick="toggleAllergen('Gluten', this)">🍞 Gluten</div>
        <div class="filter-card" onclick="toggleAllergen('Süt/Laktoz', this)">🥛 Süt/Laktoz</div>
        <div class="filter-card" onclick="toggleAllergen('Yumurta', this)">🥚 Yumurta</div>
        <div class="filter-card" onclick="toggleAllergen('Kuruyemiş', this)">🌰 Kuruyemiş</div>
        <div class="filter-card" onclick="toggleAllergen('Yer Fıstığı', this)">🥜 Yer Fıstığı</div>
        <div class="filter-card" onclick="toggleAllergen('Soya', this)">🫘 Soya</div>
        <div class="filter-card" onclick="toggleAllergen('Susam', this)">🥯 Susam</div>
        <div class="filter-card" onclick="toggleAllergen('Deniz Ürünleri', this)">🍤 Deniz Ürn.</div>
        <div class="filter-card" onclick="toggleAllergen('Kereviz', this)">🥬 Kereviz</div>
      </div>

      <div class="drawer-footer">
        <button onclick="clearFilters()" style="background-color: #f44336; color: white;">Temizle</button>
        <button onclick="closeFilterDrawer()" style="background-color: #4CAF50; color: white;">Tamam</button>
      </div>
    </div>

    <div id="item-modal-overlay" class="item-modal-overlay" onclick="closeItemModal(event)">
      <div class="item-modal-card" onclick="event.stopPropagation()">
        <button class="modal-close-btn" onclick="closeItemModal()">&times;</button>
        <img id="modal-img" class="product-info-img" src="" alt="">
        <div style="padding: 20px; text-align: left;">
          <h2 id="modal-title" style="margin-top: 0; margin-bottom: 5px;"></h2>
          <div style="color: #ff9800; font-weight: bold; margin-bottom: 10px;">⭐ <span id="modal-rating"></span></div>
          <div id="modal-price" style="font-size: 18px; font-weight: bold; color: #4CAF50; margin-bottom: 15px;"></div>
          <p id="modal-text" style="color: #555; font-size: 14px; line-height: 1.4;"></p>
          
          <div style="background: #f9f9f9; padding: 10px; border-radius: 8px; margin-top: 15px;">
            <strong style="font-size: 13px;">İçindekiler:</strong>
            <div id="modal-ingredients" style="font-size: 13px; color: #666; margin-top: 5px;"></div>
          </div>

          <div id="modal-allergens-container" style="background: #fff3cd; padding: 10px; border-radius: 8px; margin-top: 10px; display: none;">
            <strong style="font-size: 13px; color: #856404;">⚠️ Alerjen Uyarısı:</strong>
            <div id="modal-allergens" style="font-size: 13px; color: #856404; margin-top: 5px;"></div>
          </div>
        </div>
      </div>
    </div>

    <script src="menu_script.js"></script>
  </body>
</html>
