import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import type { UploadedFileLike } from "../documents/storage.service";
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
  close(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.cashService.close(id, companyScope(user));
  }

  @Post("entries/:id")
  addEntry(
    @Param("id", ParseResourceIdPipe) id: string,
    @Body() body: CashEntryDto,
    @CurrentUser() user?: DecodedJwt
  ) {
    return this.cashService.addEntry(
      id,
      body.type,
      body.amount,
      body.description,
      body.paymentMethod,
      companyScope(user)
    );
  }

  @Post("receipt/:id")
  @UseInterceptors(FileInterceptor("file"))
  receipt(
    @Param("id", ParseResourceIdPipe) id: string,
    @UploadedFile() file: UploadedFileLike,
    @CurrentUser() user?: DecodedJwt
  ) {
    return this.cashService.receipt(id, file, companyScope(user));
  }
}
