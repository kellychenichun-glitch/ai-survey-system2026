# API 使用範例

完整的 API 呼叫範例，使用 curl 命令。

## 基礎設定

```bash
# 設定 API Base URL
export API_URL="http://localhost:3000/api/v1"
```

---

## 1. 認證 API

### 登入

```bash
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**回應範例：**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

**取得 Token：**
```bash
export TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' | \
  grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo $TOKEN
```

### 取得當前使用者資訊

```bash
curl -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

### 刷新 Token

```bash
curl -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 2. 問卷 API

### 建立問卷

```bash
curl -X POST "$API_URL/surveys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "2024 Q1 客戶滿意度調查",
    "description": "評估客戶對產品與服務的滿意度",
    "survey_type": "satisfaction",
    "tags": ["客戶滿意度", "Q1", "2024"],
    "welcome_message": "感謝您撥冗填寫本問卷，您的意見對我們非常重要。",
    "completion_message": "感謝您的寶貴意見！",
    "max_responses": 1000
  }'
```

### 取得問卷列表

```bash
# 基本查詢
curl -X GET "$API_URL/surveys" \
  -H "Authorization: Bearer $TOKEN"

# 帶篩選條件
curl -X GET "$API_URL/surveys?status=published&page=1&limit=20&sort_by=created_at&sort_order=desc" \
  -H "Authorization: Bearer $TOKEN"

# 搜尋問卷
curl -X GET "$API_URL/surveys?search=客戶滿意度" \
  -H "Authorization: Bearer $TOKEN"

# 標籤篩選
curl -X GET "$API_URL/surveys?tags=市場調查,品牌" \
  -H "Authorization: Bearer $TOKEN"
```

### 取得問卷詳情

```bash
curl -X GET "$API_URL/surveys/{survey_id}" \
  -H "Authorization: Bearer $TOKEN"
```

### 更新問卷

```bash
curl -X PUT "$API_URL/surveys/{survey_id}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "2024 Q1 客戶滿意度調查 (修訂版)",
    "description": "更新後的問卷描述",
    "tags": ["客戶滿意度", "Q1", "2024", "修訂"]
  }'
```

### 發布問卷

```bash
curl -X POST "$API_URL/surveys/{survey_id}/publish" \
  -H "Authorization: Bearer $TOKEN"
```

### 暫停問卷

```bash
curl -X POST "$API_URL/surveys/{survey_id}/pause" \
  -H "Authorization: Bearer $TOKEN"
```

### 關閉問卷

```bash
curl -X POST "$API_URL/surveys/{survey_id}/close" \
  -H "Authorization: Bearer $TOKEN"
```

### 刪除問卷

```bash
curl -X DELETE "$API_URL/surveys/{survey_id}" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. 分析 API

### 執行問卷分析

```bash
# 基本分析
curl -X POST "$API_URL/analytics/surveys/{survey_id}/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "analysis_types": ["statistics", "sentiment", "topics", "summary"]
  }'

# 帶篩選條件的分析
curl -X POST "$API_URL/analytics/surveys/{survey_id}/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "analysis_types": ["statistics", "sentiment", "topics"],
    "filters": {
      "date_from": "2024-01-01",
      "date_to": "2024-03-31",
      "channels": ["web", "mobile"]
    }
  }'

# 完整分析（含報告生成）
curl -X POST "$API_URL/analytics/surveys/{survey_id}/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "analysis_types": ["statistics", "sentiment", "topics", "summary"],
    "options": {
      "include_demographics": true,
      "include_crosstab": true,
      "generate_report": true
    }
  }'
```

**分析結果範例：**
```json
{
  "success": true,
  "data": {
    "survey_id": "uuid",
    "total_responses": 150,
    "analysis_timestamp": "2024-01-15T10:30:00Z",
    "results": {
      "statistics": {
        "total_responses": 150,
        "completed_responses": 142,
        "completion_rate": 94.67,
        "avg_completion_time": 245
      },
      "sentiment": {
        "overall": {
          "positive": 85,
          "neutral": 45,
          "negative": 12,
          "positive_percentage": 59.86
        }
      },
      "topics": {
        "topics": [
          {
            "topic": "產品品質",
            "mention_count": 45,
            "percentage": 31.69,
            "sentiment": "positive"
          }
        ]
      },
      "summary": {
        "executive_summary": "...",
        "key_findings": [...],
        "recommendations": [...]
      }
    }
  }
}
```

---

## 4. 完整工作流程範例

### 建立並發布問卷

```bash
# 1. 登入
export TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' | \
  jq -r '.data.access_token')

# 2. 建立問卷
export SURVEY_ID=$(curl -s -X POST "$API_URL/surveys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "客戶體驗調查",
    "description": "了解客戶使用產品的體驗",
    "survey_type": "satisfaction"
  }' | jq -r '.data.id')

echo "Survey created: $SURVEY_ID"

# 3. 發布問卷
curl -X POST "$API_URL/surveys/$SURVEY_ID/publish" \
  -H "Authorization: Bearer $TOKEN"

# 4. 查看問卷狀態
curl -X GET "$API_URL/surveys/$SURVEY_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. 錯誤處理

### 常見錯誤回應

**401 Unauthorized - 未登入或 Token 過期**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**404 Not Found - 資源不存在**
```json
{
  "statusCode": 404,
  "message": "問卷不存在"
}
```

**400 Bad Request - 請求參數錯誤**
```json
{
  "statusCode": 400,
  "message": "驗證失敗",
  "errors": [
    {
      "field": "title",
      "message": "標題不可為空"
    }
  ]
}
```

---

## 6. 最佳實踐

### Token 管理

```bash
# 檢查 Token 是否過期
curl -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"

# 如果返回 401，重新登入
if [ $? -ne 0 ]; then
  export TOKEN=$(curl -s -X POST "$API_URL/auth/login" ...)
fi
```

### 使用 jq 處理 JSON

```bash
# 安裝 jq
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS

# 提取特定欄位
curl -s "$API_URL/surveys" -H "Authorization: Bearer $TOKEN" | \
  jq '.data.items[] | {id, title, status}'

# 格式化輸出
curl -s "$API_URL/surveys/$SURVEY_ID" -H "Authorization: Bearer $TOKEN" | \
  jq '.'
```

---

## 參考資源

- **Swagger 文件**: http://localhost:3000/api/docs
- **完整 API 文件**: 請參考 Swagger UI
- **問題回報**: 請建立 GitHub Issue

---

**提示**: 所有帶 `{survey_id}` 的地方請替換為實際的問卷 ID。
