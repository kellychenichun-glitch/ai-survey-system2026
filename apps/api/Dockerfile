# 使用 Node.js 18 Alpine 作為基礎映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製應用程式代碼
COPY . .

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]
