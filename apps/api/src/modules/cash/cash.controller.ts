import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { CashService } from "./cash.service";

class OpenCashDto {
  @IsOptional()
  @IsNumber()
  openingAmount?: number;
}

class CashEntryDto {
  @IsEnum(["SALE", "IN", "OUT", "SANGRIA", "SUPRIMENTO"])
  type!: "SALE" | "IN" | "OUT" | "SANGRIA" | "SUPRIMENTO";

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

@Controller("cash")
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Get("current")
  current(@CurrentUser() user?: DecodedJwt) {
    return this.cashService.current(companyScope(user));
  }

  @Get("sessions")
  sessions(@CurrentUser() user?: DecodedJwt) {
    return this.cashService.sessions(companyScope(user));
  }

  @Post("open")
  open(@Body() body: OpenCashDto, @CurrentUser() user?: DecodedJwt) {
    return this.cashService.open(companyScope(user), user?.email ?? "operador", body.openingAmount ?? 0);
  }

  @Post("close/:id")
  close(@Param("id") id: string) {
    return this.cashService.close(id);
  }

  @Post("entries/:id")
  addEntry(@Param("id") id: string, @Body() body: CashEntryDto) {
    return this.cashService.addEntry(id, body.type, body.amount, body.description, body.paymentMethod);
  }
}
