import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentModule } from './document/document.module';
import { EnrollmentModule } from './enrollment/enrollment.module';

@Module({
  controllers: [CourseController],
  providers: [CourseService, PrismaService],
  exports: [CourseService],
  imports: [DocumentModule, EnrollmentModule],
})
export class CourseModule {}
