import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateLecturerDto {
  @IsNotEmpty()
  @IsString()
  lecturerId: string;

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
  @IsOptional()
  fullName: string;
}

export class CreateMultipleLecturersDto {
  @ValidateNested({ each: true })
  @Type(() => CreateLecturerDto)
  lecturers: CreateLecturerDto[];
}

export class UpdateLecturerDto {
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  lecturerId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ValidateIf((o) => o.newPassword)
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isActive: boolean;
}

export class LecturerUpdateAccountDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password: string;
}
