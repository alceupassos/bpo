import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import {
  hashPassword,
  passwordMatches,
  signJwt,
  verifyJwtForRefresh,
  type DecodedJwt,
  type JwtPayload
} from "./jwt.util";

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  private secret(): string {
    const secret = this.config.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    return secret;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await passwordMatches(password, user.passwordHash))) {
      throw new UnauthorizedException("Credenciais invalidas");
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    };
    return {
      accessToken: signJwt(payload, this.secret()),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId }
    };
  }

  me(decoded: DecodedJwt) {
    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await passwordMatches(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException("Senha atual incorreta");
    }
    const passwordHash = await hashPassword(newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { changed: true };
  }

  /** Renova o JWT a partir de um token válido ou expirado recentemente. */
  async refresh(token: string) {
    const decoded = verifyJwtForRefresh(token, this.secret());
    if (!decoded) {
      throw new UnauthorizedException("Sessao expirada");
    }
    const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
      throw new UnauthorizedException("Sessao expirada");
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    };
    return {
      accessToken: signJwt(payload, this.secret()),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId }
    };
  }
}
