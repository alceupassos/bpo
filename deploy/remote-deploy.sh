#!/usr/bin/env bash
# Deploy do bpo-angra na VPS (rodar COMO ROOT na própria VPS).
# Idempotente: pode rodar de novo para atualizar.
set -euo pipefail

DOMAIN="bpo.angra.io"
APP_DIR="/opt/bpo"
REPO="https://github.com/alceupassos/bpo.git"

echo "==> 1/7 dependencias globais"
command -v pnpm >/dev/null || npm i -g pnpm
command -v pm2  >/dev/null || npm i -g pm2

echo "==> 2/7 codigo em $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull
else
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> 3/7 .env da API (cria se nao existir)"
if [ ! -f apps/api/.env ]; then
  cat > apps/api/.env <<EOF
PORT=3002
NODE_ENV=production
JWT_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '/+=' )
STORAGE_PROVIDER=local
STORAGE_BUCKET=angra-bpo-local
HF_API_KEY=
HF_MODEL_OCR=
HF_MODEL_CLASSIFICATION=
EOF
  echo "   apps/api/.env criado (JWT_SECRET gerado)."
fi

echo "==> 4/7 install + build"
CI=true pnpm install
export NEXT_PUBLIC_API_URL="https://$DOMAIN/api"
export NEXT_PUBLIC_APP_URL="https://$DOMAIN"
pnpm build
pnpm build:api

echo "==> 5/7 PM2"
pm2 start ecosystem.config.js || pm2 restart bpo-api bpo-web
pm2 save

echo "==> 6/7 nginx"
cp deploy/nginx-bpo.conf /etc/nginx/sites-available/bpo
ln -sf /etc/nginx/sites-available/bpo /etc/nginx/sites-enabled/bpo
nginx -t && systemctl reload nginx

echo "==> 7/7 SSL"
echo "   DNS bpo.angra.io esta atras do Cloudflare (proxy)."
echo "   Opcao A (recomendada): no Cloudflare, SSL/TLS = Full e mantenha o proxy ligado."
echo "   Opcao B (Let's Encrypt no origin): no Cloudflare deixe o registro como 'DNS only',"
echo "           rode:  certbot --nginx -d $DOMAIN  ; depois religue o proxy."

echo "==> OK. Teste: https://$DOMAIN  (login operador@angra.local / angra123)"
