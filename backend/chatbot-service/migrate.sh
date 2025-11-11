#!/bin/bash

# Migration script to switch to microservices implementation

echo "Migrating chatbot to microservices architecture..."

# Backup old files
echo "Creating backup of old files..."
mkdir -p backup
cp main.py backup/main.py.bak 2>/dev/null
cp route.py backup/route.py.bak 2>/dev/null
cp service.py backup/service.py.bak 2>/dev/null

# Create symlinks or copy new files
echo "Setting up new implementation..."
if [ -f "main_microservices.py" ]; then
    echo "✓ New main file found"
    # Option 1: Rename files (permanent switch)
    # mv main.py main_old.py 2>/dev/null
    # mv main_microservices.py main.py
    
    # Option 2: Keep both versions, update Docker/startup scripts
    echo "Update your Dockerfile and startup scripts to use:"
    echo "  - main_microservices.py instead of main.py"
    echo "  - route_microservices.py instead of route.py"
    echo "  - service_microservices.py instead of service.py"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration:"
    echo "  - Add your OPENAI_API_KEY"
    echo "  - Update service URLs if needed"
fi

# Update dependencies
echo "Installing new dependencies..."
pip install httpx pydantic

echo ""
echo "Migration preparation complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the required configuration"
echo "2. Update Docker commands to use main_microservices:app"
echo "3. Restart the service"
echo ""
echo "To run locally:"
echo "  uvicorn main_microservices:app --host 0.0.0.0 --port 8086 --reload"
echo ""
echo "To run with Docker:"
echo "  docker-compose up chatbot-service"