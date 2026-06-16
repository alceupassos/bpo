// PM2 — processos de produção do bpo-angra na VPS (/var/www/bpo.angra.io).
// Portas alinhadas ao nginx existente: web 5001, api 5002.
// Subir com: pm2 start ecosystem.config.js && pm2 save  (a partir da raiz do projeto)
module.exports = {
  apps: [
    {
      name: "bpo-api",
      cwd: ".",
      script: "apps/api/dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: "5002"
        // JWT_SECRET, STORAGE_*, HF_* vêm de apps/api/.env (carregado via cwd=raiz)
      }
    },
    {
      name: "bpo-web",
      cwd: ".",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 5001",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
