import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentModule } from 'src/user-manager/student/student.module';
import { LecturerModule } from 'src/user-manager/lecturer/lecturer.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
  imports: [StudentModule, LecturerModule],
})
export class AdminModule {}
