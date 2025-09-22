import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  gender: boolean;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsNotEmpty()
  @IsOptional()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  citizenId: string;

  @IsPhoneNumber('VN')
  @IsNotEmpty()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address: string;
}

export class UpdateStudentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  departmentId: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ValidateIf((o) => o.oldPassword)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ValidateIf((o) => o.oldPassword)
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  gender: boolean;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsNotEmpty()
  @IsOptional()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  citizenId: string;

  @IsPhoneNumber('VN')
  @IsNotEmpty()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  active: boolean;
}
