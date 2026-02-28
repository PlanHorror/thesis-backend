import { Module } from "@nestjs/common";
import { EnrollmentModule } from "src/course/enrollment/enrollment.module";
import { ExamScheduleModule } from "src/exam-schedule/exam-schedule.module";
import { PrismaService } from "src/prisma/prisma.service";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";

@Module({
  imports: [EnrollmentModule, ExamScheduleModule],
  controllers: [AiController],
  providers: [AiService, PrismaService],
  exports: [AiService],
})
export class AiModule {}
