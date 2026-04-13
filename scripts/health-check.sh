#!/bin/bash

echo "🔍 AI Survey System - Health Check"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo -n "Checking Docker... "
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Docker is not running${NC}"
    exit 1
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
if docker-compose ps | grep -q "postgres.*Up"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo "Run: docker-compose up -d"
    exit 1
fi

# Check Redis
echo -n "Checking Redis... "
if docker-compose ps | grep -q "redis.*Up"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Redis is not running${NC}"
    exit 1
fi

# Check MinIO
echo -n "Checking MinIO... "
if docker-compose ps | grep -q "minio.*Up"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ MinIO is not running (optional)${NC}"
fi

# Check if .env exists
echo -n "Checking .env file... "
if [ -f "apps/api/.env" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "  Please create apps/api/.env from .env.example"
fi

# Check if node_modules exists
echo -n "Checking dependencies... "
if [ -d "apps/api/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Dependencies not installed${NC}"
    echo "  Run: cd apps/api && npm install"
fi

# Test API connection
echo -n "Testing API connection... "
if curl -s http://localhost:3000/api/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API is running${NC}"
else
    echo -e "${YELLOW}⚠ API is not running${NC}"
    echo "  Start API with: cd apps/api && npm run dev"
fi

echo ""
echo "===================================="
echo ""

# Check database connection
echo "Testing database connection..."
if docker exec -i ai-survey-postgres psql -U postgres -d ai_survey_system -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection OK${NC}"
    
    # Check if tables exist
    TABLE_COUNT=$(docker exec -i ai-survey-postgres psql -U postgres -d ai_survey_system -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | tr -d ' ')
    
    if [ "$TABLE_COUNT" -gt "0" ]; then
        echo -e "${GREEN}✓ Database has $TABLE_COUNT tables${NC}"
    else
        echo -e "${YELLOW}⚠ No tables found - run migrations${NC}"
        echo "  Run: cd apps/api && npm run db:migrate"
    fi
else
    echo -e "${RED}✗ Cannot connect to database${NC}"
fi

echo ""
echo "===================================="
echo -e "${GREEN}Health check complete!${NC}"
echo ""
echo "Quick links:"
echo "  • API Docs:    http://localhost:3000/api/docs"
echo "  • pgAdmin:     http://localhost:5050"
echo "  • MinIO:       http://localhost:9001"
echo ""
