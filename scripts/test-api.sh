#!/bin/bash

# API Test Script
# This script tests the main API endpoints

BASE_URL="http://localhost:3000/api/v1"
TOKEN=""

echo "🧪 AI Survey System - API Test"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Login
echo -e "${BLUE}Test 1: Login${NC}"
echo "POST $BASE_URL/auth/login"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""

# Test 2: Get current user
echo -e "${BLUE}Test 2: Get Current User${NC}"
echo "GET $BASE_URL/auth/me"

ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✓ Get user info successful${NC}"
    echo "User: $(echo "$ME_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)"
else
    echo -e "${RED}✗ Get user info failed${NC}"
    echo "Response: $ME_RESPONSE"
fi

echo ""

# Test 3: Create Survey
echo -e "${BLUE}Test 3: Create Survey${NC}"
echo "POST $BASE_URL/surveys"

SURVEY_RESPONSE=$(curl -s -X POST "$BASE_URL/surveys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "API 測試問卷",
    "description": "這是透過 API 建立的測試問卷",
    "survey_type": "satisfaction",
    "tags": ["測試", "API"],
    "welcome_message": "歡迎填寫問卷",
    "completion_message": "感謝您的填寫"
  }')

if echo "$SURVEY_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Create survey successful${NC}"
    SURVEY_ID=$(echo "$SURVEY_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "Survey ID: $SURVEY_ID"
else
    echo -e "${RED}✗ Create survey failed${NC}"
    echo "Response: $SURVEY_RESPONSE"
fi

echo ""

# Test 4: Get Survey List
echo -e "${BLUE}Test 4: Get Survey List${NC}"
echo "GET $BASE_URL/surveys"

SURVEYS_RESPONSE=$(curl -s -X GET "$BASE_URL/surveys?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SURVEYS_RESPONSE" | grep -q "items"; then
    echo -e "${GREEN}✓ Get surveys successful${NC}"
    TOTAL=$(echo "$SURVEYS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "Total surveys: $TOTAL"
else
    echo -e "${RED}✗ Get surveys failed${NC}"
    echo "Response: $SURVEYS_RESPONSE"
fi

echo ""

# Test 5: Get Survey Detail
if [ ! -z "$SURVEY_ID" ]; then
    echo -e "${BLUE}Test 5: Get Survey Detail${NC}"
    echo "GET $BASE_URL/surveys/$SURVEY_ID"

    SURVEY_DETAIL=$(curl -s -X GET "$BASE_URL/surveys/$SURVEY_ID" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$SURVEY_DETAIL" | grep -q "API 測試問卷"; then
        echo -e "${GREEN}✓ Get survey detail successful${NC}"
    else
        echo -e "${RED}✗ Get survey detail failed${NC}"
        echo "Response: $SURVEY_DETAIL"
    fi

    echo ""
fi

# Test 6: Update Survey
if [ ! -z "$SURVEY_ID" ]; then
    echo -e "${BLUE}Test 6: Update Survey${NC}"
    echo "PUT $BASE_URL/surveys/$SURVEY_ID"

    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/surveys/$SURVEY_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "title": "API 測試問卷 (已更新)",
        "description": "這是透過 API 更新的問卷"
      }')

    if echo "$UPDATE_RESPONSE" | grep -q "已更新"; then
        echo -e "${GREEN}✓ Update survey successful${NC}"
    else
        echo -e "${RED}✗ Update survey failed${NC}"
        echo "Response: $UPDATE_RESPONSE"
    fi

    echo ""
fi

# Summary
echo "================================"
echo -e "${GREEN}API tests completed!${NC}"
echo ""
echo "You can now:"
echo "  • View Swagger docs: http://localhost:3000/api/docs"
echo "  • Test with your own requests"
echo "  • Create questions for the survey"
echo ""
