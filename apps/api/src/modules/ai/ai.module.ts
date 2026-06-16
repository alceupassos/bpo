import { Global, Module } from "@nestjs/common";
import { AiVisionService } from "./ai-vision.service";

@Global()
@Module({
  providers: [AiVisionService],
  exports: [AiVisionService]
})
export class AiModule {}
