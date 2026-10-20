#!/bin/bash

BASE_DIR="docs/0 数据准备/Charpter 1-30"

for ch in {14..20}; do
  JSON_PATH="$BASE_DIR/charpter${ch}/phy_3_chapter${ch}_questions.json"
  if [ -f "$JSON_PATH" ]; then
    echo "Uploading Chapter $ch..."
    node scripts/uploader/upload.js "$JSON_PATH"
  else
    echo "File not found: $JSON_PATH"
  fi
done
