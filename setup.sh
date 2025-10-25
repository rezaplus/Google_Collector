#!/bin/bash

# Google Collector - Easy Setup Script
# This script helps you set up and deploy the Google Collector application

set -e

echo "================================================"
echo "   Google Collector - Easy Setup Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ backend/.env created${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend/.env from example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ frontend/.env created${NC}"
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi

echo ""
echo "================================================"
echo "   Configuration Options"
echo "================================================"
echo ""

read -p "Do you want to customize settings? (y/N): " customize

if [[ $customize =~ ^[Yy]$ ]]; then
    echo ""
    echo "Enter new values or press Enter to keep defaults:"
    echo ""
    
    # Get current username
    current_username=$(grep REACT_APP_USERNAME docker-compose.yml | cut -d'=' -f2 || echo "admin")
    read -p "Username [$current_username]: " new_username
    new_username=${new_username:-$current_username}
    
    # Get current password
    current_password=$(grep REACT_APP_PASSWORD docker-compose.yml | cut -d'=' -f2 || echo "Hello123!")
    read -sp "Password [$current_password]: " new_password
    echo ""
    new_password=${new_password:-$current_password}
    
    # Generate a random token
    read -p "Generate new Bearer token? (y/N): " gen_token
    if [[ $gen_token =~ ^[Yy]$ ]]; then
        new_token="Bearer $(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)"
        echo -e "${GREEN}✓ New token generated${NC}"
    else
        current_token=$(grep REACT_APP_BEARER_TOKEN docker-compose.yml | cut -d'=' -f2 || echo "Bearer AIzaSyD8Z0jJ9Q9Q6Z2MaSKLNSD2jkmsasdnk")
        new_token=$current_token
    fi
    
    # Update docker-compose.yml
    echo ""
    echo -e "${YELLOW}Updating configuration...${NC}"
    
    # Update backend .env
    sed -i.bak "s|BEARER_TOKEN.*|BEARER_TOKEN = \"$new_token\"|g" backend/.env
    
    # Update docker-compose.yml
    sed -i.bak "s|REACT_APP_USERNAME=.*|REACT_APP_USERNAME=$new_username|g" docker-compose.yml
    sed -i.bak "s|REACT_APP_PASSWORD=.*|REACT_APP_PASSWORD=$new_password|g" docker-compose.yml
    sed -i.bak "s|REACT_APP_BEARER_TOKEN=.*|REACT_APP_BEARER_TOKEN=$new_token|g" docker-compose.yml
    
    # Clean up backup files
    rm -f backend/.env.bak docker-compose.yml.bak
    
    echo -e "${GREEN}✓ Configuration updated${NC}"
fi

echo ""
echo "================================================"
echo "   Starting Services"
echo "================================================"
echo ""

# Stop any existing containers
echo "Stopping existing containers (if any)..."
docker-compose down 2>/dev/null || true

# Build and start containers
echo "Building and starting containers..."
docker-compose up -d --build

echo ""
echo "================================================"
echo "   Deployment Complete!"
echo "================================================"
echo ""
echo -e "${GREEN}✓ All services are running${NC}"
echo ""
echo "Access the application at:"
echo ""
echo "  Frontend: http://localhost:3002"
echo "  Backend API: http://localhost:3001"
echo ""
echo "Or from another machine:"
echo ""
echo "  Frontend: http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'YOUR_SERVER_IP'):3002"
echo "  Backend API: http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'YOUR_SERVER_IP'):3001"
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: Hello123!"
echo ""
echo "View logs with: docker-compose logs -f"
echo "Stop services with: docker-compose down"
echo ""
echo "⚠️  Remember to change the default credentials in production!"
echo ""
