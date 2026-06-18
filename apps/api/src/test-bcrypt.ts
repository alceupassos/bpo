import { hashPassword, passwordMatches } from "./modules/auth/jwt.util";

async function runTest() {
  console.log("Iniciando teste de bcrypt...");
  const rawPassword = "angra123";
  const hash = await hashPassword(rawPassword);
  console.log(`Hash gerado: ${hash}`);
  
  if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$")) {
    console.error("FALHA: O hash não é um hash bcrypt válido!");
    process.exit(1);
  }

  const match = await passwordMatches(rawPassword, hash);
  console.log(`Resultado da comparação da senha correta: ${match}`);
  if (!match) {
    console.error("FALHA: A senha correta deveria bater com o hash!");
    process.exit(1);
  }

  const mismatch = await passwordMatches("senha-errada", hash);
  console.log(`Resultado da comparação da senha errada: ${mismatch}`);
  if (mismatch) {
    console.error("FALHA: A senha errada não deveria bater com o hash!");
    process.exit(1);
  }

  console.log("SUCESSO: Teste de bcrypt passou com sucesso!");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Erro inesperado no teste:", err);
  process.exit(1);
});
