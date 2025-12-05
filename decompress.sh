#!/bin/bash

if [ "$#" -lt 1 ]; then
  echo "Usage: ./decompress.sh <file1> [file2 file3 ...]"
  exit 1
fi

API="https://omnicomp.onrender.com/api/decompress"

for FILE in "$@"; do
  if [ ! -f "$FILE" ]; then
    echo "File not found: $FILE"
    continue
  fi

  echo "Decompressing $FILE ..."
  response=$(curl -s -F "file=@$FILE" "$API")

  url=$(echo "$response" | grep -oP '(?<="decompressedFileUrl":")[^"]+')
  output=$(echo "$response" | grep -oP '(?<="restoredFileName":")[^"]+' | tr -d '\r\n')

  if [ -n "$url" ]; then
    echo " Downloading decompressed file..."
    curl -s -L "$url" -o "${output}"
    echo "Saved: ${output}"
  else
    echo "Decompression failed for $FILE."
    echo "Response: $response"
  fi
done