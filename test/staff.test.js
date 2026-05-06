/**
 * @jest-environment jsdom
 */

// 1. Import the functions from the correct path (../staff.js)
const staff = require('../staff.js');
const { 
    fetchData, renderTables, openModal, 
    confirmOrder, confirmRequest, closeModal, logout 
} = staff;

global.fetch = jest.fn(); // Define it before spying

beforeEach(() => {
    // Mock window.alert
    window.alert = jest.fn();

    // Mock window.location for JSDOM
    delete window.location;
    window.location = {
        href: '',
        search: '',
        replace: jest.fn(), //
        assign: jest.fn()
    };
    
    localStorage.clear(); // Ensure clean state for every test
});

describe('staff.js Full Logic Coverage', () => {
    let fetchSpy;

    beforeEach(() => {
        // Setup DOM elements required by staff.js
        document.body.innerHTML = `
            <div id="table-grid"></div>
            <div id="order-modal" style="display: none;">
                <div id="modal-table-title"></div>
                <div id="modal-requests"></div>
                <div id="unconfirmed-orders"></div>
                <div id="confirmed-orders"></div>
            </div>
        `;

        // Mock global fetch
        fetchSpy = jest.spyOn(global, 'fetch');
        
        // Reset timers for setInterval tests
        jest.useFakeTimers();
        
        // Mock console.error to keep the test output clean
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        fetchSpy.mockRestore();
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    test('DOMContentLoaded initializes fetchData and sets interval', () => {
        const fetchDataSpy = jest.spyOn(global, 'fetchData'); // Assuming it's global
        window.dispatchEvent(new Event('DOMContentLoaded'));
        
        expect(fetchSpy).toHaveBeenCalledWith('/api/tables');
        
        // Fast-forward 5 seconds to test interval
        jest.advanceTimersByTime(5000);
        expect(fetchSpy).toHaveBeenCalledTimes(4); // 2 calls initial (tables/sessions) + 2 calls interval
    });

    test('fetchData() handles API errors gracefully', async () => {
        fetchSpy.mockRejectedValueOnce(new Error('Network Failure'));
        
        await fetchData();
        
        expect(console.error).toHaveBeenCalledWith('Veri çekilemedi:', expect.any(Error));
    });

    test('renderTables() correctly identifies active sessions and requests', async () => {
        const mockTables = [{ masaNo: "5" }, { masaNo: "2" }];
        const mockSessions = [
            { masaNo: "5", durum: "aktif", talepler: ["Su"], genelToplam: 150 }
        ];

        // Trigger render
        allSessions = mockSessions; // Setting global variable
        renderTables(mockTables);

        const grid = document.getElementById("table-grid");
        const table5 = grid.children[0];
        const table2 = grid.children[1];

        expect(table5.className).toContain("status-active has-request");
        expect(table5.innerHTML).toContain("req-badge"); // Request badge branch
        expect(table5.innerHTML).toContain("150 ₺"); // Price branch

        expect(table2.className).toContain("status-empty");
        expect(table2.innerHTML).toContain("Boş");
    });

    test('openModal() populates empty vs active table data', () => {
        // Test Empty Table
        openModal("2", null);
        expect(document.getElementById("unconfirmed-orders").innerHTML).toContain("Bu masa şu an boş.");

        // Test Active Table with Unconfirmed and Confirmed orders
        const mockSession = {
            hashcode: 'abc',
            talepler: ["Hesap"],
            siparisler: [
                { durum: "hazırlanıyor", zaman: "12:00", urunler: [{ quantity: 2, isim: "Çay" }] },
                { durum: "onaylandı", zaman: "12:05", urunler: [] } // Malformed products branch
            ]
        };

        openModal("5", mockSession);
        
        const reqDiv = document.getElementById("modal-requests");
        expect(reqDiv.innerHTML).toContain("Tamamlandı ✓"); // confirmRequest button branch
        
        const unconfirmed = document.getElementById("unconfirmed-orders");
        const confirmed = document.getElementById("confirmed-orders");
        
        expect(unconfirmed.innerHTML).toContain("Siparişi Al"); // confirmOrder button branch
        expect(confirmed.innerHTML).toContain("Sipariş Alındı"); // isConfirmed branch
        expect(confirmed.innerHTML).toContain("Ürün detayı bulunamadı"); // No products branch
    });

    test('confirmOrder and confirmRequest trigger APIs and refresh data', async () => {
        fetchSpy.mockResolvedValue({ ok: true });
        
        // Test Order Confirmation
        await confirmOrder('hash123', 0);
        expect(fetchSpy).toHaveBeenCalledWith('/api/orders/confirm', expect.any(Object));
        expect(document.getElementById("order-modal").style.display).toBe("none");

        // Test Request Confirmation
        await confirmRequest('hash123', 'Su');
        expect(fetchSpy).toHaveBeenCalledWith('/api/session/request/confirm', expect.any(Object));
    });

    test('closeModal() logic for background clicks and force close', () => {
        const modal = document.getElementById("order-modal");
        modal.style.display = "flex";

        // Click outside (target is modal)
        closeModal({ target: { id: "order-modal" } });
        expect(modal.style.display).toBe("none");

        // Force Close
        modal.style.display = "flex";
        closeModal(null, true);
        expect(modal.style.display).toBe("none");
    });

    test('logout() handles errors and always redirects', async () => {
        // Mock location
        delete window.location;
        window.location = { href: "" };
        
        fetchSpy.mockRejectedValueOnce(new Error('Logout failed'));
        
        await logout();
        
        expect(fetchSpy).toHaveBeenCalledWith('/api/logout', { method: "POST" });
        expect(window.location.href).toBe("/login.html");
    });
});