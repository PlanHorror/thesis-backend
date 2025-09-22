import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { StudentModule } from './user-manager/student/student.module';
import { LecturerModule } from './user-manager/lecturer/lecturer.module';
import { AdminModule } from './admin/admin.module';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [AuthModule, StudentModule, LecturerModule, AdminModule, DepartmentModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
