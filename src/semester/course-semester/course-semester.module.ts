import { Module } from '@nestjs/common';
import { CourseSemesterService } from './course-semester.service';
import { CourseSemesterController } from './course-semester.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [CourseSemesterService, PrismaService],
  controllers: [CourseSemesterController],
  exports: [CourseSemesterService],
})
export class CourseSemesterModule {}
