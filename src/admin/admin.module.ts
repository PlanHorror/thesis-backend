import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentModule } from 'src/user-manager/student/student.module';
import { LecturerModule } from 'src/user-manager/lecturer/lecturer.module';
import { DepartmentModule } from 'src/department/department.module';
import { LecturerController } from './lecturer/lecturer.controller';
import { StudentController } from './student/student.controller';
import { DepartmentController } from './department/department.controller';
import { CourseController } from './course/course.controller';
import { CourseModule } from 'src/course/course.module';
import { DocumentModule } from 'src/course/document/document.module';
import { SemesterController } from './semester/semester.controller';
import { SemesterModule } from 'src/semester/semester.module';
import { CourseSemesterModule } from 'src/semester/course-semester/course-semester.module';

@Module({
  controllers: [
    AdminController,
    LecturerController,
    StudentController,
    DepartmentController,
    CourseController,
    SemesterController,
  ],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
  imports: [
    StudentModule,
    LecturerModule,
    DepartmentModule,
    CourseModule,
    DocumentModule,
    SemesterModule,
    CourseSemesterModule,
  ],
})
export class AdminModule {}
