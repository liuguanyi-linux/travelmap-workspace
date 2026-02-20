#!/bin/bash
echo "--- Checking Frontend Directory ---"
if [ -d "/www/travelmap/frontend/dist" ]; then
    echo "Frontend dist exists."
    ls -F /www/travelmap/frontend/dist/ | head -n 10
else
    echo "ERROR: /www/travelmap/frontend/dist does NOT exist!"
    ls -F /www/travelmap/frontend/
fi

echo "--- Checking PM2 Status ---"
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
pm2 status

echo "--- Checking Backend Port ---"
# Check if port 3000 is listening
netstat -tuln | grep 3000 || echo "Port 3000 not listening"

echo "--- Curling Backend ---"
curl -I http://localhost:3000/ || echo "Curl to localhost:3000 failed"

echo "--- Nginx Config Check ---"
cat /etc/nginx/sites-enabled/00-travelmap

echo "--- Nginx Error Log ---"
sudo tail -n 20 /var/log/nginx/error.log
