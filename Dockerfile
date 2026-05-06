FROM node:18-alpine

# 1. Uygulama klasörünü belirle
WORKDIR /app

# 2. Sadece paket listelerini kopyala
# Bu sayede kodun değişse bile paketler önbellekten hızlıca yüklenir
COPY package*.json ./

# 3. Bağımlılıkları imajın içine yükle (Hatanın çözümü burası)
RUN npm install

# 4. Geri kalan tüm dosyaları kopyala
COPY . .

# 5. Görsel klasörü işlemlerini yap
RUN mkdir -p images && cp -r "splitted files/images/." images/ 2>/dev/null || true

# 6. Portu aç ve başlat
EXPOSE 3000
CMD ["node", "site.js"]
