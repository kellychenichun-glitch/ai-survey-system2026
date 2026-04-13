# 🚀 Render.com 部署指南 - 超簡單 3 步驟

## ✨ 為什麼選 Render？

- ✅ **完全免費開始**（免費方案夠測試用）
- ✅ **自動部署**（推送到 GitHub 就自動更新）
- ✅ **自動 SSL**（免費 HTTPS）
- ✅ **3 分鐘上線**
- ✅ **之後可以輕鬆搬到 AWS**

---

## 📋 前置準備

1. GitHub 帳號（用來存放程式碼）
2. Render 帳號（免費註冊）
3. Claude API Key（如果要用 AI 功能）

---

## 🎯 部署步驟

### 步驟 1：上傳到 GitHub ⏱️ 2 分鐘

```bash
# 1. 解壓縮專案
cd ~/Downloads
tar -xzf ai-survey-system-git.tar.gz
cd ai-survey-system

# 2. 執行 GitHub 上傳腳本
./scripts/upload-to-github.sh
```

按照提示輸入：
- GitHub 使用者名稱
- Repository 名稱（預設：ai-survey-system）
- Email

**完成！** 您的程式碼現在在 GitHub 上了！

---

### 步驟 2：連接到 Render ⏱️ 1 分鐘

1. **訪問** https://render.com
2. **註冊/登入**（可以用 GitHub 登入）
3. **點擊** "New +" → "Blueprint"
4. **選擇** "Connect a repository"
5. **授權** Render 訪問您的 GitHub
6. **選擇** `ai-survey-system` repository
7. **點擊** "Connect"

Render 會自動偵測到 `render.yaml` 配置檔！

---

### 步驟 3：設定環境變數 ⏱️ 30 秒

在 Render Dashboard：

1. 找到 **ai-survey-api** 服務
2. 點擊進入
3. 找到 **Environment** 標籤
4. 添加：
   ```
   CLAUDE_API_KEY = 您的 Claude API Key
   ```
5. **點擊** "Save Changes"

**完成！** 🎉

---

## ✅ 部署完成

### Render 會自動：
1. ✅ 建立 PostgreSQL 資料庫
2. ✅ 建立 Redis 快取
3. ✅ 執行 Migration
4. ✅ 建立測試資料
5. ✅ 啟動 API 服務
6. ✅ 提供公開網址

### 您會得到：
```
https://ai-survey-api.onrender.com
```

### 訪問 API 文件：
```
https://ai-survey-api.onrender.com/api/docs
```

---

## 🎊 測試您的 API

### 1. 訪問 Swagger 文件
```
https://您的網址.onrender.com/api/docs
```

### 2. 測試登入
使用測試帳號：
- Email: `admin@example.com`
- Password: `Admin123!`

### 3. 開始使用！
- 建立問卷
- 執行 AI 分析
- 查看結果

---

## 💰 費用說明

### 免費方案包含：
- ✅ PostgreSQL (256MB)
- ✅ Redis (25MB)
- ✅ Web Service (512MB RAM)
- ✅ 自動 SSL
- ✅ 每月 750 小時運行時間

**限制：**
- ⚠️ 15 分鐘無活動會休眠
- ⚠️ 喚醒需要 30 秒
- ⚠️ 適合測試，不適合正式產品

### 升級到付費方案：
- **Starter**: $7/月（不會休眠）
- **Standard**: $25/月（更多資源）

---

## 🔄 自動部署

### 每次推送到 GitHub，Render 會自動：
1. 偵測到更新
2. 重新建置
3. 執行 Migration
4. 部署新版本

**您不需要做任何事！**

---

## 🚚 之後要搬到 AWS？

### 超簡單！因為我們用 Docker：

```bash
# 1. 推送到 AWS ECR
docker push your-image

# 2. 部署到 AWS ECS
aws ecs update-service ...

# 3. 更新資料庫連線
# 只需要改環境變數！
```

**所有程式碼都一樣，不用改！**

---

## 🆘 常見問題

### Q1: 服務一直在建置中？
A: 第一次部署需要 3-5 分鐘，請耐心等待。

### Q2: 部署失敗？
A: 檢查 Render Logs，通常是環境變數沒設定。

### Q3: 如何查看 Logs？
A: Dashboard → 選擇服務 → Logs 標籤

### Q4: 免費方案夠用嗎？
A: 測試完全夠用！正式上線建議升級到 $7/月方案。

### Q5: 如何更新程式碼？
A: 推送到 GitHub，Render 自動更新！

---

## 🎯 下一步

部署成功後，您可以：

1. **設定自訂域名**
   - Dashboard → Settings → Custom Domain
   
2. **查看監控數據**
   - Dashboard → Metrics
   
3. **設定自動備份**
   - Dashboard → Database → Backups

4. **邀請團隊成員**
   - Dashboard → Account → Team

---

## 📞 需要幫助？

如果遇到問題：
1. 查看 Render 官方文件
2. 截圖錯誤訊息給我
3. 我會幫您解決！

---

**預計總時間：5 分鐘**  
**難度：⭐☆☆☆☆（超簡單）**

**讓我們開始吧！** 🚀
