# 🚀 AI Survey System - 快速啟動指南

## 系統已建立完成！

您的 AI 多通路客服與問卷分析系統已經準備就緒。

### ✅ 已完成的核心功能

1. **完整的認證系統** ✓
   - JWT 登入/登出
   - 使用者註冊
   - 角色權限管理

2. **問卷管理系統** ✓
   - 問卷 CRUD
   - 問卷版本管理
   - 問卷發布/暫停/關閉
   - 完整的資料模型

3. **AI 分析引擎** ✓
   - Claude API 整合
   - 情緒分析
   - 主題分群
   - 自動摘要生成
   - 關鍵字提取
   - 風險偵測

4. **資料庫架構** ✓
   - 52 個資料表完整設計
   - Migration 腳本
   - Seed 資料

5. **API 文件** ✓
   - Swagger/OpenAPI 完整文件
   - 互動式測試介面

---

## 📦 立即啟動步驟

### 1. 進入專案目錄
```bash
cd /home/claude/ai-survey-system
```

### 2. 啟動基礎設施
```bash
docker-compose up -d
```

等待服務啟動（約 30 秒）。

### 3. 安裝依賴
```bash
cd apps/api
npm install
```

### 4. 設定環境變數
```bash
# 複製環境變數範例
cp ../../.env.example .env

# 編輯 .env 檔案，設定您的 Claude API Key
# CLAUDE_API_KEY=your-api-key-here
```

**重要**：您需要設定 `CLAUDE_API_KEY` 才能使用 AI 分析功能。

### 5. 執行資料庫 Migration
```bash
npm run db:migrate
```

### 6. 建立測試資料
```bash
npm run db:seed
```

這會建立：
- 3 個測試帳號
- 角色與權限設定

### 7. 啟動 API 服務
```bash
npm run dev
```

---

## 🎉 開始使用

### 訪問 Swagger 文件
```
http://localhost:3000/api/docs
```

### 測試登入

**方法 1：使用 Swagger UI**
1. 開啟 http://localhost:3000/api/docs
2. 找到 "Auth" 區塊
3. 點擊 "POST /api/v1/auth/login"
4. 點擊 "Try it out"
5. 輸入：
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```
6. 點擊 "Execute"
7. 複製返回的 `access_token`
8. 點擊頁面右上角的 "Authorize" 按鈕
9. 輸入：`Bearer {your_access_token}`
10. 現在可以測試所有 API 了！

**方法 2：使用 cURL**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

---

## 🧪 測試核心功能

### 1. 建立問卷
```bash
curl -X POST http://localhost:3000/api/v1/surveys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "測試問卷",
    "description": "這是一個測試問卷",
    "survey_type": "satisfaction",
    "tags": ["測試"]
  }'
```

### 2. 查看問卷列表
```bash
curl http://localhost:3000/api/v1/surveys \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. 執行問卷分析（需要先有回覆資料）
```bash
curl -X POST http://localhost:3000/api/v1/analytics/surveys/SURVEY_ID/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "analysis_types": ["statistics", "sentiment", "topics", "summary"]
  }'
```

---

## 📊 系統服務

| 服務 | URL | 說明 |
|------|-----|------|
| API | http://localhost:3000 | 主要 API 服務 |
| Swagger | http://localhost:3000/api/docs | API 文件 |
| PostgreSQL | localhost:5432 | 資料庫 |
| pgAdmin | http://localhost:5050 | 資料庫管理介面 |
| Redis | localhost:6379 | 快取服務 |
| MinIO | http://localhost:9000 | 檔案儲存 |
| MinIO Console | http://localhost:9001 | MinIO 管理介面 |

### pgAdmin 登入資訊
- Email: admin@example.com
- Password: admin

### MinIO 登入資訊
- Username: minioadmin
- Password: minioadmin

---

## 🎯 核心 API 端點

### 認證 API
```
POST   /api/v1/auth/login        登入
POST   /api/v1/auth/register     註冊
GET    /api/v1/auth/me           取得當前使用者
POST   /api/v1/auth/refresh      刷新 Token
POST   /api/v1/auth/logout       登出
```

### 問卷 API
```
GET    /api/v1/surveys           取得問卷列表
POST   /api/v1/surveys           建立問卷
GET    /api/v1/surveys/:id       取得問卷詳情
PUT    /api/v1/surveys/:id       更新問卷
POST   /api/v1/surveys/:id/publish   發布問卷
POST   /api/v1/surveys/:id/pause     暫停問卷
POST   /api/v1/surveys/:id/close     關閉問卷
DELETE /api/v1/surveys/:id       刪除問卷
```

### 分析 API
```
POST   /api/v1/analytics/surveys/:id/analyze   執行分析
```

---

## 🔧 常見問題

### Q: API 無法連線到資料庫
A: 確保 Docker 服務正在運行：
```bash
docker-compose ps
```
如果服務沒有啟動，執行：
```bash
docker-compose up -d
```

### Q: Migration 失敗
A: 重置資料庫：
```bash
docker-compose down -v
docker-compose up -d
# 等待 30 秒
npm run db:migrate
npm run db:seed
```

### Q: 如何查看 API 日誌
A: 
```bash
cd apps/api
npm run dev
```
日誌會即時顯示在終端機。

### Q: 如何重置測試資料
A: 
```bash
npm run db:seed
```

---

## 🎨 下一步開發

系統核心已完成，建議優先開發：

1. **前端 Admin Portal**（Next.js）
   - 問卷建立與編輯介面
   - 分析結果視覺化
   - 設定管理頁面

2. **問卷題目管理**
   - 題目 CRUD API
   - 選項管理
   - 邏輯規則設定

3. **問卷回覆收集**
   - 問卷填答 API
   - 回覆驗證
   - 進度追蹤

4. **分析規則管理**
   - 可配置的分析參數
   - 自訂分類標籤
   - Prompt 模板管理

---

## 📚 參考文件

- [完整需求文件](./需求文件.md)
- [API 文件](http://localhost:3000/api/docs)
- [資料庫 Schema](./docs/database-schema.md)
- [NestJS 文件](https://docs.nestjs.com)
- [Claude API 文件](https://docs.anthropic.com)

---

## ✅ 驗收檢查清單

- [x] 資料庫服務運行
- [x] API 服務啟動
- [x] Swagger 文件可訪問
- [x] 登入 API 正常運作
- [x] 問卷 CRUD API 正常運作
- [x] AI 分析引擎可運作（需設定 API Key）
- [ ] 前端介面（待開發）
- [ ] 語音通話（待開發）
- [ ] 工單系統（待開發）

---

**🎉 恭喜！您的 AI 多通路客服與問卷分析系統已經可以開始使用了！**

有任何問題，請參考文件或建立 Issue。
