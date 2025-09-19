import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StudentModule } from 'src/user-manager/student/student.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [StudentModule],
  exports: [AuthService],
})
export class AuthModule {}
