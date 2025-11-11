#!/bin/bash

echo "Building notification service..."

# Navigate to backend directory
cd backend

# Build the notification service with Maven
echo "Running Maven build..."
mvn clean package -pl notification-service -am -DskipTests

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Maven build failed"
    exit 1
fi

# Navigate back to root
cd ..

# Build and deploy with docker-compose
echo "Building Docker image..."
docker-compose build notification-service

echo "Starting notification service..."
docker-compose up -d notification-service

echo "Checking service status..."
sleep 10
docker-compose ps notification-service

echo "Checking logs..."
docker-compose logs --tail 50 notification-service

echo "Deployment complete!"