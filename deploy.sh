#!/bin/bash

# ==========================================
# 自动化部署脚本 (本地 -> 腾讯云) - 方案A
# ==========================================

# 开启错误检测，任意命令报错即停止执行（除了带有 || true 的容错命令）
set -e

# 服务器配置
SERVER_IP="110.42.143.48"
SERVER_USER="ubuntu"
SERVER_DIR="/www/travelmap"
PASSWORD="Huaxi123456～"

echo "=========================================="
echo "🚀 开始执行一键自动化部署流程"
echo "=========================================="

# ------------------------------------------
# 1. 提交本地所有修改到 GitHub
# （为了确保服务器 git pull 时能拿到最新的后端代码）
# ------------------------------------------
echo "📦 [1/4] 正在提交本地所有更改到 GitHub..."
git add -A
# 容错：如果没有任何变更，commit 会失败，所以加上 || true 忽略报错
git commit -m "Auto deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
git push origin main || true
echo "✅ 本地代码已同步到 GitHub！"
echo ""

# ------------------------------------------
# 2. 前端构建与准备
# ------------------------------------------
echo "📦 [2/4] 正在构建前端代码 (跳过 tsc)..."
cd frontend
# 按照你的需求，跳过 tsc 直接构建
npx vite build

echo "📄 复制 index.html 到 200.html..."
cp dist/index.html dist/200.html
echo "✅ 前端构建完成！"
echo ""

# ------------------------------------------
# 3. 前端产物上传
# ------------------------------------------
echo "📤 [3/4] 正在使用 scp 上传前端产物到服务器..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -r dist/* $SERVER_USER@$SERVER_IP:$SERVER_DIR/frontend/
echo "✅ 前端上传成功！"
echo ""

cd ..

# ------------------------------------------
# 4. 后端拉取更新与重启
# ------------------------------------------
echo "🔄 [4/4] 正在连接服务器更新后端服务..."
# 在服务器上执行一连串的命令（通过 Here Document 方式）
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
  set -e
  echo "⬇️ 进入项目目录并拉取最新代码..."
  cd $SERVER_DIR
  git pull origin main

  echo "🔨 进入 backend 目录，安装依赖并构建后端..."
  cd backend
  npm install
  npm run build

  echo "♻️ 重启 PM2 服务 (如果不存在则尝试启动)..."
  # 重启你的 pm2 服务
  pm2 restart travelmap-backend || pm2 start dist/main.js --name travelmap-backend
  
  echo "✅ 服务器端后端更新操作完成！"
EOF

echo ""
echo "=========================================="
echo "🎉 部署全部成功完成！"
echo "=========================================="
