/**
 * @jest-environment jsdom
 */

const moodLogic = require('../mood.js');

// 1. Setup Mock Fetch
global.fetch = jest.fn();

describe('Mood Logic Full Coverage Suite', () => {
    
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        document.body.innerHTML = `
            <div id="mood-buttons-container"></div>
            <h2 id="results-title" style="display:none;">Sonuçlar</h2>
            <div id="results-container"></div>
        `;
        // Inject logic into window for inline onclicks
        window.sepeteEkle = moodLogic.sepeteEkle;
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    // --- Logic & Branch Coverage: getSafeCart ---
    test('getSafeCart handles corrupted JSON and non-array types', () => {
        localStorage.setItem('cart', 'invalid-json');
        expect(moodLogic.getSafeCart()).toEqual([]); // Hits Line 11 catch

        localStorage.setItem('cart', JSON.stringify({ name: "NotAnArray" }));
        expect(moodLogic.getSafeCart()).toEqual([]); // Hits Line 8
    });

    // --- Logic & Branch Coverage: sepeteEkle ---
    test('sepeteEkle adds new items and decrements to removal', () => {
        const mockProduct = { id: "p1", isim: "Test Product", fiyat: 10 };
        moodLogic.setMenuData([mockProduct]);
        
        // Add new item (Line 24)
        moodLogic.sepeteEkle("p1", 1);
        let cart = moodLogic.getSafeCart();
        expect(cart[0].quantity).toBe(1);

        // UI update check
        document.getElementById('results-container').innerHTML = '<span id="qty-p1">1</span>';
        
        // Decrement and filter removal (Lines 31-33)
        moodLogic.sepeteEkle("p1", -1);
        cart = moodLogic.getSafeCart();
        expect(cart.length).toBe(0);
        expect(document.getElementById("qty-p1").innerText).toBe("0");
    });

    // --- Logic & Branch Coverage: DOMContentLoaded & Fetch ---
    test('DOMContentLoaded handles success and error branches', async () => {
        // Mock Success
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] }); // menu
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ isim: "Happy" }] }); // moods
        
        window.dispatchEvent(new Event('DOMContentLoaded'));
        await new Promise(process.nextTick); 
        await new Promise(process.nextTick);

        expect(moodLogic.getMenuData().length).toBe(1);
        expect(document.getElementById('mood-buttons-container').innerHTML).toContain("Happy");

        // Mock Failure (Hits Line 54)
        fetch.mockRejectedValueOnce(new Error("API Down"));
        window.dispatchEvent(new Event('DOMContentLoaded'));
        await new Promise(process.nextTick);
        expect(console.error).toHaveBeenCalled();
    });

    // --- Logic & Branch Coverage: renderMoodButtons ---
    test('renderMoodButtons handles empty state and MongoDB IDs', () => {
        // Empty State (Line 61)
        moodLogic.setMoodsData([]);
        moodLogic.renderMoodButtons();
        expect(document.getElementById('mood-buttons-container').innerText).toContain("kayıtlı bir ruh hali bulunmuyor");

        // MongoDB _id branch (Line 70)
        moodLogic.setMoodsData([{ _id: "mongo123", isim: "Enerjik", emoji: "⚡" }]);
        moodLogic.renderMoodButtons();
        expect(document.getElementById('mood-buttons-container').innerHTML).toContain("mongo123");
    });

    // --- Logic & Branch Coverage: selectMood ---
    test('selectMood toggles and filters correctly', () => {
        const mood = { etiketler: ["coffee"], isim: "Morning" };
        const btn = document.createElement('button');
        moodLogic.setMenuData([{ id: 1, isim: "Latte", etiketler: ["COFFEE"] }]);

        // Select and Filter
        moodLogic.selectMood(mood, btn);
        expect(btn.classList.contains('active')).toBe(true);
        expect(document.getElementById('results-container').innerHTML).toContain("Latte");

        // Toggle Off (Lines 84-88)
        moodLogic.selectMood(mood, btn);
        expect(btn.classList.contains('active')).toBe(false);
        expect(document.getElementById('results-title').style.display).toBe('none');
    });

    // --- Logic & Branch Coverage: renderResults ---
    test('renderResults handles empty matching products', () => {
        moodLogic.renderResults([]); // Hits Line 122
        expect(document.getElementById('results-container').innerText).toContain("ürün bulunamadı");
    });

    test('renderResults renders vegan badges and image fallbacks', () => {
        const products = [{ id: 1, isim: "Vegan", vegan: true }]; // No image, no description
        moodLogic.renderResults(products);
        
        const html = document.getElementById('results-container').innerHTML;
        expect(html).toContain("🌱 Vegan"); // veganBadge branch
        expect(html).toContain("/images/americano.jpg"); // Image fallback
        expect(html).toContain("Harika bir tercih."); // Description fallback
    });
});