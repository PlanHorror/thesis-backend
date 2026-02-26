import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { DepartmentModule } from "./department/department.module";
import { ExamScheduleModule } from "./exam-schedule/exam-schedule.module";
import { GatewayModule } from "./gateway/gateway.module";
import { NotificationModule } from "./notification/notification.module";
import { PostModule } from "./post/post.module";
import { PrismaService } from "./prisma/prisma.service";
import { ProfileUpdateRequestModule } from "./profile-update-request/profile-update-request.module";
import { RequestModule } from "./request/request.module";
import { CourseSemesterModule } from "./semester/course-semester/course-semester.module";
import { SemesterModule } from "./semester/semester.module";
import { LecturerModule } from "./user-manager/lecturer/lecturer.module";
import { StudentModule } from "./user-manager/student/student.module";
import { WebhookModule } from "./webhook/webhook.module";

@Module({
  imports: [
    AuthModule,
    StudentModule,
    LecturerModule,
    AdminModule,
    DepartmentModule,
    CourseModule,
    SemesterModule,
    ExamScheduleModule,
    NotificationModule,
    GatewayModule,
    WebhookModule,
    CourseSemesterModule,
    RequestModule,
    ProfileUpdateRequestModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot(),
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
