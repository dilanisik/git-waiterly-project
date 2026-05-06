/**
 * @jest-environment jsdom
 */

// 1. Mock global fetch FIRST
global.fetch = jest.fn((url) => {
    if (url.includes("/api/users")) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, ad: "Test Çalışan", rol: "Garson", durum: "active" }]) });
    if (url.includes("/api/menu")) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, isim: "Kahve", fiyat: 50, vegan: true, icerik: ["Su", "Kahve"] }]) });
    if (url.includes("/api/ingredients")) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, isim: "Süt" }]) });
    if (url.includes("/api/requests")) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, istek: "Su İstiyorum" }]) });
    if (url.includes("/api/moods")) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, isim: "Mutlu", emoji: "😊", etiketler: ["tatli"] }]) });
    if (url.includes("/api/order_history")) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, toplamTutar: 100, tarih: new Date().toISOString(), urunler: [{isim: "Kahve", quantity: 2}] }]) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
});

global.FileReader = class {
    readAsDataURL() { 
        this.onload({ target: { result: "data:image/png;base64,mock" } }); 
    }
};

// 2. Set up bulletproof DOM SECOND (using DIVs to prevent jsdom parsing errors)
document.body.innerHTML = `
    <div id="admin-nav" style="display: grid;"></div>
    <div id="panel-menu" class="admin-panel">
        <div id="admin-menu-list"></div>
        <div class="add-form">
            <h3></h3>
            <input id="add-isim"/><input id="add-kategori"/><input id="add-fiyat"/>
            <input id="add-icerik"/><input id="add-aciklama"/><input id="add-alerjenler"/>
            <input id="add-etiketler"/><select id="add-vegan"></select><input id="add-resim"/>
            <div id="upload-preview-wrap"></div><img id="upload-preview-img"/><div id="upload-placeholder"></div>
            <button class="btn-submit"></button>
        </div>
    </div>
    <div id="panel-orders" class="admin-panel"><div id="admin-order-list"></div></div>
    <div id="panel-requests" class="admin-panel"><div id="admin-request-list"></div></div>
    <div id="panel-employees" class="admin-panel"><div id="employees-grid"></div></div>
    <div id="panel-moods" class="admin-panel">
        <div id="admin-mood-list"></div>
        <div id="mood-add-form"><h3></h3><button class="btn-submit"></button></div>
    </div>
    <div id="panel-ingredients" class="admin-panel"><div id="admin-ingredient-list"></div><select id="add-ing-isim"></select></div>
    
    <div id="emp-modal">
        <input id="modal-ad"/><input id="modal-rol"/><input id="modal-telefon"/>
        <input id="modal-email"/><input id="modal-baslangic"/><select id="modal-durum"></select>
        <textarea id="modal-notlar"></textarea><input id="modal-password"/>
        <div id="modal-photo-display"></div>
    </div>

    <input id="new-emp-ad"/><input id="new-emp-rol"/><input id="new-emp-password"/><input id="new-emp-email"/>
    <div id="new-emp-photo-display"></div>
    <input id="add-request-text"/>
    <input id="add-mood-isim"/><input id="add-mood-emoji"/><input id="add-mood-etiketler"/>
    <input id="manual-urunler"/><input id="manual-tutar"/>
    
    <div id="delete-modal"></div><button id="btn-confirm-delete"></button>
`;
// 3. Require the script THIRD
const admin = require('../admin.js');

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

