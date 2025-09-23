@echo off
echo 💀 DeathAIAUS Docker Startup 💀
echo ================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Build the image
echo 🔨 Building DeathAIAUS Docker image...
docker build -t deathaius:latest .

if %errorlevel% neq 0 (
    echo ❌ Docker build failed
    pause
    exit /b 1
)

echo ✅ Docker image built successfully
echo.

REM Create SSL directory
if not exist ssl mkdir ssl

REM Generate self-signed certificate
echo 🔒 Generating SSL certificate...
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -subj "/C=AU/ST=NSW/L=Sydney/O=DeathAIAUS/CN=localhost" 2>nul

REM Start services
echo 🚀 Starting DeathAIAUS services...
docker-compose up -d

echo.
echo ✅ DeathAIAUS is now running in Docker!
echo 🌐 Local: http://localhost:3000
echo 🔒 HTTPS: https://localhost (self-signed cert)
echo.
echo 📊 Monitor: docker-compose logs -f
echo 🛑 Stop: docker-compose down
echo.

pause
