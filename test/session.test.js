/**
 * @jest-environment jsdom
 */

// 1. Import the function
const { sessionStart } = require('../session.js');

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

describe('Session Logic (session.js)', () => {
    
    beforeEach(() => {
        // Clear environment before each test
        localStorage.clear();
        jest.clearAllMocks();
        
        // Mock window.location features not supported by JSDOM
        delete window.location;
        window.location = {
            search: '',
            replace: jest.fn()
        };

        // Mock global fetch
        global.fetch = jest.fn();
        
        // Mock alert to prevent "Not implemented" errors
        window.alert = jest.fn();
        
        // Suppress console.error in test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    test('sessionStart() saves table and pwd to POST body', async () => {
        // Setup URL: ?table=5&pwd=abc
        window.location.search = '?table=5&pwd=abc';
        
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ hashcode: 'fake-hash' })
        });

        await sessionStart();

        // Verify localStorage
        expect(localStorage.getItem('masaNo')).toBe('5');
        expect(localStorage.getItem('sessionHash')).toBe('fake-hash');

        // Verify API call
        expect(global.fetch).toHaveBeenCalledWith('/api/session', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"masaNo":"5"')
        }));
        
        // Verify Redirect
        expect(window.location.replace).toHaveBeenCalledWith('/');
    });

    test('sessionStart() uses defaults when URL params are missing', async () => {
        window.location.search = ''; // No params
        
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        await sessionStart();

        expect(localStorage.getItem('masaNo')).toBe('Bilinmeyen Masa');
        const body = JSON.parse(global.fetch.mock.calls[0][1].body);
        expect(body.password).toBe('');
    });

    test('sessionStart() handles server error (403/404)', async () => {
        window.location.search = '?table=1';
        
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Masa kapalı' })
        });

        await sessionStart();

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Masa kapalı'));
        expect(window.location.replace).not.toHaveBeenCalled();
    });

    test('sessionStart() handles network failure (catch block)', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        await sessionStart();

        expect(console.error).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Sunucuya bağlanılamadı.');
    });

    test('window.onload is assigned correctly', () => {
        // Reloading the script to check side-effect
        require('../session.js');
        expect(typeof window.onload).toBe('function');
    });
});