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
import { IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import type { UploadedFileLike } from "../documents/storage.service";
import { ChatService } from "./chat.service";

class SendMessageDto {
  @IsString()
  body!: string;
}

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("threads")
  threads(@CurrentUser() user?: DecodedJwt) {
    return this.chatService.threads(companyScope(user));
  }

  @Get("threads/:id/messages")
  messages(@Param("id") id: string) {
    return this.chatService.messages(id);
  }

  @Post("threads/:id/messages")
  send(@Param("id") id: string, @Body() body: SendMessageDto) {
    return this.chatService.send(id, body.body, "OUT");
  }

  @Post("threads/:id/upload")
  @UseInterceptors(FileInterceptor("file"))
  upload(@Param("id") id: string, @UploadedFile() file: UploadedFileLike, @CurrentUser() user?: DecodedJwt) {
    return this.chatService.upload(id, file, companyScope(user));
  }
}
