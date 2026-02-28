import { Module } from "@nestjs/common";
import { CourseModule } from "src/course/course.module";
import { DocumentModule } from "src/course/document/document.module";
import { EnrollmentModule } from "src/course/enrollment/enrollment.module";
import { SessionModule } from "src/course/enrollment/session/session.module";
import { DepartmentModule } from "src/department/department.module";
import { ExamScheduleModule } from "src/exam-schedule/exam-schedule.module";
import { NotificationModule } from "src/notification/notification.module";
import { PostModule } from "src/post/post.module";
import { PrismaService } from "src/prisma/prisma.service";
import { ProfileUpdateRequestModule } from "src/profile-update-request/profile-update-request.module";
import { RequestModule } from "src/request/request.module";
import { CourseSemesterModule } from "src/semester/course-semester/course-semester.module";
import { SemesterModule } from "src/semester/semester.module";
import { SupportRequestModule } from "src/support-request/support-request.module";
import { LecturerModule } from "src/user-manager/lecturer/lecturer.module";
import { StudentModule } from "src/user-manager/student/student.module";
import { WebhookModule } from "src/webhook/webhook.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { CourseController } from "./course/course.controller";
import { EnrollmentController } from "./course/enrollment/enrollment.controller";
import { SessionController } from "./course/enrollment/session/session.controller";
import { DepartmentController } from "./department/department.controller";
import { ExamScheduleController } from "./exam-schedule/exam-schedule.controller";
import { LecturerController } from "./lecturer/lecturer.controller";
import { NotificationController } from "./notification/notification.controller";
import { PostController } from "./post/post.controller";
import { AdminProfileUpdateRequestController } from "./profile-update-request/profile-update-request.controller";
import { AdminRequestController } from "./request/request.controller";
import { SeedService } from "./seed/seed.service";
import { CourseSemesterController } from "./semester/course-semester/course-semester.controller";
import { SemesterController } from "./semester/semester.controller";
import { StudentController } from "./student/student.controller";
import { AdminSupportRequestController } from "./support-request/support-request.controller";
import { WebhookController } from "./webhook/webhook.controller";

@Module({
  controllers: [
    AdminController,
    AdminRequestController,
    AdminProfileUpdateRequestController,
    AdminSupportRequestController,
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
    ProfileUpdateRequestModule,
    SupportRequestModule,
  ],
})
export class AdminModule {}
