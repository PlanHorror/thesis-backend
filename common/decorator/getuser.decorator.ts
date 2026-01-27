import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Admin, Lecturer, Student } from '@prisma/client';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): Lecturer | Admin | Student => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as Lecturer | Admin | Student;
  },
);
