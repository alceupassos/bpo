/** One-off: rehasheia senhas de seed com bcrypt (idempotente). Rodar na VPS após deploy. */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const SEED_USERS = [
  "operador@angra.local",
  "admin@angra.local",
  "gestor@praiaazul.com.br",
  "financeiro@bompreco.com.br"
];
const PASSWORD = "angra123";

async function main() {
  const prisma = new PrismaClient();
  const hash = bcrypt.hashSync(PASSWORD, 10);
  for (const email of SEED_USERS) {
    const updated = await prisma.user.updateMany({
      where: { email },
      data: { passwordHash: hash }
    });
    console.log(`${email}: ${updated.count} atualizado(s)`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});