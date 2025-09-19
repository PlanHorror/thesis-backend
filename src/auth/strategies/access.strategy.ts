import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Admin, Student, Teacher } from '@prisma/client';
import { Role } from 'common';
import { AccountPayload } from 'common/interface/account.interface';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['access_token'];
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET!,
    });
  }

  async validate(
    payload: AccountPayload,
  ): Promise<(Admin | Student | Teacher) & { role: Role }> {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    const { id, email, role } = payload;
    if (role === Role.ADMIN) {
      try {
        const admin = await this.prismaService.admin.findUnique({
          where: { id },
        });
        if (!admin || !admin.active) {
          throw new UnauthorizedException('Account invalid');
        }
        return { ...admin, role };
      } catch (error) {
        throw new UnauthorizedException('Account invalid');
      }
    } else if (role === Role.STUDENT && email) {
      const student = await this.prismaService.student.findUnique({
        where: { id, email },
      });
      if (!student || !student.active) {
        throw new UnauthorizedException('Account invalid');
      }
      return { ...student, role };
    } else if (role === Role.TEACHER && email) {
      const teacher = await this.prismaService.teacher.findUnique({
        where: { id, email },
      });
      if (!teacher || !teacher.active) {
        throw new UnauthorizedException('Account invalid');
      }
      return { ...teacher, role };
    } else {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
