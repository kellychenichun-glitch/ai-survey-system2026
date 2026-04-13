# AI 多通路客服／問卷分析系統

完整的商用級 AI 客服與問卷分析系統，支援語音、文字、問卷多通路互動，並提供強大的 AI 分析能力。

## 系統特色

### 🎯 核心功能
- **多通路客服**：電話語音、網頁聊天、WhatsApp、LINE 等
- **智能問卷系統**：支援複雜邏輯跳題、多種題型、版本管理
- **AI 分析引擎**：情緒分析、主題分群、自動摘要、風險偵測
- **可配置系統**：分析規則、語音參數、Prompt 模板皆可後台管理
- **工單管理**：自動建立工單、智能分派、SLA 追蹤

### 💎 核心價值
- ✅ **後台可配置的分析與語音參數**（系統核心特色）
- ✅ **完整的權限管理系統**
- ✅ **企業級資料庫設計**（52 個資料表）
- ✅ **RESTful API 與 Swagger 文件**
- ✅ **可擴充的模組化架構**

## 技術棧

### Backend
- **框架**: NestJS + TypeScript
- **資料庫**: PostgreSQL 16
- **快取/佇列**: Redis 7
- **ORM**: TypeORM
- **API 文件**: Swagger/OpenAPI
- **背景任務**: BullMQ

### Frontend (規劃中)
- **框架**: Next.js 14 + React 18
- **樣式**: Tailwind CSS
- **狀態管理**: Zustand
- **UI 元件**: Shadcn/ui

### AI & 整合
- **AI 引擎**: Claude API (Anthropic)
- **語音服務**: Twilio (可抽換)
- **檔案儲存**: MinIO (S3-compatible)

## 快速開始

### 前置需求

- Node.js >= 18.0.0
- Docker & Docker Compose
- pnpm >= 8.0.0

### 安裝步驟

1. **Clone 專案**
```bash
git clone <repository-url>
cd ai-survey-system
```

2. **安裝依賴**
```bash
pnpm install
```

3. **設定環境變數**
```bash
cp .env.example .env
```

編輯 `.env` 檔案，設定必要的環境變數：
- `CLAUDE_API_KEY`: Claude API 金鑰
- `TWILIO_ACCOUNT_SID`: Twilio 帳號 SID (選填)
- `TWILIO_AUTH_TOKEN`: Twilio 認證 Token (選填)

4. **啟動基礎設施 (PostgreSQL, Redis, MinIO)**
```bash
docker-compose up -d
```

等待所有服務啟動完成：
```bash
docker-compose ps
```

5. **執行資料庫 Migration**
```bash
cd apps/api
npm run db:migrate
```

6. **建立初始資料 (管理員帳號、角色權限)**
```bash
npm run db:seed
```

7. **啟動 API 服務**
```bash
cd apps/api
npm run dev
```

API 服務將啟動在 `http://localhost:3000`

### 測試 API

開啟瀏覽器訪問 Swagger 文件：
```
http://localhost:3000/api/docs
```

### 預設帳號

系統已建立三個測試帳號：

| 角色 | Email | 密碼 | 權限 |
|------|-------|------|------|
| 超級管理員 | admin@example.com | Admin123! | 完整權限 |
| 問卷管理員 | manager@example.com | Manager123! | 問卷與分析權限 |
| 客服人員 | agent@example.com | Agent123! | 客服與工單權限 |

### 登入測試

使用 Swagger 或 Postman 測試登入：

```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

成功後會返回 JWT Token，複製 `access_token` 用於後續 API 呼叫。

## 開發指令

```bash
# 安裝依賴
pnpm install

# 啟動開發環境
pnpm dev

# 建置專案
pnpm build

# 執行測試
pnpm test

# 程式碼檢查
pnpm lint

# 格式化程式碼
pnpm format
```

### 資料庫指令

```bash
# 執行 Migration
cd apps/api
npm run db:migrate

# 回復上一次 Migration
npm run db:migrate:revert

# 建立新的 Migration
npm run db:migrate:generate -- -n MigrationName

# 執行 Seed
npm run db:seed
```

### Docker 指令

```bash
# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 停止所有服務
docker-compose down

# 停止並刪除資料
docker-compose down -v
```

## 專案結構

```
ai-survey-system/
├── apps/
│   ├── api/                 # NestJS API 服務
│   ├── admin-portal/        # 後台管理系統 (Next.js)
│   ├── survey-web/          # 問卷填答介面
│   └── chat-widget/         # 聊天小工具
├── packages/
│   ├── types/               # 共享型別定義
│   ├── shared/              # 共享工具
│   ├── ai-client/           # AI 客戶端封裝
│   └── telephony/           # 電話整合套件
├── workers/
│   ├── analytics-worker/    # 分析背景工作
│   ├── dispatch-worker/     # 問卷發送工作
│   └── export-worker/       # 匯出工作
├── docker/                  # Docker 配置
└── docs/                    # 文件
```

## API 文件

啟動 API 服務後，訪問 Swagger 文件：
```
http://localhost:3000/api/docs
```

主要 API 端點：

### 認證
- `POST /api/v1/auth/login` - 登入
- `POST /api/v1/auth/register` - 註冊
- `POST /api/v1/auth/refresh` - 刷新 Token
- `GET /api/v1/auth/me` - 取得當前使用者

### 問卷
- `GET /api/v1/surveys` - 取得問卷列表
- `POST /api/v1/surveys` - 建立問卷
- `GET /api/v1/surveys/:id` - 取得問卷詳情
- `PUT /api/v1/surveys/:id` - 更新問卷
- `POST /api/v1/surveys/:id/publish` - 發布問卷

### 分析
- `POST /api/v1/analytics/surveys/:id/analyze` - 執行問卷分析
- `GET /api/v1/analytics/jobs/:jobId/result` - 取得分析結果

## 資料庫 Schema

系統包含 52 個資料表，涵蓋：
- 使用者與權限管理（5 個表）
- 客戶與聯絡人（3 個表）
- 對話與通話（8 個表）
- 知識庫（5 個表）
- 問卷系統（11 個表）
- 分析引擎（6 個表）
- 語音設定（3 個表）
- Prompt 管理（3 個表）
- 工單系統（3 個表）
- 系統設定與稽核（6 個表）

詳細 Schema 請參考：`docs/database-schema.md`

## 部署

### 開發環境
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 生產環境
```bash
docker-compose up -d
```

## 環境變數說明

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| DATABASE_HOST | 資料庫主機 | localhost |
| DATABASE_PORT | 資料庫埠號 | 5432 |
| DATABASE_USER | 資料庫使用者 | postgres |
| DATABASE_PASSWORD | 資料庫密碼 | postgres |
| DATABASE_NAME | 資料庫名稱 | ai_survey_system |
| REDIS_HOST | Redis 主機 | localhost |
| REDIS_PORT | Redis 埠號 | 6379 |
| JWT_SECRET | JWT 密鑰 | (需設定) |
| CLAUDE_API_KEY | Claude API 金鑰 | (需設定) |

完整環境變數請參考 `.env.example`

## 測試

```bash
# 單元測試
pnpm test

# E2E 測試
pnpm test:e2e

# 測試覆蓋率
pnpm test:cov
```

## 授權

本專案採用 MIT 授權

## 支援

如有問題，請建立 Issue 或聯絡專案維護者。

---

**⚡ 現在開始使用 AI 多通路客服系統！**
