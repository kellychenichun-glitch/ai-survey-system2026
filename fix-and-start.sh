#!/bin/bash

echo "🔧 AI Survey System - 一鍵修復腳本"
echo "======================================"
echo ""

# 顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 檢查目錄
echo "📂 步驟 1/8: 檢查目錄..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 請在專案根目錄執行此腳本${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 目錄正確${NC}"
echo ""

# 2. 檢查 Docker
echo "🐳 步驟 2/8: 檢查 Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未運行，請先啟動 Docker Desktop${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker 正常${NC}"
echo ""

# 3. 啟動 Docker 服務
echo "🚀 步驟 3/8: 啟動 Docker 服務..."
docker-compose up -d
sleep 5
echo -e "${GREEN}✓ Docker 服務已啟動${NC}"
echo ""

# 4. 進入 API 目錄
cd apps/api

# 5. 清理並安裝依賴
echo "📦 步驟 4/8: 安裝依賴..."
rm -rf node_modules package-lock.json
npm install
echo -e "${GREEN}✓ 依賴安裝完成${NC}"
echo ""

# 6. 設定環境變數
echo "⚙️  步驟 5/8: 設定環境變數..."
if [ ! -f ".env" ]; then
    cp ../../.env.example .env
    echo -e "${GREEN}✓ .env 已建立${NC}"
else
    echo -e "${YELLOW}⚠ .env 已存在，跳過${NC}"
fi
echo ""

# 7. 執行 Migration
echo "🗄️  步驟 6/8: 執行資料庫 Migration..."
npm run db:migrate
echo -e "${GREEN}✓ Migration 完成${NC}"
echo ""

# 8. 建立測試資料
echo "👥 步驟 7/8: 建立測試資料..."
npm run db:seed
echo -e "${GREEN}✓ Seed 資料建立完成${NC}"
echo ""

# 9. 啟動 API
echo "🎉 步驟 8/8: 啟動 API..."
echo ""
echo -e "${GREEN}======================================"
echo "✅ 修復完成！正在啟動 API..."
echo "======================================${NC}"
echo ""
echo "訪問以下網址："
echo "  📚 API 文件: http://localhost:3000/api/docs"
echo "  🔑 測試帳號:"
echo "     - admin@example.com / Admin123!"
echo "     - manager@example.com / Manager123!"
echo ""
echo "按 Ctrl+C 停止服務"
echo ""

npm run dev
