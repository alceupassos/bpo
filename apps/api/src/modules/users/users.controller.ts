import { Controller, Get } from "@nestjs/common";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@CurrentUser() user?: DecodedJwt) {
    return this.usersService.findAll(companyScope(user));
  }
}
