#!/bin/bash

if [ "$#" -lt 1 ]; then
  echo "Usage: ./compress.sh <file1> [file2 file3 ...]"
  exit 1
fi

API="https://omnicomp.onrender.com/api/compress"

for FILE in "$@"; do
  if [ ! -f "$FILE" ]; then
    echo "File not found: $FILE"
    continue
  fi

  echo "Compressing $FILE ..."
  response=$(curl -s -F "file=@$FILE" "$API")

  url=$(echo "$response" | grep -oP '(?<="compressedFileUrl":")[^"]+')
  output=$(echo "$response" | grep -oP '(?<="outputFileName":")[^"]+' | tr -d '\r\n')

  if [ -n "$url" ]; then
    echo "Downloading compressed file..."
    curl -s -L "$url" -o "${output}"
    echo "Saved: ${output}"
  else
    echo "Compression failed for $FILE."
    echo "Response: $response"
  fi
done