import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { TaxObligationsService } from "./tax-obligations.service";

class CreateObligationDto {
  @IsOptional()
  @IsIn(["DAS", "DEFIS", "OUTRO"])
  type?: "DAS" | "DEFIS" | "OUTRO";

  @IsString()
  competence!: string;

  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  baseRevenue?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller("tax-obligations")
export class TaxObligationsController {
  constructor(private readonly service: TaxObligationsService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.service.list(companyScope(user));
  }

  @Get("summary")
  summary(@CurrentUser() user?: DecodedJwt) {
    return this.service.summary(companyScope(user));
  }

  @Post()
  create(@Body() body: CreateObligationDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.create(body, companyScope(user));
  }

  @Post(":id/pay")
  pay(@Param("id") id: string) {
    return this.service.pay(id);
  }
}