describe('Admin Panel Logic (admin.js)', () => {
    
    test('All load functions fetch data and render UI without crashing', async () => {
        // Fire all panel loaders
        admin.loadAdminEmployees();
        admin.loadAdminMenu();
        await admin.loadOrders();
        admin.loadAdminRequests();
        admin.loadAdminMoods();
        admin.loadAdminIngredients();
        
        // Wait for all promises to resolve
        await new Promise(resolve => setTimeout(resolve, 50));

        // Assert that the DOM was successfully populated
        expect(document.getElementById("employees-grid").innerHTML).toContain("Test Çalışan");
        expect(document.getElementById("admin-menu-list").innerHTML).toContain("Kahve");
        expect(document.getElementById("admin-order-list").innerHTML).toContain("100 TL");
        expect(document.getElementById("admin-request-list").innerHTML).toContain("Su İstiyorum");
        expect(document.getElementById("admin-mood-list").innerHTML).toContain("Mutlu");
    });

    test('editMenu() populates the form correctly', () => {
        admin.editMenu(1); // 'Kahve' from the mock
        expect(document.getElementById("add-isim").value).toBe("Kahve");
        expect(document.getElementById("add-fiyat").value).toBe("50");
    });

    test('Modals open and close correctly', () => {
        admin.openDeleteModal(99, jest.fn());
        expect(document.getElementById("delete-modal").classList.contains("open")).toBe(true);
        admin.closeDeleteModal();
        expect(document.getElementById("delete-modal").classList.contains("open")).toBe(false);
    });
	
	// Add to admin.test.js
	test('addNewEmployee() sends correct POST data', async () => {
		// Set up form values
		document.getElementById("new-emp-ad").value = "Yeni Personel";
		document.getElementById("new-emp-rol").value = "Şef";
		document.getElementById("new-emp-password").value = "pass123";

		await admin.addNewEmployee();
		expect(global.fetch).toHaveBeenCalledWith("/api/users", expect.objectContaining({
			method: "POST"
		}));
	});

	test('saveMenuItem() triggers PUT request', async () => {
		admin.editMenu(1); // Set editingMenuId
		document.getElementById("add-isim").value = "Latte";
		document.getElementById("add-kategori").value = "Sıcak İçecek";
		document.getElementById("add-icerik").value = "Süt, Kahve";

		await admin.saveMenuItem();
		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/menu/1"), expect.objectContaining({
			method: "PUT"
		}));
	});
	
	test('switchPanel() changes active classes and visibility', () => {
		admin.switchPanel('orders');
		expect(document.getElementById("admin-nav").style.display).toBe("none");
		expect(document.getElementById("panel-orders").classList.contains("active")).toBe(true);
	});

	test('addNewIngredient() prevents empty submission', () => {
		window.alert = jest.fn();
		document.getElementById("add-ing-isim").value = "";
		admin.addNewIngredient();
		expect(window.alert).toHaveBeenCalled();
	});

	test('addNewMood() sends correct payload', async () => {
		document.getElementById("add-mood-isim").value = "Enerjik";
		document.getElementById("add-mood-etiketler").value = "kahve, koşu";
		await admin.addNewMood();
		expect(global.fetch).toHaveBeenCalledWith("/api/moods", expect.objectContaining({ method: "POST" }));
	});

	test('addManualOrder() sends data and clears inputs', async () => {
		document.getElementById("manual-urunler").value = "Pasta";
		document.getElementById("manual-tutar").value = "150";
		await admin.addManualOrder();
		expect(document.getElementById("manual-urunler").value).toBe("");
		expect(global.fetch).toHaveBeenCalledWith("/api/order_history", expect.any(Object));
	});
	
	test('renderEmployees() handles both photo and placeholder branches', async () => {
		// 1. Setup mock data for this specific call
		const mockEmployees = [
			{ id: 1, ad: "Photo User", rol: "Şef", foto: "data:img", durum: "active" },
			{ id: 2, ad: "Emoji User", rol: "Garson", emoji: "🍕", durum: "inactive" }
		];
		global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEmployees) });

		// 2. Load and wait for the async operation
		admin.loadAdminEmployees();
		await new Promise(resolve => setTimeout(resolve, 10)); // Allow fetch to resolve

		admin.renderEmployees(); 
		const grid = document.getElementById("employees-grid").innerHTML;
		expect(grid).toContain('img src="data:img"'); // Photo branch
		expect(grid).toContain('🍕'); // Emoji branch
	});

	test('addNewItem() and saveMenuItem() handle validation failures', () => {
		window.alert = jest.fn();
		// Clearing inputs to trigger the "İsim, Kategori ve İçerik zorunludur!" alert
		document.getElementById("add-isim").value = ""; 
		admin.addNewItem();
		expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("zorunludur"));
	});

	test('editMood() and saveMood() cycle correctly', async () => {
		// 1. Populate data
		const mood = { id: 5, isim: "Üzgün", emoji: "😢", etiketler: ["huzun"] };
		// Trigger edit to populate fields
		admin.editMood(5); 
		
		expect(document.getElementById("add-mood-isim").value).toBe("Üzgün");
		
		// 2. Modify and Save
		document.getElementById("add-mood-isim").value = "Melankolik";
		await admin.saveMood();
		
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/moods/5"), 
			expect.objectContaining({ method: "PUT" })
		);
	});

	test('deleteItem() triggers the confirmation modal callback', () => {
		// Mock the callback logic for the delete modal
		admin.deleteItem(10);
		const confirmBtn = document.getElementById('btn-confirm-delete');
		
		// Simulate clicking "Yes" in the modal
		confirmBtn.click();
		
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/menu/10"), 
			expect.objectContaining({ method: "DELETE" })
		);
	});
	
