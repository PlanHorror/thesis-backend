import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AdminRegisterDto,
  LecturerSigninDto,
  SigninDto,
  StudentSigninDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/signup')
  @ApiOperation({ summary: 'Register a new admin account' })
  @ApiBody({ type: AdminRegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Admin account created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - passwords do not match or invalid data',
  })
  async adminSignup(@Body() data: AdminRegisterDto) {
    return this.authService.adminSignup(data);
  }

  @Post('admin/signin')
  @ApiOperation({ summary: 'Admin sign in' })
  @ApiBody({ type: SigninDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    schema: { properties: { accessToken: { type: 'string' } } },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async adminSignin(@Body() data: SigninDto) {
    return this.authService.adminSignin(data);
  }

  @Post('student/signin')
  @ApiOperation({ summary: 'Student sign in with studentId or username' })
  @ApiBody({ type: StudentSigninDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    schema: { properties: { accessToken: { type: 'string' } } },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async studentSignin(@Body() data: StudentSigninDto) {
    return this.authService.studentSignin(data);
  }

  @Post('lecturer/signin')
  @ApiOperation({ summary: 'Lecturer sign in with lecturerId or username' })
  @ApiBody({ type: LecturerSigninDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    schema: { properties: { accessToken: { type: 'string' } } },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async lecturerSignin(@Body() data: LecturerSigninDto) {
    return this.authService.lecturerSignin(data);
  }
}
