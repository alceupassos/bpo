import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { SuppliersService } from "./suppliers.service";

class CreateSupplierDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

@Controller("suppliers")
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.service.list(companyScope(user));
  }

  @Post()
  create(@Body() body: CreateSupplierDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.create(body, companyScope(user));
  }
}
