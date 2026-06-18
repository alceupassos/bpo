import { Body, Controller, Get, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { CurrentUser } from "./current-user.decorator";
import type { DecodedJwt } from "./jwt.util";

import { Throttle } from "@nestjs/throttler";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get("me")
  me(@CurrentUser() user?: DecodedJwt) {
    if (!user) throw new UnauthorizedException();
    return this.authService.me(user);
  }

  @Public()
  @Post("refresh")
  refresh(@Headers("authorization") authorization?: string) {
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token ausente");
    }
    return this.authService.refresh(authorization.slice(7));
  }
}
