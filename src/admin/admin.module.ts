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
import { EnrollmentController } from './course/enrollment/enrollment.controller';
import { CourseSemesterController } from './semester/course-semester/course-semester.controller';
import { EnrollmentModule } from 'src/course/enrollment/enrollment.module';
import { SessionController } from './course/enrollment/session/session.controller';
import { SessionModule } from 'src/course/enrollment/session/session.module';
import { ExamScheduleController } from './exam-schedule/exam-schedule.controller';
import { ExamScheduleModule } from 'src/exam-schedule/exam-schedule.module';
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from 'src/notification/notification.module';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookModule } from 'src/webhook/webhook.module';
import { PostController } from './post/post.controller';
import { PostModule } from 'src/post/post.module';
import { AdminRequestController } from './request/request.controller';
import { RequestModule } from 'src/request/request.module';
import { SeedService } from './seed/seed.service';

@Module({
  controllers: [
    AdminController,
    AdminRequestController,
    LecturerController,
    StudentController,
    DepartmentController,
    CourseController,
    SemesterController,
    EnrollmentController,
    CourseSemesterController,
    SessionController,
    ExamScheduleController,
    NotificationController,
    WebhookController,
    PostController,
  ],
  providers: [AdminService, PrismaService, SeedService],
  exports: [AdminService],
  imports: [
    StudentModule,
    LecturerModule,
    DepartmentModule,
    CourseModule,
    DocumentModule,
    SemesterModule,
    CourseSemesterModule,
    EnrollmentModule,
    SessionModule,
    ExamScheduleModule,
    NotificationModule,
    WebhookModule,
    PostModule,
    RequestModule,
  ],
})
export class AdminModule {}
