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
import { CourseSemesterController } from './admin/semester/course-semester/course-semester.controller';
import { ExamScheduleModule } from './exam-schedule/exam-schedule.module';
import { NotificationModule } from './notification/notification.module';
import { GatewayModule } from './gateway/gateway.module';
import { WebhookModule } from './webhook/webhook.module';
import { CourseSemesterModule } from './semester/course-semester/course-semester.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

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
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
