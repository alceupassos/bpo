import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { Public } from "../auth/public.decorator";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Public()
  @Post()
  create(@Body() body: CreateCompanyDto) {
    return this.companiesService.create(body);
  }

  @Get()
  findAll(@CurrentUser() user?: DecodedJwt) {
    return this.companiesService.findAll(companyScope(user));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.companiesService.findOne(id);
  }
}
