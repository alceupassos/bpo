import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { CustomersService } from "./customers.service";

class CreateCustomerDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsArray()
  faceDescriptor?: number[];

  @IsOptional()
  @IsString()
  webauthnCredId?: string;

  @IsOptional()
  @IsString()
  qrToken?: string;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;
}

class IdentifyDto {
  @IsIn(["FACE", "WEBAUTHN", "QR"])
  method!: "FACE" | "WEBAUTHN" | "QR";

  @IsOptional()
  @IsArray()
  faceDescriptor?: number[];

  @IsOptional()
  @IsString()
  webauthnCredId?: string;

  @IsOptional()
  @IsString()
  qrToken?: string;
}

class ChargeDto {
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

@Controller("customers")
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.service.list(companyScope(user));
  }

  @Post()
  create(@Body() body: CreateCustomerDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.create(body, companyScope(user));
  }

  @Post("identify")
  identify(@Body() body: IdentifyDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.identify(body, companyScope(user));
  }

  @Post(":id/charge")
  charge(@Param("id") id: string, @Body() body: ChargeDto) {
    return this.service.charge(id, body);
  }
}
