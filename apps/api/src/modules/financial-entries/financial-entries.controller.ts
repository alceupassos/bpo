import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { FinancialEntriesService } from "./financial-entries.service";

type EntryType = "PAYABLE" | "RECEIVABLE" | "EXPENSE" | "REVENUE";

class CreateFinancialEntryDto {
  @IsEnum(["PAYABLE", "RECEIVABLE", "EXPENSE", "REVENUE"])
  type!: EntryType;

  @IsString()
  description!: string;

  @IsString()
  counterpartyName!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

@Controller("financial-entries")
export class FinancialEntriesController {
  constructor(private readonly financialEntriesService: FinancialEntriesService) {}

  @Get()
  list(@Query("type") type?: EntryType, @CurrentUser() user?: DecodedJwt) {
    return this.financialEntriesService.list(type, companyScope(user));
  }

  @Post()
  create(@Body() body: CreateFinancialEntryDto, @CurrentUser() user?: DecodedJwt) {
    return this.financialEntriesService.create(body, companyScope(user));
  }

  @Post(":id/mark-paid")
  markPaid(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.financialEntriesService.markPaid(id, companyScope(user));
  }

  @Post(":id/mark-received")
  markReceived(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.financialEntriesService.markReceived(id, companyScope(user));
  }
}
