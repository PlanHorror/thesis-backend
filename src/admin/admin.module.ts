import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccessStrategy } from 'src/auth/strategies/access.strategy';
import { StudentModule } from 'src/user-manager/student/student.module';
import { TeacherModule } from 'src/user-manager/teacher/teacher.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
  imports: [StudentModule, TeacherModule],
})
export class AdminModule {}
