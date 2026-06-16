import { Module } from "@nestjs/common";
import { StorageService } from "../documents/storage.service";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  controllers: [ChatController],
  providers: [ChatService, StorageService]
})
export class ChatModule {}
