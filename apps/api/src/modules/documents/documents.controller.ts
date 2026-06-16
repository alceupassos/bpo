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
import { IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { DocumentsService } from "./documents.service";
import type { UploadedFileLike } from "./storage.service";

class ReviewDocumentDto {
  @IsOptional()
  @IsString()
  category?: string;
}

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.documentsService.list(companyScope(user));
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  upload(@UploadedFile() file: UploadedFileLike, @CurrentUser() user?: DecodedJwt) {
    return this.documentsService.upload(file, companyScope(user));
  }

  @Post(":id/process")
  process(@Param("id") id: string) {
    return this.documentsService.process(id);
  }

  @Post(":id/review")
  review(@Param("id") id: string, @Body() body: ReviewDocumentDto) {
    return this.documentsService.review(id, body.category);
  }
}
