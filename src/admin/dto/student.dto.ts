import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateIf,
  ValidateNested,
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
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  gender: boolean;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  citizenId: string;

  @IsPhoneNumber('VN')
  @IsOptional()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;
}

export class CreateMultipleStudentsDto {
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[];
}

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  departmentId: string;

  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ValidateIf((o) => o.oldPassword)
  newPassword: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ValidateIf((o) => o.oldPassword)
  confirmPassword: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  gender: boolean;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  citizenId: string;

  @IsPhoneNumber('VN')
  @IsOptional()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;

  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  active: boolean;
}

export class StudentUpdateAccountDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  gender: boolean;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  citizenId: string;

  @IsPhoneNumber('VN')
  @IsOptional()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password: string;
}
