import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { createReadStream } from "fs";
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
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

  @Get("exports/:id/download")
  async download(
    @Param("id", ParseResourceIdPipe) id: string,
    @CurrentUser() user: DecodedJwt | undefined,
    @Res() res: Response
  ) {
    const { fullPath, filename } = await this.service.download(id, companyScope(user));
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/zip");
    createReadStream(fullPath).pipe(res);
  }
}
