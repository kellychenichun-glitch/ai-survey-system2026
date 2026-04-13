# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製源碼
COPY . .

# 建置
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# 複製依賴和建置結果
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 複製資料庫相關檔案
COPY src/database ./src/database

# 暴露端口
EXPOSE 3000

# 啟動命令
CMD ["sh", "-c", "npx typeorm migration:run -d src/database/data-source.ts && node dist/main.js"]
