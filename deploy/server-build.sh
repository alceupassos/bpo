#!/usr/bin/env bash
# Build + run do bpo-angra na VPS. Pressupoe que o codigo JA foi enviado via scp
# para /opt/bpo. SSL e feito pelo Cloudflare (Full), entao o origin serve HTTP.
# Rodar como root:  bash /opt/bpo/deploy/server-build.sh
set -euo pipefail

DOMAIN="bpo.angra.io"
APP_DIR="/opt/bpo"
cd "$APP_DIR"

echo "==> 1/6 dependencias globais"
command -v node >/dev/null || { echo "Node ausente"; exit 1; }
command -v pnpm >/dev/null || npm i -g pnpm
command -v pm2  >/dev/null || npm i -g pm2

echo "==> 2/6 .env da API (cria se nao existir)"
if [ ! -f apps/api/.env ]; then
  cat > apps/api/.env <<EOF
PORT=3002
NODE_ENV=production
JWT_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '/+=')
STORAGE_PROVIDER=local
STORAGE_BUCKET=angra-bpo-local
HF_API_KEY=
HF_MODEL_OCR=
HF_MODEL_CLASSIFICATION=
EOF
  echo "   apps/api/.env criado (JWT_SECRET aleatorio)."
fi

echo "==> 3/6 install + build"
CI=true pnpm install
export NEXT_PUBLIC_API_URL="https://$DOMAIN/api"
export NEXT_PUBLIC_APP_URL="https://$DOMAIN"
pnpm build
pnpm build:api

echo "==> 4/6 PM2"
pm2 start ecosystem.config.js 2>/dev/null || pm2 restart bpo-api bpo-web
pm2 save

echo "==> 5/6 nginx (origin HTTP; Cloudflare faz o HTTPS)"
cp deploy/nginx-bpo.conf /etc/nginx/sites-available/bpo
ln -sf /etc/nginx/sites-available/bpo /etc/nginx/sites-enabled/bpo
rm -f /etc/nginx/sites-enabled/default || true
nginx -t && systemctl reload nginx

echo "==> 6/6 OK"
pm2 status
echo "Cloudflare: SSL/TLS = Full, proxy (nuvem laranja) ligado em $DOMAIN."
echo "Teste: https://$DOMAIN  (login operador@angra.local / angra123)"
