import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CourseSemesterController } from "./course-semester.controller";
import { CourseSemesterService } from "./course-semester.service";

@Module({
  providers: [CourseSemesterService, PrismaService],
  controllers: [CourseSemesterController],
  exports: [CourseSemesterService],
})
export class CourseSemesterModule {}
