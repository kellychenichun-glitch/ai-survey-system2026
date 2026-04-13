FROM node:18-alpine

WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝所有依賴（包括 devDependencies，因為需要編譯）
RUN npm install

# 複製源代碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "run", "start:prod"]
