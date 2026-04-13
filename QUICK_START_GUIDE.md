# 🚀 快速啟動指南 - 3 分鐘內啟動系統

## 步驟 1：啟動基礎設施 (30 秒)

```bash
cd /home/claude/ai-survey-system
docker-compose up -d
```

等待所有服務啟動...

## 步驟 2：安裝依賴 (1 分鐘)

```bash
cd apps/api
npm install
```

## 步驟 3：設定環境變數 (30 秒)

```bash
# 複製環境變數範例
cp ../../.env.example .env

# 編輯 .env 檔案（可選，系統會使用預設值）
# nano .env
```

**重要環境變數：**
- `JWT_SECRET`: 建議改成隨機字串
- `CLAUDE_API_KEY`: 如果要使用 AI 分析功能，請設定您的 API Key

## 步驟 4：初始化資料庫 (30 秒)

```bash
# 執行 Migration
npm run db:migrate

# 建立測試資料（3 個測試帳號）
npm run db:seed
```

## 步驟 5：啟動 API 服務 (10 秒)

```bash
npm run dev
```

## ✅ 完成！

您應該會看到：

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 AI Survey System API Server                        ║
║                                                          ║
║   📡 Server running on: http://localhost:3000           ║
║   📚 API Documentation: http://localhost:3000/api/docs  ║
║   🌍 Environment: development                            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

## 🎯 測試系統

### 1. 訪問 Swagger 文件
打開瀏覽器：http://localhost:3000/api/docs

### 2. 測試登入 API

使用 curl：
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

或使用測試腳本：
```bash
cd /home/claude/ai-survey-system
./scripts/test-api.sh
```

### 3. 使用 Swagger UI 測試

1. 打開 http://localhost:3000/api/docs
2. 找到 **Auth** 區塊
3. 點擊 **POST /api/v1/auth/login**
4. 點擊 **Try it out**
5. 輸入測試帳號：
   ```json
   {
     "email": "admin@example.com",
     "password": "Admin123!"
   }
   ```
6. 點擊 **Execute**
7. 複製返回的 `access_token`
8. 點擊頁面右上角的 **Authorize** 按鈕
9. 輸入：`Bearer {your_access_token}`
10. 現在可以測試所有需要認證的 API！

---

## 📝 測試帳號

| 角色 | Email | 密碼 |
|------|-------|------|
| 超級管理員 | admin@example.com | Admin123! |
| 問卷管理員 | manager@example.com | Manager123! |
| 客服人員 | agent@example.com | Agent123! |

---

## 🔍 健康檢查

執行健康檢查腳本：
```bash
./scripts/health-check.sh
```

---

## ⚠️ 常見問題

### Q: Docker 服務無法啟動
```bash
# 檢查 Docker 是否運行
docker info

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs
```

### Q: 無法連接資料庫
```bash
# 重啟 Docker 服務
docker-compose down
docker-compose up -d

# 等待 30 秒後再次嘗試
```

### Q: npm install 失敗
```bash
# 清除 cache 重試
npm cache clean --force
npm install
```

### Q: Migration 失敗
```bash
# 重置資料庫
docker-compose down -v
docker-compose up -d

# 等待 30 秒
npm run db:migrate
```

---

## 🎉 下一步

系統已啟動！您現在可以：

1. **測試 API** - 使用 Swagger UI 或 curl
2. **建立問卷** - POST /api/v1/surveys
3. **執行分析** - POST /api/v1/analytics/surveys/:id/analyze
4. **查看文件** - 閱讀 README.md 和其他文件

---

**祝使用順利！** 🚀

如有問題，請查看：
- [完整文件](README.md)
- [API 範例](docs/API_EXAMPLES.md)
- [部署指南](docs/DEPLOYMENT.md)
