import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminRegisterDto, SigninDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/register')
  async adminRegister(@Body() data: AdminRegisterDto) {
    return this.authService.adminRegister(data);
  }

  @Post('admin/signin')
  async adminSignin(@Body() data: SigninDto) {
    return this.authService.adminSignin(data);
  }

  @Post('student/signin')
  async studentSignin(@Body() data: SigninDto) {
    return this.authService.studentSignin(data);
  }

  @Post('teacher/signin')
  async teacherSignin(@Body() data: SigninDto) {
    return this.authService.teacherSignin(data);
  }
}
