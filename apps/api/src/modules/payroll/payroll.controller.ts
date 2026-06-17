import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { PayrollService } from "./payroll.service";

class CreateEmployeeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  admissionDate?: string;
}

class GenerateRunDto {
  @IsString()
  competence!: string;
}

@Controller("payroll")
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @Get("employees")
  employees(@CurrentUser() user?: DecodedJwt) {
    return this.service.listEmployees(companyScope(user));
  }

  @Post("employees")
  createEmployee(@Body() body: CreateEmployeeDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.createEmployee(body, companyScope(user));
  }

  @Get("runs")
  runs(@CurrentUser() user?: DecodedJwt) {
    return this.service.listRuns(companyScope(user));
  }

  @Get("summary")
  summary(@CurrentUser() user?: DecodedJwt) {
    return this.service.summary(companyScope(user));
  }

  @Post("runs")
  generate(@Body() body: GenerateRunDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.generate(body.competence, companyScope(user));
  }

  @Post("runs/:id/pay")
  pay(@Param("id") id: string) {
    return this.service.pay(id);
  }
}
