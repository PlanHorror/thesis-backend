import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { StudentModule } from './user-manager/student/student.module';
import { TeacherModule } from './user-manager/teacher/teacher.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, StudentModule, TeacherModule, AdminModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
