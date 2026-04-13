FROM node:18-alpine

WORKDIR /app

# 複製 package.json
COPY apps/api/package.json ./

# 安裝依賴
RUN npm install --production

# 複製所有應用代碼
COPY apps/api/*.js ./

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]
