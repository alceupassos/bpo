import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { verifyJwt } from "./jwt.util";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers?.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token ausente");
    }
    const secret = this.config.get<string>("JWT_SECRET");
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET nao configurado");
    }
    const payload = verifyJwt(header.slice(7), secret);
    if (!payload) {
      throw new UnauthorizedException("Token invalido ou expirado");
    }
    request.user = payload;
    return true;
  }
}
