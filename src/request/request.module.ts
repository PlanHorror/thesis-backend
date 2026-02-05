import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { LecturerRequestController } from './lecturer-request.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LecturerRequestController],
  providers: [RequestService, PrismaService],
  exports: [RequestService],
})
export class RequestModule {}
