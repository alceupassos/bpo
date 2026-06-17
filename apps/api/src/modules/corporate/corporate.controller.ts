import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsIn, IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { CorporateService } from "./corporate.service";

class CreateDocDto {
  @IsOptional()
  @IsIn(["CONTRATO_SOCIAL", "CERTIFICADO_DIGITAL", "PROCURACAO", "ALVARA", "OUTRO"])
  type?: "CONTRATO_SOCIAL" | "CERTIFICADO_DIGITAL" | "PROCURACAO" | "ALVARA" | "OUTRO";

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller("corporate")
export class CorporateController {
  constructor(private readonly service: CorporateService) {}

  @Get("docs")
  listDocs(@CurrentUser() user?: DecodedJwt) {
    return this.service.listDocs(companyScope(user));
  }

  @Get("company")
  company(@CurrentUser() user?: DecodedJwt) {
    return this.service.company(companyScope(user));
  }

  @Get("summary")
  summary(@CurrentUser() user?: DecodedJwt) {
    return this.service.summary(companyScope(user));
  }

  @Post("docs")
  createDoc(@Body() body: CreateDocDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.createDoc(body, companyScope(user));
  }
}
