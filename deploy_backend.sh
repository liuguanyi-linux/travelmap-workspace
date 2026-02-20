#!/bin/bash
set -e

echo "Deploying Backend Only..."

TARGET_DIR="/www/travelmap/backend"

# Backup .env and database
if [ -f "$TARGET_DIR/.env" ]; then
    cp "$TARGET_DIR/.env" /tmp/backend.env.bak
    echo ".env backed up."
fi
if [ -f "$TARGET_DIR/prisma/dev.db" ]; then
    cp "$TARGET_DIR/prisma/dev.db" /tmp/backend.db.bak
    echo "Database backed up."
fi

# Clear directory
echo "Clearing old backend files..."
sudo rm -rf "$TARGET_DIR"/*

# Extract
echo "Extracting new backend files..."
sudo tar -xzf /tmp/travelmap-backend.tar.gz -C "$TARGET_DIR"

# Restore .env and database
if [ -f /tmp/backend.env.bak ]; then
    sudo mv /tmp/backend.env.bak "$TARGET_DIR/.env"
    echo ".env restored."
fi
if [ -f /tmp/backend.db.bak ]; then
    sudo mkdir -p "$TARGET_DIR/prisma"
    sudo mv /tmp/backend.db.bak "$TARGET_DIR/prisma/dev.db"
    echo "Database restored."
fi

# Fix ownership
sudo chown -R ubuntu:ubuntu "$TARGET_DIR"

# Build
echo "Building Backend..."
cd "$TARGET_DIR"
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Restart
echo "Restarting PM2..."
pm2 restart travelmap-backend || pm2 start dist/main.js --name travelmap-backend

echo "Backend Deployment Complete!"
