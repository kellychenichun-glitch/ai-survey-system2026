#!/bin/bash

echo "🚀 AI Survey System - Quick Start Script"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your CLAUDE_API_KEY"
    echo ""
fi

# Start infrastructure
echo "🐳 Starting infrastructure (PostgreSQL, Redis, MinIO)..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are healthy
echo "🔍 Checking services health..."
docker-compose ps

echo ""
echo "📦 Installing dependencies..."
cd apps/api
npm install

echo ""
echo "🗄️  Running database migrations..."
npm run db:migrate

echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Setup completed!"
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  Quick Start Complete!                   ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  To start the API server:                                ║"
echo "║    cd apps/api                                           ║"
echo "║    npm run dev                                           ║"
echo "║                                                          ║"
echo "║  API will be available at:                               ║"
echo "║    http://localhost:3000                                 ║"
echo "║                                                          ║"
echo "║  Swagger docs:                                           ║"
echo "║    http://localhost:3000/api/docs                        ║"
echo "║                                                          ║"
echo "║  Default accounts:                                       ║"
echo "║    admin@example.com / Admin123!                         ║"
echo "║    manager@example.com / Manager123!                     ║"
echo "║    agent@example.com / Agent123!                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
