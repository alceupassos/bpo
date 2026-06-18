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
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
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
  findOne(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.service.findOne(id, companyScope(user));
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  upload(@UploadedFile() file: UploadedFileLike, @CurrentUser() user?: DecodedJwt) {
    return this.service.upload(file, companyScope(user));
  }

  @Post(":id/review")
  review(
    @Param("id", ParseResourceIdPipe) id: string,
    @Body() body: ReviewNoteDto,
    @CurrentUser() user?: DecodedJwt
  ) {
    return this.service.review(id, body, companyScope(user));
  }

  @Post(":id/post")
  post(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.service.post(id, companyScope(user));
  }

  @Post(":id/register-products")
  registerProducts(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.service.registerProducts(id, companyScope(user));
  }

  @Post(":id/process-full")
  processFull(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.service.processFull(id, companyScope(user));
  }
}
