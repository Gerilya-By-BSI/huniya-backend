#!/bin/bash
# Push Docker images to Docker Hub

# Set your Docker Hub username
USERNAME="rihlan24"

# Build specific services from docker-compose
echo "Building ml-api service..."
docker build --tag "ml-api" ./fastapi-ml

echo "Building api service..."
docker build --tag "api" .

# Tag images
echo "Tagging images..."
docker tag ml-api:latest $USERNAME/huniya-ml-api:latest
docker tag api:latest $USERNAME/huniya-api:latest

# Push images to Docker Hub
echo "Pushing images to Docker Hub..."
docker push $USERNAME/huniya-ml-api:latest
docker push $USERNAME/huniya-api:latest

echo "All images have been pushed to Docker Hub"