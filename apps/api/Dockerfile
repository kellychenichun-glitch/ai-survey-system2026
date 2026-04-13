FROM node:18-alpine

WORKDIR /app

# 複製 package.json
COPY package*.json ./

# 使用 npm install 而不是 npm ci
RUN npm install --production

# 複製應用程式代碼
COPY . .

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]
