#!/bin/bash
for ch in {21..29}; do
  echo "Processing chapter $ch..."
  node scripts/pipeline/1_clean.js "$ch"
  node scripts/pipeline/2_split.js "$ch"
done
