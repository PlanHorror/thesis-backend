import { Module } from '@nestjs/common';
import { LecturerController } from './lecturer.controller';
import { LecturerService } from './lecturer.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LecturerController],
  providers: [LecturerService, PrismaService],
  exports: [LecturerService],
})
export class LecturerModule {}
