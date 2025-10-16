# Node.js API Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle (dev bağımlılıkları dahil)
RUN npm ci

# Uygulama dosyalarını kopyala
COPY . .

# Prisma Client'ı generate et
RUN npx prisma generate

# Port'u expose et
EXPOSE 3001

# Geliştirme modu için nodemon ile başlat
CMD ["npm", "run", "dev"]
