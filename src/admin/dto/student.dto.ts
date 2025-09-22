import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
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
