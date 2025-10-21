import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentModule } from './document/document.module';

@Module({
  controllers: [CourseController],
  providers: [CourseService, PrismaService],
  exports: [CourseService],
  imports: [DocumentModule],
})
export class CourseModule {}
