#!/bin/bash
set -e

echo "Setting up directories..."
sudo mkdir -p /www/travelmap/backend /www/travelmap/frontend
sudo chown -R ubuntu:ubuntu /www/travelmap

# 🚨 AGGRESSIVE CLEANUP: FIND AND DESTROY/RENAME OLD INDEX FILES
echo "========================================="
echo "SEARCHING FOR OLD INDEX.HTML FILES IN /www..."
FOUND_FILES=$(sudo find /www -name "index.html" -type f)
echo "$FOUND_FILES"
echo "========================================="

# Loop through found files and rename if not in target path (though target path will be wiped anyway)
for file in $FOUND_FILES; do
    if [[ "$file" != "/www/travelmap/frontend/dist/index.html" ]]; then
        echo "RENAMING CONFLICTING FILE: $file to $file.bak_old"
        sudo mv "$file" "$file.bak_old"
    fi
done

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
# Ensure sharp is rebuilt for the current architecture
npm rebuild sharp
npx prisma generate
npx prisma db push --accept-data-loss
# Build skipped (artifacts uploaded)
pm2 delete travelmap-backend || true
pm2 start dist/src/main.js --name travelmap-backend

echo "Configuring Nginx..."
# Remove any conflicting default or ghost configs first
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/*.conf

# 🚨 LAST CHANCE RESCUE: SEARCH FOR BACKUP FOLDERS 🚨
echo "========================================="
echo "SEARCHING FOR ANY 'bak' OR 'old' FOLDERS IN /www AND /tmp..."
sudo find /www /tmp -maxdepth 3 -type d \( -name "*bak*" -o -name "*old*" -o -name "*uploads*" \)
echo "========================================="

# 🚨 DEBUG: FIND IMAGE FILE 🚨
echo "========================================="
echo "SEARCHING FOR IMAGE f6932aa78b0eb813d8b4058d105762e3c.png..."
FOUND_IMG=$(sudo find /www -name "f6932aa78b0eb813d8b4058d105762e3c.png")
if [ -z "$FOUND_IMG" ]; then
    echo "❌ IMAGE NOT FOUND IN /www!"
    # Search entire system (limit to reasonable paths)
    echo "Searching /tmp and /home..."
    sudo find /tmp /home -name "f6932aa78b0eb813d8b4058d105762e3c.png"
else
    echo "✅ FOUND IMAGE AT: $FOUND_IMG"
    echo "Checking permissions for parent directories..."
    namei -l "$FOUND_IMG"
fi
echo "========================================="

# 🚨 VERIFY UPLOADS INTEGRITY 🚨
echo "========================================="
echo "VERIFYING UPLOADS DIRECTORY..."
if [ -d "/www/travelmap/backend/uploads" ]; then
    echo "Directory exists. Listing content (Recursive):"
    ls -R /www/travelmap/backend/uploads
    
    # Check for nested uploads
    if [ -d "/www/travelmap/backend/uploads/uploads" ]; then
        echo "⚠️ DETECTED NESTED UPLOADS! FIXING..."
        mv /www/travelmap/backend/uploads/uploads/* /www/travelmap/backend/uploads/
        rmdir /www/travelmap/backend/uploads/uploads
        echo "Fixed nested uploads."
    fi
    
    echo "Fixing Permissions (ubuntu:www-data + 755)..."
    sudo chown -R ubuntu:www-data /www/travelmap/backend/uploads
    sudo chmod -R 755 /www/travelmap/backend/uploads
else
    echo "❌ ERROR: Uploads directory MISSING!"
    # Emergency Rescue from /tmp if available
    if [ -d "/tmp/backend.uploads.bak" ]; then
         echo "⚠️ ATTEMPTING RESCUE FROM /tmp..."
         cp -rp /tmp/backend.uploads.bak /www/travelmap/backend/uploads
         sudo chown -R ubuntu:www-data /www/travelmap/backend/uploads
         sudo chmod -R 755 /www/travelmap/backend/uploads
         echo "Rescue complete."
    fi
fi
echo "========================================="

echo "Checking for conflicting symlinks in dist..."
if [ -L "/www/travelmap/frontend/dist/uploads" ] || [ -d "/www/travelmap/frontend/dist/uploads" ]; then
    echo "Removing conflicting uploads symlink/dir in dist..."
    rm -rf /www/travelmap/frontend/dist/uploads
fi

sudo tee /etc/nginx/sites-available/travelmap > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name anjen.net www.anjen.net;
    
    # Increase body size for all uploads
    client_max_body_size 50M;

    root /www/travelmap/frontend/dist;
    index index.html;

    # 🚨 PRIORITY UPLOADS HANDLING (Must be before 'location /') 🚨
    location /uploads/ {
        alias /www/travelmap/backend/uploads/;
        add_header Access-Control-Allow-Origin *;
        expires 30d;
        autoindex on; # Debugging enabled
    }

    # Cache Control for Static Assets

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # CRITICAL: Force /admin to use the main SPA index.html
    # This prevents any separate admin build or directory from being served
    location ^~ /admin {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA Fallback - No Cache for HTML/Routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Explicit Index No Cache
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
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

    # Old location /uploads/ removed as it was after root location
}

server {
    listen 443 ssl http2 default_server;
    server_name anjen.net www.anjen.net;

    ssl_certificate /etc/nginx/ssl/www.anjen.net_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/www.anjen.net.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Fix PROTOCOL_ERROR
    http2_max_field_size 16k;
    http2_max_header_size 32k;

    client_max_body_size 50M;
    root /www/travelmap/frontend/dist;
    index index.html;

    # 🚨 PRIORITY UPLOADS HANDLING (Must be before 'location /') 🚨
    location /uploads/ {
        alias /www/travelmap/backend/uploads/;

        add_header Access-Control-Allow-Origin *;
        expires 30d;
        autoindex on; # Debugging enabled
    }

    # Cache Control for Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # CRITICAL: Force /admin to use the main SPA index.html
    location ^~ /admin {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA Fallback - No Cache for HTML/Routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Explicit Index No Cache
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
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

    # Old location /uploads/ removed
}
EOF


sudo ln -sf /etc/nginx/sites-available/travelmap /etc/nginx/sites-enabled/00-travelmap
# Restart Nginx to force clear cache
echo "Restarting Nginx..."
sudo systemctl restart nginx

# 🚨 SCORCHED EARTH VERIFICATION 🚨
echo "========================================="
echo "GLOBAL NGINX AUDIT (Looking for 'admin' configs)..."
sudo grep -r "admin" /etc/nginx/ || echo "No 'admin' configs found outside main config."
echo "========================================="

echo "========================================="
echo "BACKEND COLD RESTART (PM2)..."
pm2 delete all || true
pm2 start dist/src/main.js --name travelmap-backend
pm2 save
echo "========================================="

echo "========================================="
echo "VERIFYING V2.0 ARTIFACT (First 20 lines of index.html)..."
if [ -f "/www/travelmap/frontend/dist/index.html" ]; then
    cat /www/travelmap/frontend/dist/index.html | head -n 20
else
    echo "ERROR: index.html NOT FOUND!"
fi
echo "========================================="

echo "Deployment Complete!"
