import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService, PrismaService],
  exports: [TeacherService],
})
export class TeacherModule {}
