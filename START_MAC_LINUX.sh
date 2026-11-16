#!/bin/sh
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Please install Node.js 20 or newer from https://nodejs.org/"
  exit 1
fi
if [ ! -d "node_modules/vite" ]; then
  echo "Installing project packages..."
  npm install
fi
npm run dev
