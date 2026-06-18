import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { ConfigService } from "@nestjs/config";
import { signJwt, type JwtPayload } from "./modules/auth/jwt.util";
import * as http from "http";

function makeGetRequest(port: number, path: string, token: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port,
      path,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          if (res.statusCode !== 200) {
            reject(new Error(`Endpoint ${path} returned status ${res.statusCode}: ${data}`));
          } else {
            resolve(JSON.parse(data));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function runTest() {
  console.log("Iniciando teste de isolamento multi-tenant...");
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const port = 3004;
  await app.listen(port, "127.0.0.1");

  const config = app.get(ConfigService);
  const secret = config.get<string>("JWT_SECRET")!;
  console.log("JWT_SECRET obtido do ConfigService.");

  // 1. Criar payloads para os dois usuários
  const payload1: JwtPayload = {
    sub: "user-3",
    email: "gestor@praiaazul.com.br",
    name: "Carla Mota",
    role: "GESTOR_EMPRESA",
    companyId: "company-1"
  };

  const payload2: JwtPayload = {
    sub: "user-4",
    email: "financeiro@bompreco.com.br",
    name: "Diego Luz",
    role: "FINANCEIRO_EMPRESA",
    companyId: "company-2"
  };

  const token1 = signJwt(payload1, secret);
  const token2 = signJwt(payload2, secret);

  const endpoints = [
    "/api/financial-entries",
    "/api/documents",
    "/api/fiscal-notes",
    "/api/cash/sessions"
  ];

  let success = true;

  for (const endpoint of endpoints) {
    console.log(`\nTestando isolamento em: ${endpoint}`);

    // Fazer requisição como empresa-1
    const res1 = await makeGetRequest(port, endpoint, token1);
    console.log(`Empresa 1 (Praia Azul) retornou ${res1.length} registros.`);
    for (const item of res1) {
      if (item.companyId !== "company-1") {
        console.error(`FALHA DE ISOLAMENTO: Registro com companyId '${item.companyId}' retornado para Empresa 1!`);
        success = false;
      }
    }

    // Fazer requisição como empresa-2
    const res2 = await makeGetRequest(port, endpoint, token2);
    console.log(`Empresa 2 (Bom Preço) retornou ${res2.length} registros.`);
    for (const item of res2) {
      if (item.companyId !== "company-2") {
        console.error(`FALHA DE ISOLAMENTO: Registro com companyId '${item.companyId}' retornado para Empresa 2!`);
        success = false;
      }
    }
  }

  await app.close();

  if (success) {
    console.log("\nSUCESSO: Todos os testes de isolamento multi-tenant passaram!");
    process.exit(0);
  } else {
    console.error("\nFALHA: Ocorreram falhas no isolamento multi-tenant!");
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error("Erro inesperado durante o teste:", err);
  process.exit(1);
});
