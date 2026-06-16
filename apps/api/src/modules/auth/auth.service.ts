import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { users } from "../../data/seed";
import { passwordMatches, signJwt, type DecodedJwt, type JwtPayload } from "./jwt.util";

@Injectable()
export class AuthService {
  constructor(private readonly config: ConfigService) {}

  private secret(): string {
    return this.config.get<string>("JWT_SECRET") ?? "dev-secret-change-me";
  }

  login(email: string, password: string) {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !passwordMatches(password, user.password)) {
      throw new UnauthorizedException("Credenciais invalidas");
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    };
    const accessToken = signJwt(payload, this.secret());
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
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
}
