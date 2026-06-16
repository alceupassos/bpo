import { Controller, Get, Param, Post } from "@nestjs/common";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { ApprovalService } from "./approval.service";

@Controller("approvals")
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.approvalService.list(companyScope(user));
  }

  @Post(":id/approve")
  approve(@Param("id") id: string) {
    return this.approvalService.approve(id);
  }

  @Post(":id/reject")
  reject(@Param("id") id: string) {
    return this.approvalService.reject(id);
  }
}
