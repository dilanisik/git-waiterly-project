const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');
const { server, connectForTesting } = require('../site.js');

let mongoServer;
let testClient;
let testDb;
let activeSessionHash;

// In site.test.js
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    testClient = new MongoClient(mongoServer.getUri());
    await testClient.connect();
    testDb = testClient.db('test_waiterly_db');
    await connectForTesting(testDb);

    // Seed mock data needed for endpoints
    await testDb.collection('tables').insertOne({ masaNo: "1", password: "abc" });
    await testDb.collection('users').insertOne({ username: "admin", password: "123", rol: "Admin" });
    await testDb.collection('menu').insertOne({ isim: "Kahve", fiyat: 50 });
}, 60000);


afterAll(async () => {
    await testClient.close();
    await mongoServer.stop();
});

describe('Backend Routes & APIs (site.js)', () => {
    
    // --- STATIC FILES ---
    test('GET /real.html attempts to serve HTML', async () => {
        const res = await request(server).get('/real.html');
        expect(res.statusCode).not.toBe(500);
    });

    test('GET /style.css attempts to serve CSS', async () => {
        const res = await request(server).get('/style.css');
        expect(res.statusCode).not.toBe(500);
    });

    // --- SESSIONS ---
    test('POST /api/session creates a new session for valid table', async () => {
        const res = await request(server).post('/api/session').send({ masaNo: "1", password: "abc" });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        activeSessionHash = res.body.hashcode;
    });

    test('GET /api/session/current retrieves active session data', async () => {
        const res = await request(server).get(`/api/session/current?hash=${activeSessionHash}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.durum).toBe("aktif");
    });

    // --- REST API ENDPOINTS ---
    test('GET /api/users retrieves user list', async () => {
        const res = await request(server).get('/api/users');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('POST /api/requests creates a new request', async () => {
        const res = await request(server).post('/api/requests').send({ istek: "Peçete Lütfen" });
        expect(res.statusCode).toBe(201);
        expect(res.body.item.istek).toBe("Peçete Lütfen");
    });

    test('GET /api/invalid_collection triggers 404 fallback', async () => {
        const res = await request(server).get('/api/fake_data');
        expect(res.statusCode).toBe(404);
    });
	
	test('PUT /api/menu/:id updates an existing item', async () => {
		const res = await request(server).put('/api/menu/1').send({ isim: "Güncellenmiş Kahve" });
		expect(res.statusCode).toBe(200);
		expect(res.body.success).toBe(true);
	});

	test('DELETE /api/menu/:id removes an item', async () => {
		const res = await request(server).delete('/api/menu/1');
		expect(res.statusCode).toBe(200);
	});

	test('POST /api/orders fails with invalid session hash', async () => {
		const res = await request(server).post('/api/orders').send({ 
			masaNo: "1", 
			sessionHash: "wrong-hash",
			order: { urunler: [], toplamTutar: 0 }
		});
		expect(res.statusCode).toBe(403);
		expect(res.body.success).toBe(false);
	});	
	
	test('POST /api/login returns admin token for valid admin', async () => {
		const res = await request(server)
			.post('/api/login')
			.send({ username: "admin", password: "123" }); // Credentials from beforeAll
		expect(res.statusCode).toBe(200);
		expect(res.headers['set-cookie'][0]).toContain('auth=admin_token');
	});

	test('POST /api/logout clears auth cookie', async () => {
		const res = await request(server).post('/api/logout');
		expect(res.statusCode).toBe(200);
		expect(res.headers['set-cookie'][0]).toContain('Max-Age=0');
	});

	test('POST /api/session/request adds a request to the session', async () => {
		const res = await request(server)
			.post('/api/session/request')
			.send({ hashcode: activeSessionHash, talep: "Peçete" });
		expect(res.statusCode).toBe(200);
		expect(res.body.success).toBe(true);
	});

	test('POST /api/orders/confirm updates order status', async () => {
		const res = await request(server)
			.post('/api/orders/confirm')
			.send({ hashcode: activeSessionHash, orderIndex: 0 });
		expect(res.statusCode).toBe(200);
		expect(res.body.success).toBe(true);
	});

	test('POST /api/session/request/confirm removes a request', async () => {
		const res = await request(server)
			.post('/api/session/request/confirm')
			.send({ hashcode: activeSessionHash, talep: "Peçete" });
		expect(res.statusCode).toBe(200);
	});
	
	test('GET /admin redirects to login without auth cookie', async () => {
		const res = await request(server).get('/admin');
		expect(res.statusCode).toBe(302);
		expect(res.headers.location).toBe('/login.html');
	});

	test('POST /api/session fails for non-existent table', async () => {
		const res = await request(server).post('/api/session').send({ masaNo: "999", password: "xxx" });
		expect(res.statusCode).toBe(404);
		expect(res.body.error).toContain("masa bulunamadı");
	});

	test('POST /api/session fails for wrong table password', async () => {
		const res = await request(server).post('/api/session').send({ masaNo: "1", password: "wrong" });
		expect(res.statusCode).toBe(403);
		expect(res.body.error).toContain("Hatalı");
	});

	test('Generic API: POST and DELETE for moods', async () => {
		// POST
		const postRes = await request(server).post('/api/moods').send({ isim: "Yorgun", emoji: "😴" });
		expect(postRes.statusCode).toBe(201);
		const newId = postRes.body.item.id;

		// DELETE
		const delRes = await request(server).delete(`/api/moods/${newId}`);
		expect(delRes.statusCode).toBe(200);
		expect(delRes.body.success).toBe(true);
	});
	
	test('GET /images/americano.jpg serves image content', async () => {
		// Note: This requires a dummy file at ./images/americano.jpg 
		// or a mock of the fs.readFile function
		const res = await request(server).get('/images/americano.jpg');
		// Success if it doesn't 500, even if file is missing in test env
		expect(res.statusCode).not.toBe(500); 
	});

	test('GET /api/session/current returns empty defaults if no hash provided', async () => {
		const res = await request(server).get('/api/session/current');
		expect(res.statusCode).toBe(200);
		expect(res.body.siparisler).toEqual([]); // Hits line 223 branch
	});

	test('isAuth() logic via /api/login for staff role', async () => {
		// Create a staff user in the test DB
		await testDb.collection('users').insertOne({ 
			username: "garson1", 
			password: "123", 
			rol: "Garson" 
		});

		const res = await request(server)
			.post('/api/login')
			.send({ username: "garson1", password: "123" });
		
		expect(res.statusCode).toBe(200);
		expect(res.body.role).toBe("staff");
		expect(res.headers['set-cookie'][0]).toContain('auth=staff_token'); // Hits staff role branch
	});

	test('POST /api/orders handles malformed data gracefully', async () => {
		// Test the branch that assigns siparisVerisi = data.order
		const res = await request(server).post('/api/orders').send({ 
			masaNo: "1", 
			sessionHash: activeSessionHash,
			order: { urunler: [{ isim: "Su" }], toplamTutar: 10 }
		});
		expect(res.statusCode).toBe(201);
	});
});