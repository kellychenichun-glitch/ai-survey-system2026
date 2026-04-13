# 🚀 超簡單 GitHub 上傳指南

## 只需 3 個步驟！

### 1️⃣ 下載並解壓縮專案

```bash
cd ~/Downloads
tar -xzf ai-survey-system-git.tar.gz
cd ai-survey-system
```

### 2️⃣ 在 GitHub 建立 Repository

訪問：**https://github.com/new**

設定：
- Repository name: `ai-survey-system`
- 選擇 Public 或 Private
- **❌ 不要勾選任何選項**（README、.gitignore、License）
- 點擊 "Create repository"

### 3️⃣ 執行自動上傳腳本

```bash
./scripts/upload-to-github.sh
```

腳本會詢問您：
1. GitHub 使用者名稱
2. Email
3. 選擇 HTTPS 或 SSH

然後自動完成所有工作！

---

## 🔑 關於 Personal Access Token

如果選擇 HTTPS，您需要 Personal Access Token：

1. 訪問：https://github.com/settings/tokens
2. 點擊 "Generate new token (classic)"
3. 勾選 `repo` 權限
4. 複製產生的 token

推送時：
- **使用者名稱**：您的 GitHub 使用者名稱
- **密碼**：剛才複製的 token（不是您的 GitHub 密碼）

---

## ✅ 完成後

您的專案會在：
```
https://github.com/YOUR_USERNAME/ai-survey-system
```

任何人都可以這樣使用：
```bash
git clone https://github.com/YOUR_USERNAME/ai-survey-system.git
```

---

## 🆘 遇到問題？

### 問題 1：認證失敗
**解決**：確認使用 Personal Access Token，不是密碼

### 問題 2：Repository 已存在
**解決**：刪除 GitHub 上的 repository 重新建立，或使用不同名稱

### 問題 3：腳本無法執行
**解決**：
```bash
chmod +x scripts/upload-to-github.sh
./scripts/upload-to-github.sh
```

---

**就是這麼簡單！** 🎉
