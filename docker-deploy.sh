#!/bin/bash

# DeathAIAUS Docker Deployment Script
echo "💀 DeathAIAUS Docker Deployment 💀"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build the Docker image
echo "🔨 Building DeathAIAUS Docker image..."
docker build -t deathaius:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Create SSL directory
echo "📁 Creating SSL directory..."
mkdir -p ssl

# Generate self-signed certificate for development
echo "🔒 Generating self-signed SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=AU/ST=NSW/L=Sydney/O=DeathAIAUS/CN=www.deathaiaus.com.au"

# Start the services
echo "🚀 Starting DeathAIAUS services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Show logs
echo "📝 Recent logs:"
docker-compose logs --tail=20

echo ""
echo "✅ DeathAIAUS is now running!"
echo "🌐 Local: http://localhost:3000"
echo "🔒 HTTPS: https://localhost (self-signed cert)"
echo ""
echo "📊 Monitor with: docker-compose logs -f"
echo "🛑 Stop with: docker-compose down"
echo "🔄 Restart with: docker-compose restart"
