#!/bin/bash
echo "--- Curl Public IP ---"
curl -I -H "Host: anjen.net" http://110.42.143.48/

echo "--- Check Other Site Config ---"
if [ -f /etc/nginx/sites-enabled/huaxierp.cn ]; then
    cat /etc/nginx/sites-enabled/huaxierp.cn
fi
