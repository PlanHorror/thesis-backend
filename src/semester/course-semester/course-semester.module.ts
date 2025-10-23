import { Module } from '@nestjs/common';
import { CourseSemesterService } from './course-semester.service';
import { CourseSemesterController } from './course-semester.controller';

@Module({
  providers: [CourseSemesterService],
  controllers: [CourseSemesterController]
})
export class CourseSemesterModule {}
