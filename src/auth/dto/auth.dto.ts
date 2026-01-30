import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class StudentSigninDto {
  @ValidateIf((o) => !o.username)
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @ValidateIf((o) => !o.studentId)
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LecturerSigninDto {
  @ValidateIf((o) => !o.username)
  @IsString()
  @IsNotEmpty()
  lecturerId?: string;

  @ValidateIf((o) => !o.lecturerId)
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AdminRegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
