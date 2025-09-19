import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StudentModule } from 'src/user-manager/student/student.module';
import { AdminModule } from 'src/admin/admin.module';
import { TeacherModule } from 'src/user-manager/teacher/teacher.module';
import { AccessStrategy } from './strategies/access.strategy';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccessStrategy, PrismaService],
  imports: [
    forwardRef(() => StudentModule),
    forwardRef(() => AdminModule),
    forwardRef(() => TeacherModule),
  ],
  exports: [AuthService, AccessStrategy],
})
export class AuthModule {}
