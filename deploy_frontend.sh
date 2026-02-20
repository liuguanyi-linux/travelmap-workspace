#!/bin/bash
set -e

echo "Deploying Frontend Only..."

# Ensure directory exists
sudo mkdir -p /www/travelmap/frontend

# Clear old frontend files
echo "Clearing old frontend files..."
sudo rm -rf /www/travelmap/frontend/*

# Extract new frontend files
echo "Extracting new frontend files..."
sudo tar -xzf /tmp/travelmap-frontend.tar.gz -C /www/travelmap/frontend

echo "Frontend Deployment Complete!"
