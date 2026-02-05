import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
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
} from "class-validator";

export class CreateStudentDto {
  @ApiProperty({
    description: "Department ID the student belongs to",
    example: "dept-001",
  })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: "Student email address",
    example: "student@university.edu",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Student username for login",
    example: "john_doe",
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: "Student password", example: "SecurePass123!" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: "Unique student ID", example: "STU-2026-001" })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({
    description: "Full name of the student",
    example: "John Doe",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: "Gender of the student (true = male, false = female)",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  gender: boolean;

  @ApiPropertyOptional({
    description: "Birth date in ISO format",
    example: "2000-01-15",
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  @IsNotEmpty()
  birthDate: string;

  @ApiPropertyOptional({
    description: "Citizen ID number",
    example: "123456789012",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  citizenId: string;

  @ApiPropertyOptional({
    description: "Phone number (Vietnam format)",
    example: "0901234567",
  })
  @IsPhoneNumber("VN")
  @IsOptional()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: "Home address",
    example: "123 Main Street, District 1, Ho Chi Minh City",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;
}

export class CreateMultipleStudentsDto {
  @ApiProperty({
    description: "Array of students to create",
    type: [CreateStudentDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[];
}

export class UpdateStudentDto {
  @ApiPropertyOptional({
    description: "Department ID the student belongs to",
    example: "dept-001",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  departmentId: string;

  @ApiPropertyOptional({
    description: "Student email address",
    example: "student@university.edu",
  })
  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: "Student username for login",
    example: "john_doe",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    description: "New password for the student",
    example: "NewSecurePass123!",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ValidateIf((o) => o.oldPassword)
  newPassword: string;

  @ApiPropertyOptional({
    description: "Confirm new password",
    example: "NewSecurePass123!",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ValidateIf((o) => o.oldPassword)
  confirmPassword: string;

  @ApiPropertyOptional({
    description: "Unique student ID",
    example: "STU-2026-001",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({
    description: "Full name of the student",
    example: "John Doe",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: "Gender of the student (true = male, false = female)",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  gender: boolean;

  @ApiPropertyOptional({
    description: "Birth date in ISO format",
    example: "2000-01-15",
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  @IsNotEmpty()
  birthDate: string;

  @ApiPropertyOptional({
    description: "Citizen ID number",
    example: "123456789012",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  citizenId: string;

  @ApiPropertyOptional({
    description: "Phone number (Vietnam format)",
    example: "0901234567",
  })
  @IsPhoneNumber("VN")
  @IsOptional()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: "Home address",
    example: "123 Main Street, District 1, Ho Chi Minh City",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description: "Whether the student account is active",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  active: boolean;
}

export class StudentUpdateAccountDto {
  @ApiPropertyOptional({
    description: "Student username for login",
    example: "john_doe",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    description: "Full name of the student",
    example: "John Doe",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: "Gender of the student (true = male, false = female)",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  gender: boolean;

  @ApiPropertyOptional({
    description: "Birth date in ISO format",
    example: "2000-01-15",
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  @IsNotEmpty()
  birthDate: string;

  @ApiPropertyOptional({
    description: "Citizen ID number",
    example: "123456789012",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  citizenId: string;

  @ApiPropertyOptional({
    description: "Phone number (Vietnam format)",
    example: "0901234567",
  })
  @IsPhoneNumber("VN")
  @IsOptional()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: "Home address",
    example: "123 Main Street, District 1, Ho Chi Minh City",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description: "Current password for verification",
    example: "OldPass123!",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  oldPassword: string;

  @ApiPropertyOptional({
    description: "New password",
    example: "NewSecurePass123!",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password: string;
}
