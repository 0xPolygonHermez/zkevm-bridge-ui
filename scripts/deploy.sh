#!/bin/sh

# _ROOT: 工作目录
# ROOT: 总是正确指向build脚本所在目录
_ROOT="$(pwd)" && cd "$(dirname "$0")" && ROOT="$(pwd)"
ENV_FILENAME="$ROOT/../.env"

# Build app
cd $ROOT/.. && npm run build

# Copy nginx config
sudo cp $ROOT/../deployment/nginx.conf /usr/local/nginx/conf

# Copy app dist
sudo cp -r $ROOT/../dist/. /usr/local/nginx/html

# Delete source code
#rm -rf /app

# Run nginx
sudo nginx -s stop
sleep 5
sudo nginx