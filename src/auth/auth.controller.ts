import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/register')
  async adminRegister() {
    // Admin registration logic
  }

  @Post('student/register')
  async studentRegister() {
    // Student registration logic
  }

  @Post('teacher/register')
  async teacherRegister() {
    // Teacher registration logic
  }

  @Post('admin/login')
  async adminLogin() {
    // Admin login logic
  }

  @Post('student/login')
  async studentLogin() {
    // Student login logic
  }

  @Post('teacher/login') async teacherLogin() {
    // Teacher login logic
  }
}
