#!/bin/bash
set -e

echo "Setting up directories..."
sudo mkdir -p /www/travelmap/backend /www/travelmap/frontend
sudo chown -R ubuntu:ubuntu /www/travelmap

echo "Extracting files..."
# Backup Backend DB and Env
if [ -f "/www/travelmap/backend/.env" ]; then
    cp "/www/travelmap/backend/.env" /tmp/backend.env.bak
fi
if [ -f "/www/travelmap/backend/prisma/dev.db" ]; then
    cp "/www/travelmap/backend/prisma/dev.db" /tmp/backend.db.bak
fi
if [ -d "/www/travelmap/backend/uploads" ]; then
    # Use -p to preserve permissions/timestamps
    cp -rp "/www/travelmap/backend/uploads" /tmp/backend.uploads.bak
fi

# Clear old files first to ensure clean state
rm -rf /www/travelmap/backend/* /www/travelmap/frontend/*

tar -xzf /tmp/travelmap-backend.tar.gz -C /www/travelmap/backend
tar -xzf /tmp/travelmap-frontend.tar.gz -C /www/travelmap/frontend

# Restore Backend DB and Env
if [ -f /tmp/backend.env.bak ]; then
    mv /tmp/backend.env.bak "/www/travelmap/backend/.env"
fi
if [ -f /tmp/backend.db.bak ]; then
    mkdir -p "/www/travelmap/backend/prisma"
    mv /tmp/backend.db.bak "/www/travelmap/backend/prisma/dev.db"
fi

# Restore uploads
# First remove any uploads folder that might have been created by extraction or mkdir
rm -rf "/www/travelmap/backend/uploads"

if [ -d /tmp/backend.uploads.bak ]; then
    mv /tmp/backend.uploads.bak "/www/travelmap/backend/uploads"
else
    mkdir -p "/www/travelmap/backend/uploads"
fi

# Fix nested uploads from previous broken deployments
if [ -d "/www/travelmap/backend/uploads/backend.uploads.bak" ]; then
    echo "Fixing nested uploads..."
    cp -rp /www/travelmap/backend/uploads/backend.uploads.bak/* /www/travelmap/backend/uploads/
    rm -rf /www/travelmap/backend/uploads/backend.uploads.bak
fi

echo "Setting up Frontend..."
# Build skipped (artifacts uploaded)
sudo chown -R ubuntu:ubuntu /www/travelmap/frontend

echo "Setting up Backend..."
cd /www/travelmap/backend
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npx ts-node prisma/seed.ts
# Build skipped (artifacts uploaded)
pm2 delete travelmap-backend || true
pm2 start dist/src/main.js --name travelmap-backend

echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/travelmap > /dev/null << 'EOF'
server {
    listen 80;
    server_name anjen.net www.anjen.net;
    
    # Increase body size for all uploads
    client_max_body_size 50M;

    root /www/travelmap/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve uploads directly via Nginx for better performance
    location /uploads/ {
        alias /www/travelmap/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/travelmap /etc/nginx/sites-enabled/00-travelmap
sudo nginx -t && sudo systemctl reload nginx

echo "Deployment Complete!"
