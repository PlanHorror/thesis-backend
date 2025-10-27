import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { StudentModule } from './user-manager/student/student.module';
import { LecturerModule } from './user-manager/lecturer/lecturer.module';
import { AdminModule } from './admin/admin.module';
import { DepartmentModule } from './department/department.module';
import { CourseModule } from './course/course.module';
import { SemesterModule } from './semester/semester.module';
import { CourseSemesterController } from './src/admin/semester/course-semester/course-semester.controller';

@Module({
  imports: [AuthModule, StudentModule, LecturerModule, AdminModule, DepartmentModule, CourseModule, SemesterModule],
  controllers: [AppController, CourseSemesterController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
