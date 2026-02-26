import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ProfileUpdateRequestController } from "./profile-update-request.controller";
import { ProfileUpdateRequestService } from "./profile-update-request.service";

@Module({
  controllers: [ProfileUpdateRequestController],
  providers: [ProfileUpdateRequestService, PrismaService],
  exports: [ProfileUpdateRequestService],
})
export class ProfileUpdateRequestModule {}
