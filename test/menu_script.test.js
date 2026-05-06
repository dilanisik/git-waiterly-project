/**
 * @jest-environment jsdom
 */

// 1. Set up the Mock Fetch FIRST
global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
        { id: 1, isim: "Kahve", kategori: "İçecek", fiyat: 50, vegan: true, alerjenler: [] },
        { id: 2, isim: "Sütlü Tatlı", kategori: "Tatlı", fiyat: 100, vegan: false, alerjenler: ["Süt"] }
    ])
}));

// 2. Set up the bulletproof DOM SECOND
document.body.innerHTML = `
    <div id="category-bar"></div>
    <div id="menu-list"></div>
    <button id="vegan-btn" class=""></button>
    <div id="item-modal-overlay" style="display:none;"></div>
    <img id="modal-img" /><div id="modal-title"></div><div id="modal-rating"></div>
    <div id="modal-price"></div><div id="modal-text"></div><div id="modal-ingredients"></div>
    <div id="modal-allergens-container" style="display:none;"><div id="modal-allergens"></div></div>
`;

// 3. Require the script THIRD (so the DOM is ready when it loads)
const { 
    renderCategories, selectCategory, renderMenu, 
    toggleVegan, toggleAllergen, clearFilters,
    sepeteEkle, openItemModal, closeItemModal 
} = require('../menu_script.js');

describe('Menu Filtering Logic (menu_script.js)', () => {

    beforeAll(async () => {
        // Trigger the DOMContentLoaded event listener inside menu_script.js
        document.dispatchEvent(new Event('DOMContentLoaded'));
        // Wait for the fetch promise to resolve and populate menuData
        await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('renderMenu() displays all items by default', () => {
        renderMenu();
        const list = document.getElementById("menu-list").innerHTML;
        expect(list).toContain("Kahve");
        expect(list).toContain("Sütlü Tatlı");
    });

    test('selectCategory() filters by category', () => {
        selectCategory("İçecek");
        const list = document.getElementById("menu-list").innerHTML;
        expect(list).toContain("Kahve");
        expect(list).not.toContain("Sütlü Tatlı");
    });

    test('toggleVegan() hides non-vegan items', () => {
        selectCategory("Hepsi"); // Reset category filter
        const btn = document.getElementById("vegan-btn");
        
        toggleVegan(btn); // Turn Vegan ON
        const list = document.getElementById("menu-list").innerHTML;
        
        expect(list).toContain("Kahve");
        expect(list).not.toContain("Sütlü Tatlı");
        expect(btn.classList.contains("vegan-selected")).toBe(true);
    });

    test('toggleAllergen() hides items with specific allergens', () => {
        clearFilters(); // Reset all filters
        const mockBtn = document.createElement("button");
        
        toggleAllergen("Süt", mockBtn); // Block "Süt"
        const list = document.getElementById("menu-list").innerHTML;
        
        expect(list).toContain("Kahve");
        expect(list).not.toContain("Sütlü Tatlı");
    });

    test('sepeteEkle() adds item to local storage cart', () => {
        localStorage.clear();
        // Add item with ID 1
        sepeteEkle(1, 1);
        const cart = JSON.parse(localStorage.getItem("cart"));
        expect(cart.length).toBe(1);
        expect(cart[0].isim).toBe("Kahve");
        
        // Remove item with ID 1
        sepeteEkle(1, -1);
        expect(JSON.parse(localStorage.getItem("cart")).length).toBe(0);
    });

    test('openItemModal() populates and shows the modal', () => {
        openItemModal(1);
        expect(document.getElementById("item-modal-overlay").style.display).toBe("block");
        expect(document.getElementById("modal-title").innerText).toContain("Kahve");
    });

    test('closeItemModal() hides the modal', () => {
        // Simulate clicking outside the modal box
        closeItemModal({ target: { id: 'item-modal-overlay' } });
        expect(document.getElementById("item-modal-overlay").style.display).toBe("none");
    });
});