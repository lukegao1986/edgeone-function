#!/bin/bash

BASE_DIR="docs/0 数据准备/Charpter 1-30"

for ch in {21..29}; do
  if [ "$ch" -ge 21 ] && [ "$ch" -le 27 ]; then
    PREFIX="phy_4"
  elif [ "$ch" -ge 28 ] && [ "$ch" -le 29 ]; then
    PREFIX="phy_5"
  else
    PREFIX="phy_1"
  fi

  JSON_PATH="$BASE_DIR/charpter${ch}/${PREFIX}_chapter${ch}_questions.json"
  if [ -f "$JSON_PATH" ]; then
    echo "Uploading Chapter $ch ($PREFIX)..."
    node scripts/uploader/upload.js "$JSON_PATH"
  else
    echo "File not found: $JSON_PATH"
  fi
done
