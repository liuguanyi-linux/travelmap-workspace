#!/bin/bash

SERVER_IP="110.42.143.48"
USER="ubuntu"
# IMPORTANT: Change this to the actual path of your SSH key on your Mac
# Usually it's ~/.ssh/id_rsa or ~/.ssh/id_ed25519
KEY_PATH="$HOME/.ssh/id_rsa"

# Stop script on any error
set -e

echo "Building Frontend..."
cd frontend
# Run Vite Build
npm run build
# Copy index.html to 200.html for SPA fallback if it exists
if [ -f "dist/index.html" ]; then
    cp dist/index.html dist/200.html
fi
cd ..

echo "Building Backend..."
cd backend
# Run NestJS Build
npm run build
cd ..

echo "Packing Backend..."
# Pack backend directory content excluding unnecessary files
tar -czf travelmap-backend.tar.gz --exclude="node_modules" --exclude=".git" --exclude="prisma/dev.db" --exclude="uploads" -C backend .

echo "Packing Frontend..."
# Pack frontend directory content excluding unnecessary files
tar -czf travelmap-frontend.tar.gz --exclude="node_modules" --exclude=".git" -C frontend .

echo "Uploading files..."
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no travelmap-backend.tar.gz travelmap-frontend.tar.gz deploy.sh "${USER}@${SERVER_IP}:/tmp/"

echo "Executing deployment..."
# Execute the deployment script on the server
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "${USER}@${SERVER_IP}" "sed -i 's/\r$//' /tmp/deploy.sh && chmod +x /tmp/deploy.sh && /tmp/deploy.sh"

echo "Deployment complete!"
