import { Global, Module } from "@nestjs/common";
import { AiVisionService } from "./ai-vision.service";
import { LlmService } from "./llm.service";

@Global()
@Module({
  providers: [AiVisionService, LlmService],
  exports: [AiVisionService, LlmService]
})
export class AiModule {}
