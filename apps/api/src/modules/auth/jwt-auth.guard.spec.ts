import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
  const config = { get: jest.fn().mockReturnValue("test-secret") } as unknown as ConfigService;
  const guard = new JwtAuthGuard(reflector, config);

  function mockContext(headers: Record<string, string> = {}): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers })
      }),
      getHandler: () => ({}),
      getClass: () => ({})
    } as ExecutionContext;
  }

  it("requisicao sem token retorna 401", () => {
    expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
  });
});