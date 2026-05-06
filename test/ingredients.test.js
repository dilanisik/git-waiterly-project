/**
 * @jest-environment jsdom
 */

// 1. Mock Global Fetch
global.fetch = jest.fn((url) => {
    if (url.includes("/api/menu")) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
                { id: 1, isim: "Cheeseburger", icerik: ["ekmek", "peynir", "köfte"], fiyat: 100, vegan: false, resim: "burger.jpg" },
                { id: 2, isim: "Vegan Burger", icerik: ["ekmek", "soya köftesi"], fiyat: 90, vegan: true, resim: "vegan.jpg" }
            ])
        });
    }
    if (url.includes("/api/ingredients")) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{ isim: "peynir" }])
        });
    }
    return Promise.resolve({ ok: false });
});

// 2. Setup DOM
document.body.innerHTML = `
    <div id="ingredients-grid"></div>
    <div id="matched-menu-list"></div>
    <div id="products-modal-overlay" style="display:none;"></div>
    <div id="product-info-overlay" style="display:none;"></div>
    <img id="modal-img" /><div id="modal-title"></div><div id="modal-rating"></div>
    <div id="modal-price"></div><div id="modal-text"></div><div id="modal-ingredients"></div>
    <div id="modal-allergens-container" style="display:none;"><div id="modal-allergens"></div></div>
`;

const ingredients = require('../ingredients.js');

describe('Ingredients Panel Integration (ingredients.js)', () => {
    
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        window.alert = jest.fn(); // Mock alerts
    });

    test('fetchInitialData() populates data and renders cards', async () => {
        await ingredients.fetchInitialData();
        
        const grid = document.getElementById("ingredients-grid");
        // Should contain "ekmek", "köfte", "soya köftesi" but NOT "peynir"
        expect(grid.innerHTML).toContain("ekmek");
        expect(grid.innerHTML).toContain("soya köftesi");
        expect(grid.innerHTML).not.toContain("peynir");
    });

    test('toggleIngredient() updates selection and UI classes', () => {
        const mockDiv = document.createElement("div");
        ingredients.toggleIngredient("ekmek", mockDiv);
        
        expect(mockDiv.classList.contains("selected")).toBe(true);
        
        // Toggle off
        ingredients.toggleIngredient("ekmek", mockDiv);
        expect(mockDiv.classList.contains("selected")).toBe(false);
    });

    test('showMatchingProducts() filters menu based on selection', async () => {
        await ingredients.fetchInitialData(); // Load menu into internal state
        
        // Select "soya köftesi"
        const mockDiv = document.createElement("div");
        ingredients.toggleIngredient("soya köftesi", mockDiv);
        
        ingredients.showMatchingProducts();
        
        const matchedList = document.getElementById("matched-menu-list").innerHTML;
        expect(matchedList).toContain("Vegan Burger");
        expect(matchedList).not.toContain("Cheeseburger");
        expect(document.getElementById("products-modal-overlay").style.display).toBe("block");
    });

    test('handleAddToCartFromIngredients() updates localStorage', async () => {
        await ingredients.fetchInitialData();
        // Create the quantity span required by the function
        document.getElementById("matched-menu-list").innerHTML = '<span id="qty-ing-1">0</span>';
        
        ingredients.handleAddToCartFromIngredients(1, 1); // Add item 1
        
        const cart = JSON.parse(localStorage.getItem("cart"));
        expect(cart.length).toBe(1);
        expect(cart[0].id).toBe(1);
        expect(document.getElementById("qty-ing-1").innerText).toBe("1");
    });

    test('openItemModal() populates item details', async () => {
        await ingredients.fetchInitialData();
        ingredients.openItemModal(2); // Vegan Burger
        
        expect(document.getElementById("modal-title").innerText).toContain("Vegan Burger");
        expect(document.getElementById("modal-title").innerText).toContain("🌱");
        expect(document.getElementById("product-info-overlay").style.display).toBe("block");
    });

    test('closeItemModal() hides overlay on target click', () => {
        const overlay = document.getElementById("product-info-overlay");
        overlay.style.display = "block";
        
        ingredients.closeItemModal({ target: { id: "product-info-overlay" } });
        expect(overlay.style.display).toBe("none");
    });
});