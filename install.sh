#!/bin/bash
#rrykarlsefni

INFO='\033[1;34m'
SUCCESS='\033[1;32m'
ERROR='\033[1;31m'
RESET='\033[0m'

clear
echo -e "${INFO}Memulai setup lingkungan untuk Termux...${RESET}"

if ! command -v pkg >/dev/null 2>&1; then
  echo -e "${ERROR}Error: Hanya bisa dijalankan di Termux.${RESET}"
  exit 1
fi

echo -e "${INFO}Menginstal dependensi...${RESET}"
pkg install -y nodejs-lts git ffmpeg

echo -e "${INFO}Menginstal package...${RESET}"
npm install

echo -e "${SUCCESS}Setup selesai. Jalankan dengan: npm start${RESET}"
