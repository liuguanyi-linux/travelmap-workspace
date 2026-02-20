#!/bin/bash
echo "--- Checking All Enabled Sites ---"
ls -la /etc/nginx/sites-enabled/

echo "--- Content of Default Site (if exists) ---"
if [ -f /etc/nginx/sites-enabled/default ]; then
    cat /etc/nginx/sites-enabled/default
fi

echo "--- Checking Port 80 Process ---"
sudo netstat -tulnp | grep :80

echo "--- Curl Localhost with Host Header ---"
curl -I -H "Host: anjen.net" http://127.0.0.1/
curl -I -H "Host: www.anjen.net" http://127.0.0.1/

echo "--- Curl Localhost Default ---"
curl -I http://127.0.0.1/

echo "--- Nginx Error Log (Last 50) ---"
sudo tail -n 50 /var/log/nginx/error.log
