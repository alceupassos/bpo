import { Global, Module } from "@nestjs/common";
import { ResourceScopeService } from "../common/resource-scope.service";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService, ResourceScopeService],
  exports: [PrismaService, ResourceScopeService]
})
export class PrismaModule {}
