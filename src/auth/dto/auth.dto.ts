import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class SigninDto {
  @ApiProperty({ description: 'Username for authentication', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class StudentSigninDto {
  @ApiPropertyOptional({
    description: 'Student ID (required if username is not provided)',
    example: 'STU001',
  })
  @ValidateIf((o) => !o.username)
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Username (required if studentId is not provided)',
    example: 'john.doe',
  })
  @ValidateIf((o) => !o.studentId)
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LecturerSigninDto {
  @ApiPropertyOptional({
    description: 'Lecturer ID (required if username is not provided)',
    example: 'LEC001',
  })
  @ValidateIf((o) => !o.username)
  @IsString()
  @IsNotEmpty()
  lecturerId?: string;

  @ApiPropertyOptional({
    description: 'Username (required if lecturerId is not provided)',
    example: 'jane.smith',
  })
  @ValidateIf((o) => !o.lecturerId)
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AdminRegisterDto {
  @ApiProperty({ description: 'Admin username', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Admin password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Confirm password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
