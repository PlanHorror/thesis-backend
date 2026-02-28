import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SupportRequestController } from "./support-request.controller";
import { SupportRequestService } from "./support-request.service";

@Module({
  controllers: [SupportRequestController],
  providers: [SupportRequestService, PrismaService],
  exports: [SupportRequestService],
})
export class SupportRequestModule {}
