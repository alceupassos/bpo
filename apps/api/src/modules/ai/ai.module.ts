import { Global, Module } from "@nestjs/common";
import { AiVisionService } from "./ai-vision.service";
import { AngraAiService } from "./angra-ai.service";
import { LlmService } from "./llm.service";

@Global()
@Module({
  providers: [AiVisionService, LlmService, AngraAiService],
  exports: [AiVisionService, LlmService, AngraAiService]
})
export class AiModule {}
