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
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import type { UploadedFileLike } from "../documents/storage.service";
import { FiscalNotesService } from "./fiscal-notes.service";

class ReviewNoteDto {
  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsIn(["APPROVED", "REJECTED"])
  status?: "APPROVED" | "REJECTED";
}

@Controller("fiscal-notes")
export class FiscalNotesController {
  constructor(private readonly service: FiscalNotesService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.service.list(companyScope(user));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  upload(@UploadedFile() file: UploadedFileLike, @CurrentUser() user?: DecodedJwt) {
    return this.service.upload(file, companyScope(user));
  }

  @Post(":id/review")
  review(@Param("id") id: string, @Body() body: ReviewNoteDto) {
    return this.service.review(id, body);
  }

  @Post(":id/post")
  post(@Param("id") id: string, @CurrentUser() user?: DecodedJwt) {
    return this.service.post(id, companyScope(user));
  }

  @Post(":id/register-products")
  registerProducts(@Param("id") id: string, @CurrentUser() user?: DecodedJwt) {
    return this.service.registerProducts(id, companyScope(user));
  }
}
