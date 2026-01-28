import { Module } from '@nestjs/common';
import { ExamScheduleController } from './exam-schedule.controller';
import { ExamScheduleService } from './exam-schedule.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ExamScheduleController],
  providers: [ExamScheduleService, PrismaService],
  exports: [ExamScheduleService],
})
export class ExamScheduleModule {}
