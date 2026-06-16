# Deploy — bpo-angra na VPS

Runbook de produção. VPS: **62.171.181.241** (atenção: o `.env` traz `.24`, o IP correto é `.241`).
Acesso: `ssh root@62.171.181.241` (senha em `.env` → `SSH_PWD`). Repositório: https://github.com/alceupassos/bpo

Stack em produção: **nginx** (reverse proxy) → **PM2** (bpo-api :3002 + bpo-web :3001), **Cloudflare** (DNS), **Let's Encrypt** (SSL).

## Pré-requisitos (uma vez)
- Node 20+, pnpm e PM2 no servidor: `npm i -g pnpm pm2`
- nginx e certbot: `apt install -y nginx certbot python3-certbot-nginx`
- Um domínio/subdomínio apontando para a VPS (passo DNS abaixo).

## 1. Código no servidor
```bash
ssh root@62.171.181.241
git clone https://github.com/alceupassos/bpo.git /opt/bpo   # ou git pull se já existir
cd /opt/bpo
CI=true pnpm install
```

## 2. Variáveis de ambiente
Criar `/opt/bpo/apps/api/.env`:
```
PORT=3002
NODE_ENV=production
JWT_SECRET=<gerar-um-segredo-forte>
STORAGE_PROVIDER=local
STORAGE_BUCKET=angra-bpo-local
HF_API_KEY=
HF_MODEL_OCR=
HF_MODEL_CLASSIFICATION=
```
> OCR fica em modo manual enquanto `HF_API_KEY` estiver vazio (fallback obrigatório).

## 3. Build
O `NEXT_PUBLIC_API_URL` é embutido no build do front — defina antes do `pnpm build`:
```bash
export NEXT_PUBLIC_API_URL=https://bpo.angra.io/api
export NEXT_PUBLIC_APP_URL=https://bpo.angra.io
pnpm build         # frontend (.next)
pnpm build:api     # backend (apps/api/dist)
```

## 4. PM2
```bash
cd /opt/bpo
pm2 start ecosystem.config.js
pm2 save
pm2 startup     # seguir a instrução impressa p/ subir no boot
```

## 5. nginx
```bash
cp deploy/nginx-bpo.conf /etc/nginx/sites-available/bpo   # já vem com server_name bpo.angra.io
ln -sf /etc/nginx/sites-available/bpo /etc/nginx/sites-enabled/bpo
nginx -t && systemctl reload nginx
```

## 6. DNS (Cloudflare)
- Criar registro **A**: `bpo.angra.io` → `62.171.181.241`.
- Para o certbot HTTP-01 validar, deixar o registro **DNS only** (nuvem cinza) durante a emissão; depois pode ligar o proxy (laranja).

## 7. SSL
```bash
certbot --nginx -d bpo.angra.io
systemctl reload nginx
```

## 8. Validação
- `https://bpo.angra.io` → login (operador@angra.local / angra123).
- Todas as 8 rotas 200; dashboard com dados reais.
- `https://bpo.angra.io/api/dashboard/summary` com `Authorization: Bearer` responde.
- Upload em /ocr-documentos cai em revisão manual (sem HF) sem travar.

## Atualizações
```bash
cd /opt/bpo && git pull && CI=true pnpm install
export NEXT_PUBLIC_API_URL=https://bpo.angra.io/api
pnpm build && pnpm build:api
pm2 restart bpo-api bpo-web
```
