import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import type { DecodedJwt } from "../auth/jwt.util";
import { AuditService } from "./audit.service";

const MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      user?: DecodedJwt;
      params?: Record<string, string>;
    }>();

    if (!MUTATIONS.has(req.method) || req.url.includes("/auth/login")) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((body) => {
        const user = req.user;
        if (!user) return;

        const entityId =
          (body as { id?: string })?.id ??
          req.params?.id ??
          req.params?.transactionId ??
          "unknown";

        const segment = req.url.replace(/^\/api\/?/, "").split("/")[0] ?? "unknown";

        void this.auditService.log({
          companyId: user.companyId ?? "system",
          entityType: segment.toUpperCase(),
          entityId,
          action: `${req.method} ${req.url}`,
          actor: user.email ?? user.name ?? user.sub
        });
      })
    );
  }
}