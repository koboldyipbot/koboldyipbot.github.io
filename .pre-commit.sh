#!/bin/sh

secret_file=js/secrets.js

git diff --cached --name-only --diff-filter=ACM | grep "$secret_file" > /dev/null 2>/dev/null

if [[ $? -eq 0 ]]; then
  echo "Don't commit to $secret_file !"
  exit 1
fi
