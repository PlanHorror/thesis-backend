import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Student, Lecturer, Admin } from '@prisma/client';
import { Role } from 'common';
import { Request } from 'express';

export class RoleGuard implements CanActivate {
  constructor(private requiredRoles: Role[]) {}

  canActivate(context: ExecutionContext): boolean {
    const user = context
      .switchToHttp()
      .getRequest<
        Request & { user: (Admin | Student | Lecturer) & { role: Role } }
      >().user;
    return user && user.role && this.requiredRoles.includes(user.role);
  }
}
