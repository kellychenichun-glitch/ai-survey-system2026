# 🚀 部署指南

完整的 AI Survey System 部署指南。

## 📋 目錄

1. [開發環境部署](#開發環境部署)
2. [生產環境部署](#生產環境部署)
3. [Docker 部署](#docker-部署)
4. [環境變數配置](#環境變數配置)
5. [資料庫設定](#資料庫設定)
6. [常見問題](#常見問題)

---

## 開發環境部署

### 前置需求

- Node.js >= 18.0.0
- Docker & Docker Compose
- pnpm >= 8.0.0
- Git

### 快速啟動

```bash
# 1. Clone 專案
git clone <repository-url>
cd ai-survey-system

# 2. 使用快速啟動腳本
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh
```

### 手動啟動

```bash
# 1. 啟動基礎設施
docker-compose -f docker-compose.dev.yml up -d

# 2. 安裝依賴
cd apps/api
npm install

# 3. 設定環境變數
cp ../../.env.example .env
# 編輯 .env 檔案，設定必要的環境變數

# 4. 執行 Migration
npm run db:migrate

# 5. 建立測試資料
npm run db:seed

# 6. 啟動 API
npm run dev
```

### 驗證安裝

```bash
# 執行健康檢查
chmod +x scripts/health-check.sh
./scripts/health-check.sh

# 測試 API
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

---

## 生產環境部署

### 方式 1: Docker Compose（推薦）

#### 準備工作

```bash
# 1. 建立生產環境配置
cp .env.example .env.production

# 2. 編輯生產環境變數
nano .env.production
```

**重要環境變數：**
```bash
NODE_ENV=production
DATABASE_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
JWT_SECRET=<random-64-char-string>
CLAUDE_API_KEY=<your-claude-api-key>
```

#### 部署步驟

```bash
# 1. 建置應用程式
cd apps/api
npm run build

# 2. 啟動所有服務
docker-compose up -d

# 3. 執行 Migration
docker-compose exec api npm run db:migrate

# 4. 建立初始資料
docker-compose exec api npm run db:seed

# 5. 驗證服務狀態
docker-compose ps
```

### 方式 2: 獨立部署

#### 資料庫服務器

```bash
# 安裝 PostgreSQL 16
sudo apt update
sudo apt install postgresql-16 postgresql-contrib

# 建立資料庫
sudo -u postgres createdb ai_survey_system
sudo -u postgres createuser aisurvey_user -P

# 設定權限
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_survey_system TO aisurvey_user;"
```

#### Redis 服務器

```bash
# 安裝 Redis
sudo apt install redis-server

# 設定密碼
sudo nano /etc/redis/redis.conf
# 設定: requirepass your-strong-password

# 重啟服務
sudo systemctl restart redis
```

#### 應用服務器

```bash
# 1. 安裝 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 2. 安裝 PM2
sudo npm install -g pm2

# 3. 部署應用程式
cd /opt/ai-survey-system
git clone <repository-url> .
cd apps/api
npm install
npm run build

# 4. 設定環境變數
nano .env

# 5. 執行 Migration
npm run db:migrate

# 6. 啟動應用程式
pm2 start dist/main.js --name ai-survey-api

# 7. 設定開機自啟
pm2 startup
pm2 save
```

---

## Docker 部署

### 單容器部署

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**建置與執行：**
```bash
# 建置映像
docker build -t ai-survey-api:latest .

# 執行容器
docker run -d \
  --name ai-survey-api \
  -p 3000:3000 \
  --env-file .env.production \
  ai-survey-api:latest
```

### Docker Compose 完整部署

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: ai_survey_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  api:
    build: ./apps/api
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

---

## 環境變數配置

### 必要變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| DATABASE_HOST | 資料庫主機 | localhost |
| DATABASE_PASSWORD | 資料庫密碼 | strong_password |
| JWT_SECRET | JWT 密鑰 | 64位隨機字串 |
| CLAUDE_API_KEY | Claude API 金鑰 | sk-ant-xxx |

### 生產環境建議

```bash
# 資料庫
DATABASE_HOST=db.example.com
DATABASE_PORT=5432
DATABASE_USER=aisurvey_prod
DATABASE_PASSWORD=<generated-strong-password>
DATABASE_NAME=ai_survey_system

# Redis
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=<generated-strong-password>

# JWT
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRATION=3600

# Claude API
CLAUDE_API_KEY=<your-claude-api-key>
CLAUDE_MODEL=claude-sonnet-4-20250514

# 應用程式
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://admin.example.com
```

---

## 資料庫設定

### 備份策略

```bash
# 每日備份
pg_dump -U postgres ai_survey_system | gzip > backup_$(date +%Y%m%d).sql.gz

# 自動備份腳本
cat > /etc/cron.daily/backup-db << 'EOF'
#!/bin/bash
pg_dump -U postgres ai_survey_system | gzip > /backup/db_$(date +%Y%m%d_%H%M%S).sql.gz
find /backup -name "db_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /etc/cron.daily/backup-db
```

### 效能優化

```sql
-- 建立必要索引
CREATE INDEX CONCURRENTLY idx_surveys_status ON surveys(status);
CREATE INDEX CONCURRENTLY idx_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX CONCURRENTLY idx_answers_response_id ON survey_response_answers(response_id);

-- 設定連線池
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '10MB';

-- 重新載入配置
SELECT pg_reload_conf();
```

---

## 監控與日誌

### PM2 監控

```bash
# 查看狀態
pm2 status

# 查看日誌
pm2 logs ai-survey-api

# 監控儀表板
pm2 monit

# 重啟應用
pm2 restart ai-survey-api
```

### Docker 日誌

```bash
# 查看日誌
docker-compose logs -f api

# 查看特定服務
docker-compose logs -f postgres

# 查看最近 100 行
docker-compose logs --tail=100 api
```

---

## 常見問題

### Q1: 無法連接資料庫

```bash
# 檢查資料庫狀態
docker-compose ps postgres

# 測試連線
docker exec -it ai-survey-postgres psql -U postgres -d ai_survey_system

# 檢查網路
docker network ls
docker network inspect ai-survey-network
```

### Q2: Migration 失敗

```bash
# 查看 Migration 狀態
npm run typeorm migration:show

# 強制回復
npm run db:migrate:revert

# 重新執行
npm run db:migrate
```

### Q3: API 無法啟動

```bash
# 檢查環境變數
printenv | grep DATABASE

# 檢查端口佔用
lsof -i :3000

# 查看詳細錯誤
npm run dev
```

### Q4: 記憶體不足

```bash
# 增加 Node.js 記憶體限制
NODE_OPTIONS="--max-old-space-size=4096" npm run start:prod

# Docker 記憶體限制
docker-compose up -d --scale api=1 --memory="2g"
```

---

## 安全性檢查清單

- [ ] 更改所有預設密碼
- [ ] 使用強隨機 JWT_SECRET
- [ ] 啟用 HTTPS
- [ ] 設定防火牆規則
- [ ] 定期更新依賴套件
- [ ] 設定 Rate Limiting
- [ ] 啟用資料庫備份
- [ ] 配置監控告警
- [ ] 限制 CORS 來源
- [ ] 審查日誌權限

---

## 效能調校建議

### 資料庫

- 使用連線池（建議 50-100 連線）
- 定期執行 VACUUM ANALYZE
- 監控慢查詢
- 使用適當的索引

### API

- 啟用 Response Compression
- 配置 Redis 快取
- 使用 Load Balancer
- 設定合理的 Rate Limiting

### 背景任務

- 使用 BullMQ 處理耗時任務
- 配置合理的 Worker 數量
- 監控 Queue 長度
- 設定失敗重試策略

---

## 擴展建議

### 水平擴展

```bash
# 使用 Docker Compose Scale
docker-compose up -d --scale api=3

# 配置 Nginx Load Balancer
upstream api_backend {
    server api1:3000;
    server api2:3000;
    server api3:3000;
}
```

### 垂直擴展

- 增加伺服器 CPU/記憶體
- 優化資料庫查詢
- 使用 CDN 加速靜態資源

---

## 支援

如有部署問題，請：
1. 查看日誌檔案
2. 檢查環境變數配置
3. 執行健康檢查腳本
4. 建立 GitHub Issue

---

**祝部署順利！** 🎉
