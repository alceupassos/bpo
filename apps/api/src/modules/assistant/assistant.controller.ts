import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { AssistantService } from "./assistant.service";

class AskDto {
  @IsString()
  question!: string;
}

@Controller("assistant")
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post("ask")
  ask(@Body() body: AskDto, @CurrentUser() user?: DecodedJwt) {
    return this.assistantService.ask(body.question, companyScope(user));
  }

  @Get("context")
  context(@CurrentUser() user?: DecodedJwt) {
    return this.assistantService.buildContext(companyScope(user));
  }
}
