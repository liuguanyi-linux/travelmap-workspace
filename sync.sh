#!/bin/bash
cd /www/travelmap
git add -A
MSG="${1:-auto sync: $(date '+%Y-%m-%d %H:%M:%S')}"
if git diff --cached --quiet; then
  echo "没有变更，无需同步"
else
  git commit -m "$MSG"
  git push origin main
  echo "已同步到 GitHub"
fi