test('goBackToNav() restores navigation visibility', () => {
        admin.goBackToNav();
        expect(document.getElementById("admin-nav").style.display).toBe("grid");
    });

    test('Employee Edit: openEditModal and saveEmployee', async () => {
        // Mocking the global employeesData that is populated on load
        admin.loadAdminEmployees();
        await new Promise(resolve => setTimeout(resolve, 10));

        admin.openEditModal(1);
        expect(document.getElementById("modal-ad").value).toBe("Test Çalışan");
        expect(document.getElementById("emp-modal").classList.contains("open")).toBe(true);

        document.getElementById("modal-ad").value = "Güncellenmiş Ad";
        await admin.saveEmployee();
        
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/users/1"), 
            expect.objectContaining({ method: "PUT" })
        );
    });

    test('addNewRequest() handles valid and invalid input', async () => {
        window.alert = jest.fn();
        document.getElementById("add-request-text").value = "";
        admin.addNewRequest();
        expect(window.alert).toHaveBeenCalledWith("İstek metni boş olamaz!");

        document.getElementById("add-request-text").value = "Yeni İstek";
        await admin.addNewRequest();
        expect(global.fetch).toHaveBeenCalledWith("/api/requests", expect.objectContaining({ method: "POST" }));
    });

    test('resetIngredientForm() clears selection', () => {
        const select = document.getElementById("add-ing-isim");
        select.value = "Test";
        admin.resetIngredientForm();
        expect(select.value).toBe("");
    });

    test('resetMoodForm() restores default UI state', () => {
        admin.resetMoodForm();
        expect(document.querySelector("#mood-add-form h3").innerText).toBe("Yeni Ruh Hali Ekle");
        expect(document.getElementById("add-mood-isim").value).toBe("");
    });

    test('resetMenuForm() clears all menu inputs', () => {
        document.getElementById("add-isim").value = "Çöp";
        admin.resetMenuForm();
        expect(document.getElementById("add-isim").value).toBe("");
        expect(document.getElementById("upload-placeholder").style.display).toBe("block");
    });

    test('previewNewEmpPhoto() and previewMenuImage() use FileReader', () => {
        const file = new File([""], "test.png", { type: "image/png" });
        const event = { target: { files: [file] } };

        admin.previewNewEmpPhoto(event);
        expect(document.getElementById("new-emp-photo-display").innerHTML).toContain('img src="data:image/png;base64,mock"');

        admin.previewMenuImage(event);
        expect(document.getElementById("upload-preview-img").src).toContain("data:image/png;base64,mock");
    });

    test('logout() calls API and redirects', async () => {
        // Mocking window.location
        delete window.location;
        window.location = { href: "" };

        await admin.logout();
        expect(global.fetch).toHaveBeenCalledWith("/api/logout", { method: "POST" });
    });

    test('deleteEmployee and deleteRequest trigger modals', () => {
        admin.deleteEmployee(1);
        expect(document.getElementById("delete-modal").classList.contains("open")).toBe(true);
        admin.closeDeleteModal();

        admin.deleteRequest(1);
        expect(document.getElementById("delete-modal").classList.contains("open")).toBe(true);
    });
});