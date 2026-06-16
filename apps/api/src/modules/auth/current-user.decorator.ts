import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { DecodedJwt } from "./jwt.util";

/** Injeta o payload do JWT já validado pelo guard (ou undefined em rota pública). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DecodedJwt | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

/**
 * Resolve o escopo de empresa de um usuário: papéis internos
 * (ADMIN_PLATAFORMA / OPERADOR_BPO) veem tudo (null); cliente vê só a sua.
 */
export function companyScope(user?: DecodedJwt): string | null {
  if (!user) return null;
  if (user.role === "ADMIN_PLATAFORMA" || user.role === "OPERADOR_BPO") return null;
  return user.companyId;
}
