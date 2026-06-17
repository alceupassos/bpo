import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsIn, IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { AccountingService } from "./accounting.service";

class GenerateExportDto {
  @IsString()
  competence!: string;

  @IsOptional()
  @IsIn(["XML", "CSV", "ZIP"])
  format?: "XML" | "CSV" | "ZIP";
}

@Controller("accounting")
export class AccountingController {
  constructor(private readonly service: AccountingService) {}

  @Get("exports")
  list(@CurrentUser() user?: DecodedJwt) {
    return this.service.list(companyScope(user));
  }

  @Get("summary")
  summary(@CurrentUser() user?: DecodedJwt) {
    return this.service.summary(companyScope(user));
  }

  @Post("exports")
  generate(@Body() body: GenerateExportDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.generate(body.competence, body.format ?? "ZIP", companyScope(user));
  }
}
