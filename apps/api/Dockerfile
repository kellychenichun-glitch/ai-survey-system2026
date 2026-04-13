FROM node:18-alpine

WORKDIR /app

# 從正確的路徑複製檔案（相對於 repository 根目錄）
COPY apps/api/package.json ./

# 安裝依賴
RUN npm install --production

# 複製應用代碼
COPY apps/api/index.js ./

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]
