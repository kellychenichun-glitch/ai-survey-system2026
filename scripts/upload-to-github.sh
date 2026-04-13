#!/bin/bash

echo "🚀 AI Survey System - GitHub 自動上傳腳本"
echo "=========================================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查是否在正確的目錄
if [ ! -f "package.json" ] || [ ! -f "README.md" ]; then
    echo -e "${RED}❌ 錯誤：請在專案根目錄執行此腳本${NC}"
    echo "正確的目錄應該包含 package.json 和 README.md"
    exit 1
fi

echo -e "${BLUE}步驟 1/5: 檢查 Git 狀態${NC}"
if [ ! -d ".git" ]; then
    echo "初始化 Git repository..."
    git init
    git config user.email "ai-survey@example.com"
    git config user.name "AI Survey System"
else
    echo "✓ Git repository 已存在"
fi

echo ""
echo -e "${BLUE}步驟 2/5: 建立初始 commit${NC}"
git add .
git commit -m "Initial commit: AI Survey System MVP

Features:
- Complete authentication system with JWT
- Survey management (CRUD + lifecycle)
- AI analysis engine (Claude API integration)
- Analytics system (sentiment, topics, summary)
- Database schema (52 tables)
- API documentation (Swagger)
- Docker configuration
- Complete documentation

Tech Stack:
- NestJS + TypeScript
- PostgreSQL 16
- Redis 7
- Claude API
- Docker Compose" 2>/dev/null || echo "✓ Commit 已存在"

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}請完成以下步驟：${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "1. 訪問 GitHub 建立新 repository："
echo -e "   ${GREEN}https://github.com/new${NC}"
echo ""
echo "2. 設定："
echo "   - Repository name: ai-survey-system"
echo "   - Description: AI 多通路客服與問卷分析系統"
echo "   - 選擇 Public 或 Private"
echo -e "   ${RED}- 【重要】不要勾選任何選項（README、.gitignore、License）${NC}"
echo ""
echo "3. 點擊 'Create repository'"
echo ""
echo -e "${YELLOW}========================================${NC}"
echo ""

# 詢問使用者的 GitHub 資訊
read -p "請輸入您的 GitHub 使用者名稱: " github_username

if [ -z "$github_username" ]; then
    echo -e "${RED}❌ 使用者名稱不能為空${NC}"
    exit 1
fi

echo ""
read -p "請輸入 repository 名稱 [預設: ai-survey-system]: " repo_name
repo_name=${repo_name:-ai-survey-system}

echo ""
echo -e "${BLUE}步驟 3/5: 設定 Git 使用者資訊${NC}"
read -p "請輸入您的 Git 使用者名稱 [預設: $github_username]: " git_username
git_username=${git_username:-$github_username}

read -p "請輸入您的 Email: " git_email

if [ ! -z "$git_username" ] && [ ! -z "$git_email" ]; then
    git config user.name "$git_username"
    git config user.email "$git_email"
    echo "✓ Git 使用者資訊已設定"
fi

echo ""
echo -e "${BLUE}步驟 4/5: 連接到 GitHub repository${NC}"

# 詢問使用 HTTPS 還是 SSH
echo "請選擇連接方式："
echo "1) HTTPS (需要 Personal Access Token)"
echo "2) SSH (需要設定 SSH Key)"
read -p "選擇 [1/2, 預設: 1]: " connection_type
connection_type=${connection_type:-1}

if [ "$connection_type" == "2" ]; then
    remote_url="git@github.com:${github_username}/${repo_name}.git"
else
    remote_url="https://github.com/${github_username}/${repo_name}.git"
fi

# 檢查是否已有 remote
if git remote | grep -q "origin"; then
    echo "移除現有的 origin..."
    git remote remove origin
fi

git remote add origin "$remote_url"
echo "✓ Remote repository 已設定: $remote_url"

echo ""
echo -e "${BLUE}步驟 5/5: 推送到 GitHub${NC}"

# 重命名分支為 main
git branch -M main

echo ""
echo "準備推送到 GitHub..."
echo -e "${YELLOW}如果使用 HTTPS，您需要：${NC}"
echo "  - 使用者名稱: 您的 GitHub 使用者名稱"
echo "  - 密碼: 您的 Personal Access Token (不是密碼)"
echo ""
echo -e "${YELLOW}如何取得 Personal Access Token:${NC}"
echo "  1. 訪問 https://github.com/settings/tokens"
echo "  2. 點擊 'Generate new token (classic)'"
echo "  3. 勾選 'repo' 權限"
echo "  4. 複製產生的 token"
echo ""
read -p "按 Enter 開始推送..."

# 推送到 GitHub
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🎉 成功！專案已上傳到 GitHub！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "您的 repository 位址："
    echo -e "${GREEN}https://github.com/${github_username}/${repo_name}${NC}"
    echo ""
    echo "下一步："
    echo "  1. 訪問上面的網址查看您的專案"
    echo "  2. 添加 repository description"
    echo "  3. 設定 topics (nestjs, typescript, ai, survey 等)"
    echo "  4. 邀請協作者（如果需要）"
    echo ""
    echo "其他人現在可以這樣使用您的專案："
    echo -e "${BLUE}git clone https://github.com/${github_username}/${repo_name}.git${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ 推送失敗${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "常見問題："
    echo ""
    echo "1. 認證失敗："
    echo "   - 確認您使用的是 Personal Access Token，不是密碼"
    echo "   - Token 權限需要包含 'repo'"
    echo ""
    echo "2. Repository 不存在："
    echo "   - 確認您已在 GitHub 上建立 repository"
    echo "   - 確認 repository 名稱正確"
    echo ""
    echo "3. 使用 SSH 失敗："
    echo "   - 確認已設定 SSH Key"
    echo "   - 測試連接: ssh -T git@github.com"
    echo ""
    echo "重試："
    echo "   ./scripts/upload-to-github.sh"
    echo ""
fi
