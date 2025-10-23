import { Module } from '@nestjs/common';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseSemesterModule } from './course-semester/course-semester.module';

@Module({
  controllers: [SemesterController],
  providers: [SemesterService, PrismaService],
  exports: [SemesterService],
  imports: [CourseSemesterModule],
})
export class SemesterModule {}
