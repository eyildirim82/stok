# Envanter Yönetim Sistemi - Docker Compose Komutları

.PHONY: help build up down restart logs clean migrate

# Varsayılan hedef
help:
	@echo "Kullanılabilir komutlar:"
	@echo "  make build     - Tüm servisleri build et"
	@echo "  make up        - Tüm servisleri başlat"
	@echo "  make down      - Tüm servisleri durdur"
	@echo "  make restart   - Tüm servisleri yeniden başlat"
	@echo "  make logs      - Tüm servislerin loglarını göster"
	@echo "  make clean     - Tüm container'ları ve volume'ları temizle"
	@echo "  make migrate   - Prisma migration'ını çalıştır"
	@echo "  make db-only   - Sadece veritabanını başlat"
	@echo "  make api-only  - Sadece API'yi başlat"
	@echo "  make ui-only   - Sadece UI'yi başlat"

# Build komutları
build:
	docker-compose build

# Başlatma komutları
up:
	docker-compose up -d

db-only:
	docker-compose up -d db

api-only:
	docker-compose up -d db api

ui-only:
	docker-compose up -d db api ui

# Durdurma komutları
down:
	docker-compose down

restart:
	docker-compose restart

# Log komutları
logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-ui:
	docker-compose logs -f ui

logs-db:
	docker-compose logs -f db

# Temizlik komutları
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

clean-all:
	docker-compose down -v --remove-orphans
	docker system prune -a -f

# Migration komutları
migrate:
	docker-compose exec api npx prisma migrate dev

migrate-reset:
	docker-compose exec api npx prisma migrate reset

migrate-deploy:
	docker-compose exec api npx prisma migrate deploy

# Prisma komutları
prisma-generate:
	docker-compose exec api npx prisma generate

prisma-studio:
	docker-compose exec api npx prisma studio

prisma-push:
	docker-compose exec api npx prisma db push

# Geliştirme komutları
dev:
	docker-compose up -d db
	@echo "Veritabanı başlatıldı. API ve UI'yi ayrı terminal'lerde çalıştırın:"
	@echo "API: cd envanter_api && npm run dev"
	@echo "UI: cd envanter_ui && npm run dev"

# Durum kontrolü
status:
	docker-compose ps

# Shell erişimi
shell-api:
	docker-compose exec api sh

shell-db:
	docker-compose exec db psql -U postgres -d envanter_db

# Test komutları
test-api:
	docker-compose exec api npm test

# Backup komutları
backup-db:
	docker-compose exec db pg_dump -U postgres envanter_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db:
	docker-compose exec -T db psql -U postgres -d envanter_db < $(FILE)
