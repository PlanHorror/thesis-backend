import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const IsAuthenticated = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest();
    return !!request?.user;
  },
);
