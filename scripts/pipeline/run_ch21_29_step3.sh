#!/bin/bash
for ch in {21..29}; do
  echo "Generating JSON for chapter $ch..."
  node scripts/pipeline/3_generate_json.js "$ch"
done
