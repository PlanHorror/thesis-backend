import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AdminRegisterDto,
  LecturerSigninDto,
  SigninDto,
  StudentSigninDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/signup')
  async adminSignup(@Body() data: AdminRegisterDto) {
    return this.authService.adminSignup(data);
  }

  @Post('admin/signin')
  async adminSignin(@Body() data: SigninDto) {
    return this.authService.adminSignin(data);
  }

  @Post('student/signin')
  async studentSignin(@Body() data: StudentSigninDto) {
    return this.authService.studentSignin(data);
  }

  @Post('lecturer/signin')
  async lecturerSignin(@Body() data: LecturerSigninDto) {
    return this.authService.lecturerSignin(data);
  }
}
