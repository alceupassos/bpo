import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import * as http from "http";

async function runTest() {
  console.log("Iniciando teste de autenticação (401)...");
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("api");
  const port = 3003;
  await app.listen(port, "127.0.0.1");

  const req = http.get(`http://127.0.0.1:${port}/api/auth/me`, (res) => {
    console.log(`Resposta recebida. Status Code: ${res.statusCode}`);
    if (res.statusCode === 401) {
      console.log("SUCESSO: GET /api/auth/me sem token retornou 401!");
      app.close().then(() => {
        process.exit(0);
      });
    } else {
      console.error(`FALHA: Esperava status 401, mas recebeu ${res.statusCode}`);
      app.close().then(() => {
        process.exit(1);
      });
    }
  });

  req.on("error", (err) => {
    console.error("Erro na requisição:", err);
    app.close().then(() => {
      process.exit(1);
    });
  });
}

runTest().catch((err) => {
  console.error("Erro ao iniciar o teste:", err);
  process.exit(1);
});
