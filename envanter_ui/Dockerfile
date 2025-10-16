# React UI Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci

# Uygulama dosyalarını kopyala
COPY . .

# Port'u expose et
EXPOSE 3000

# Geliştirme sunucusunu başlat
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
