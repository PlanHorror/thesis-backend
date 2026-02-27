import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { LecturerRequestController } from "./lecturer-request.controller";
import { RequestService } from "./request.service";
import { StudentRequestController } from "./student-request.controller";

@Module({
  controllers: [LecturerRequestController, StudentRequestController],
  providers: [RequestService, PrismaService],
  exports: [RequestService],
})
export class RequestModule {}
