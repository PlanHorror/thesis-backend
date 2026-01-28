import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseSemesterModule } from 'src/semester/course-semester/course-semester.module';

@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService, PrismaService],
  exports: [EnrollmentService],
  imports: [CourseSemesterModule],
})
export class EnrollmentModule {}
