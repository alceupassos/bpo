import { Body, Controller, Get, Post, UnauthorizedException } from "@nestjs/common";
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
}
