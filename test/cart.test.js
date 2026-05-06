/**
 * @jest-environment jsdom
 */

document.body.innerHTML = `
    <div id="cart-list"></div>
    <div id="bildirimKutusu" style="display:none;"><div id="bildirimBaslik"></div><div id="bildirimMesaji"></div><button id="bildirimButon"></button></div>
    <div id="onayKutusu" style="display:none;"></div>
    <div id="paymentModal" style="display:none;"></div>
    <div id="paymentStep" style="display:none;"></div>
    <div id="reviewStep" style="display:none;"></div>
    <div id="reviewProductList"></div>
`;

global.fetch = jest.fn((url) => {
    if (url.includes('/api/session/current')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ siparisler: [{ urunler: [{ isim: "Latte" }] }] }) });
    }
    if (url.includes('/api/menu')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, isim: "Latte", resim: "/latte.jpg", puan: 4 }]) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});

const { 
    getSafeCart, addToCart, removeFromCart, clearCart, siparisVer, // Added removeFromCart
    baslatOdemeSureci, handlePaymentSelection, submitReviews, oturumuKapat,
    bildirimGoster, renderCart // Added these
} = require('../cart.js');

describe('Cart Logic (cart.js)', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('siparisVer() should send payload to backend', async () => {
        localStorage.setItem("sessionHash", "fake-hash");
        localStorage.setItem("cart", JSON.stringify([{ id: 1, isim: "Latte", quantity: 2, fiyat: 50 }]));
        await siparisVer();
        expect(fetch).toHaveBeenCalledWith('/api/orders', expect.any(Object));
        expect(localStorage.getItem("cart")).toBeNull();
    });

    // --- NEW PAYMENT TESTS ---
    test('baslatOdemeSureci() should show the payment modal', async () => {
        await baslatOdemeSureci();
        expect(document.getElementById("paymentModal").style.display).toBe("flex");
        expect(document.getElementById("paymentStep").style.display).toBe("block");
    });

	test('handlePaymentSelection() transitions to review step', async () => {
		localStorage.setItem("sessionHash", "fake-hash");
		await handlePaymentSelection("Nakit");
		
		await new Promise(process.nextTick);
		
		expect(document.getElementById("paymentStep").style.display).toBe("none");
		expect(document.getElementById("reviewStep").style.display).toBe("block"); 
		expect(document.getElementById("reviewProductList").innerHTML).toContain("Latte");
	});

    test('oturumuKapat() successfully clears session and cart', async () => {
        localStorage.setItem("sessionHash", "fake-hash");
        localStorage.setItem("cart", "[]");
        
        await oturumuKapat("fake-hash", "Kredi Kartı");
        
        expect(fetch).toHaveBeenCalledWith('/api/session/close', expect.any(Object));
        expect(localStorage.getItem("sessionHash")).toBeNull();
        expect(localStorage.getItem("cart")).toBeNull();
    });
	
	// Add to cart.test.js
	test('addToCart() increments quantity and updates localStorage', () => {
		const initialCart = [{ id: 1, isim: "Latte", quantity: 1, fiyat: 50 }];
		localStorage.setItem("cart", JSON.stringify(initialCart));
		
		addToCart(1);
		const updatedCart = JSON.parse(localStorage.getItem("cart"));
		expect(updatedCart[0].quantity).toBe(2);
	});

	test('removeFromCart() removes item when quantity reaches zero', () => {
		const initialCart = [{ id: 1, isim: "Latte", quantity: 1, fiyat: 50 }];
		localStorage.setItem("cart", JSON.stringify(initialCart));
		
		removeFromCart(1);
		const updatedCart = JSON.parse(localStorage.getItem("cart"));
		expect(updatedCart.length).toBe(0);
	});

	test('submitReviews() updates item ratings', async () => {
		// Mock review UI
		document.getElementById("reviewProductList").innerHTML = `
			<div class="review-item">
				<strong>Latte</strong>
				<input type="radio" name="rating-0" value="5" checked>
			</div>
		`;
		
		await submitReviews();
		// Verify it attempted to fetch menu and then update it
		expect(global.fetch).toHaveBeenCalledWith('/api/menu');
		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/menu/1'), expect.objectContaining({
			method: 'PUT'
		}));
	});
	
	test('renderCart() displays both remote orders and local items', async () => {
		localStorage.setItem("sessionHash", "fake-hash");
		localStorage.setItem("cart", JSON.stringify([{ id: 1, isim: "Espresso", quantity: 1, fiyat: 40 }]));
		
		const { renderCart } = require('../cart.js');
		await renderCart();

		const listHtml = document.getElementById("cart-list").innerHTML;
		expect(listHtml).toContain("MASADAKİ SİPARİŞLER"); // From mock API
		expect(listHtml).toContain("SEPETTEKİLER"); // From local storage
		expect(listHtml).toContain("Espresso");
	});

	test('bildirimGoster() handles different types', () => {
		const { bildirimGoster } = require('../cart.js');
		
		// Test Warning
		bildirimGoster("Hata!", "uyari");
		expect(document.getElementById("bildirimBaslik").innerText).toContain("Uyarı");
		
		// Test Success
		bildirimGoster("Başarılı!");
		expect(document.getElementById("bildirimBaslik").innerText).toContain("Başarılı");
	});

	test('removeFromCart() handles string vs number IDs', () => {
		const { removeFromCart } = require('../cart.js');
		localStorage.setItem("cart", JSON.stringify([{ id: "10", isim: "Çay", quantity: 2, fiyat: 10 }]));
		
		removeFromCart(10); // Remove using number ID
		const cart = JSON.parse(localStorage.getItem("cart"));
		expect(cart[0].quantity).toBe(1);
	});

	test('clearCart() shows confirmation box', () => {
		const { clearCart } = require('../cart.js');
		localStorage.setItem("cart", JSON.stringify([{ id: 1, quantity: 1 }]));
		
		clearCart();
		expect(document.getElementById("onayKutusu").style.display).toBe("block");
	});
});