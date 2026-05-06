/**
 * @jest-environment jsdom
 */

const requests = require('../requests.js');

describe('Requests.js - Ultra Coverage (Branch & Funcs Focus)', () => {
  
  beforeEach(() => {
    // DOM Yapısı
    document.body.innerHTML = `
      <div id="bildirimKutusu" style="display: none;">
        <span id="bildirimMesaji"></span>
        <h2 id="bildirimBaslik"></h2>
        <button id="bildirimButon" onclick="requests.bildirimiKapat()"></button>
      </div>
      <div id="request-list"></div>
      <template id="special-request-template">
        <div class="request-item">
          <span class="request-text"></span>
          <button class="request-button">Özel</button>
          <div class="input-area" style="display: none;">
            <input type="text" class="ozel-not" />
            <button class="gonderButonu">Gönder</button>
          </div>
        </div>
      </template>
      <template id="normal-request-template">
        <div class="request-item">
          <span class="request-text"></span>
          <button class="request-button">Normal</button>
        </div>
      </template>
    `;

    localStorage.clear();
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- FONKSİYON KAPSAMI (Funcs) ---
  test('bildirimGoster ve bildirimiKapat fonksiyonları çalışmalı', () => {
    requests.bildirimGoster('Mesaj');
    expect(document.getElementById('bildirimKutusu').style.display).toBe('flex');
    requests.bildirimiKapat();
    expect(document.getElementById('bildirimKutusu').style.display).toBe('none');
  });

  // --- BRANCH KAPSAMI: sendRequestToServer ---
  describe('sendRequestToServer Dallar (Branches)', () => {
    test('Dal 1: sessionHash yoksa false dönmeli', async () => {
      const res = await requests.sendRequestToServer('test');
      expect(res).toBe(false);
    });

    test('Dal 2: Sunucu hata cevabı (success: false) dönmeli', async () => {
      localStorage.setItem('sessionHash', 'hash');
      fetch.mockResolvedValueOnce({ json: async () => ({ success: false }) });
      const res = await requests.sendRequestToServer('test');
      expect(res).toBe(false);
    });

    test('Dal 3: Catch bloğu (Ağ hatası) çalışmalı', async () => {
      localStorage.setItem('sessionHash', 'hash');
      fetch.mockRejectedValueOnce(new Error('Fail'));
      const res = await requests.sendRequestToServer('test');
      expect(res).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  // --- BRANCH KAPSAMI: renderRequests (En Kritik Yer) ---
  describe('renderRequests Karmaşık Dallar', () => {
    
    test('Dal: ID 5 durumu özel şablonu seçmeli', () => {
      requests.renderRequests([{ id: 5, istek: 'Su' }]);
      expect(document.querySelector('.input-area')).not.toBeNull();
    });

    test('Dal: "Özel" kelimesi içeren istek özel şablonu seçmeli', () => {
      requests.renderRequests([{ id: 10, istek: 'Özel İstek' }]);
      expect(document.querySelector('.input-area')).not.toBeNull();
    });

    test('Dal: Normal istek (id != 5) normal şablonu seçmeli', () => {
      requests.renderRequests([{ id: 1, istek: 'Hesap' }]);
      expect(document.querySelector('.input-area')).toBeNull();
    });

    // --- ONCLICK DALLARI ---
    test('Normal istek butonu TIKLAMA (Başarılı)', async () => {
      localStorage.setItem('sessionHash', 'hash');
      fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) });
      
      requests.renderRequests([{ id: 1, istek: 'Hesap' }]);
      const btn = document.querySelector('.request-button');
      await btn.onclick(); // Fonksiyonun içindeki if(basarili) dalına girer
      expect(document.getElementById('bildirimMesaji').innerText).toContain('iletilmiştir');
    });

    test('Normal istek butonu TIKLAMA (Başarısız)', async () => {
      localStorage.setItem('sessionHash', 'hash');
      fetch.mockResolvedValueOnce({ json: async () => ({ success: false }) });
      
      requests.renderRequests([{ id: 1, istek: 'Hesap' }]);
      const btn = document.querySelector('.request-button');
      await btn.onclick(); // Fonksiyonun içindeki else dalına girer
      expect(document.getElementById('bildirimMesaji').innerText).toContain('Hata');
    });

    test('Özel istek GÖNDER butonu (Mesaj VARKEN)', async () => {
      localStorage.setItem('sessionHash', 'hash');
      fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) });

      requests.renderRequests([{ id: 5, istek: 'Diğer' }]);
      const input = document.querySelector('.ozel-not');
      input.value = 'Buzlu olsun';
      
      const gonderBtn = document.querySelector('.gonderButonu');
      await gonderBtn.onclick(); // if(mesaj) dalına girer
      
      expect(document.getElementById('bildirimMesaji').innerText).toContain('Not: Buzlu olsun');
    });

    test('Özel istek GÖNDER butonu (Mesaj YOKKEN)', async () => {
      localStorage.setItem('sessionHash', 'hash');
      fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) });

      requests.renderRequests([{ id: 5, istek: 'Diğer' }]);
      const gonderBtn = document.querySelector('.gonderButonu');
      await gonderBtn.onclick(); // else (mesaj yok) dalına girer
      
      expect(document.getElementById('bildirimMesaji').innerText).not.toContain('Not:');
    });
  });

  test('istekleriGoster fetch çağrısını yapmalı', async () => {
    fetch.mockResolvedValueOnce({ json: async () => [] });
    await requests.istekleriGoster();
    expect(fetch).toHaveBeenCalledWith('/api/requests');
  });
});