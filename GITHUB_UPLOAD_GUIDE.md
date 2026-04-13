# 📦 將專案上傳到 GitHub

## 方法 1：使用已打包的 Git Repository（推薦）

### 步驟 1：下載並解壓縮

下載 `ai-survey-system-git.tar.gz` 後：

```bash
# 移動到下載目錄
cd ~/Downloads

# 解壓縮
tar -xzf ai-survey-system-git.tar.gz

# 進入專案目錄
cd ai-survey-system
```

### 步驟 2：在 GitHub 上建立新的 Repository

1. 訪問 https://github.com/new
2. Repository name: `ai-survey-system`
3. Description: `AI 多通路客服與問卷分析系統`
4. **不要**勾選 "Add a README file"、"Add .gitignore"、"Choose a license"
5. 點擊 "Create repository"

### 步驟 3：推送到 GitHub

複製 GitHub 給您的指令，通常是：

```bash
# 設定遠端 repository
git remote add origin https://github.com/YOUR_USERNAME/ai-survey-system.git

# 重命名分支為 main（GitHub 預設）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

**如果使用 SSH：**
```bash
git remote add origin git@github.com:YOUR_USERNAME/ai-survey-system.git
git branch -M main
git push -u origin main
```

### 步驟 4：驗證上傳成功

訪問您的 GitHub repository：
```
https://github.com/YOUR_USERNAME/ai-survey-system
```

您應該會看到所有檔案！

---

## 方法 2：從零開始建立 GitHub Repository

### 步驟 1：解壓縮專案

```bash
cd ~/Downloads
tar -xzf ai-survey-system-git.tar.gz
cd ai-survey-system
```

### 步驟 2：初始化 Git（如果需要）

```bash
# 檢查是否已經是 Git repository
git status

# 如果不是，初始化
git init
git add .
git commit -m "Initial commit: AI Survey System MVP"
```

### 步驟 3：建立 GitHub Repository

同方法 1 的步驟 2

### 步驟 4：連接並推送

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-survey-system.git
git branch -M main
git push -u origin main
```

---

## 🎯 完成後，其他人可以這樣使用

### Clone 專案

```bash
git clone https://github.com/YOUR_USERNAME/ai-survey-system.git
cd ai-survey-system
```

### 啟動系統

```bash
# 啟動 Docker 服務
docker-compose up -d

# 安裝依賴
cd apps/api
npm install

# 設定環境變數
cp ../../.env.example .env

# 初始化資料庫
npm run db:migrate
npm run db:seed

# 啟動 API
npm run dev
```

---

## 📝 建議的 GitHub Repository 設定

### 1. 添加 Repository Description

在 GitHub repository 頁面，點擊齒輪圖示設定：

- **Description**: `AI-powered multi-channel customer service and survey analysis system`
- **Website**: `http://localhost:3000` (或您的部署網址)
- **Topics**: `nestjs`, `typescript`, `ai`, `claude-api`, `survey`, `analytics`, `postgresql`, `docker`

### 2. 建立 Branch Protection Rules

Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✓ Require pull request reviews before merging
- ✓ Require status checks to pass before merging

### 3. 添加 GitHub Actions (可選)

建立 `.github/workflows/ci.yml` 進行自動測試：

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/api && npm ci
      - run: cd apps/api && npm run build
      - run: cd apps/api && npm test
```

### 4. 添加 LICENSE

建議使用 MIT License：

在 GitHub 上：
- 點擊 "Add file" → "Create new file"
- 檔案名稱：`LICENSE`
- 選擇 "MIT License" 模板

---

## 🔐 保護敏感資訊

**重要提醒：**

`.env.example` 已經在 repository 中，但實際的 `.env` 檔案會被 `.gitignore` 排除。

**永遠不要將以下資訊上傳到 GitHub：**
- ❌ `.env` 檔案
- ❌ 實際的 API Keys（CLAUDE_API_KEY）
- ❌ 資料庫密碼
- ❌ JWT_SECRET

**如果需要設定 GitHub Secrets (用於 CI/CD)：**

Settings → Secrets and variables → Actions → New repository secret

添加：
- `CLAUDE_API_KEY`
- `DATABASE_PASSWORD`
- `JWT_SECRET`

---

## 📚 推薦的 README Badges

在 README.md 頂部添加：

```markdown
![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
```

---

## 🎉 完成！

您的專案現在已經在 GitHub 上了！

**下一步：**
1. ⭐ 給專案加個 Star
2. 📝 完善 README
3. 🐛 使用 Issues 追蹤待辦事項
4. 🔀 使用 Pull Requests 管理新功能
5. 📦 考慮發布到 npm (如果要做成套件)

---

## 🆘 常見問題

### Q: 推送時要求輸入帳號密碼

GitHub 已停止支援密碼認證，請使用以下方式之一：

**選項 1：使用 Personal Access Token**
1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. 勾選 `repo` 權限
4. 複製 token
5. 推送時使用 token 作為密碼

**選項 2：設定 SSH Key（推薦）**
```bash
# 生成 SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 複製公鑰
cat ~/.ssh/id_ed25519.pub

# 添加到 GitHub: Settings → SSH and GPG keys → New SSH key
```

然後使用 SSH URL：
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/ai-survey-system.git
```

### Q: 檔案太大無法推送

如果遇到大檔案問題，使用 Git LFS：
```bash
brew install git-lfs
git lfs install
git lfs track "*.large_file_extension"
git add .gitattributes
git commit -m "Add Git LFS"
git push
```

---

**祝您順利將專案上傳到 GitHub！** 🚀
