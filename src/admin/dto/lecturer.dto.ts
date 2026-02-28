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

export class CreateLecturerDto {
  @ApiProperty({ description: "Unique lecturer ID", example: "LEC-001" })
  @IsNotEmpty()
  @IsString()
  lecturerId: string;

  @ApiProperty({
    description: "Lecturer email address",
    example: "lecturer@university.edu",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Lecturer username for login",
    example: "prof_smith",
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: "Lecturer password", example: "SecurePass123!" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: "Full name of the lecturer",
    example: "Prof. John Smith",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @ApiPropertyOptional({
    description: "Gender of the lecturer (true = male, false = female)",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  gender: boolean;

  @ApiPropertyOptional({
    description: "Birth date in ISO format",
    example: "1980-05-20",
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

export class CreateMultipleLecturersDto {
  @ApiProperty({
    description: "Array of lecturers to create",
    type: [CreateLecturerDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateLecturerDto)
  lecturers: CreateLecturerDto[];
}

export class UpdateLecturerDto {
  @ApiPropertyOptional({
    description: "Lecturer email address",
    example: "lecturer@university.edu",
  })
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({
    description: "Lecturer username for login",
    example: "prof_smith",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @ApiPropertyOptional({
    description: "Unique lecturer ID",
    example: "LEC-001",
  })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  lecturerId: string;

  @ApiPropertyOptional({
    description: "New password for the lecturer",
    example: "NewSecurePass123!",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  newPassword: string;

  @ApiPropertyOptional({
    description: "Confirm new password",
    example: "NewSecurePass123!",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ValidateIf((o) => o.newPassword)
  confirmPassword: string;

  @ApiPropertyOptional({
    description: "Full name of the lecturer",
    example: "Prof. John Smith",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @ApiPropertyOptional({
    description: "Whether the lecturer account is active",
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isActive: boolean;

  @ApiPropertyOptional({
    description:
      "ID of the department this lecturer heads (set to null to unassign)",
    example: "clxx123456789",
  })
  @IsString()
  @IsOptional()
  departmentHeadId: string | null;
}

export class LecturerUpdateAccountDto {
  @ApiPropertyOptional({
    description: "Lecturer username for login",
    example: "prof_smith",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @ApiPropertyOptional({
    description: "Full name of the lecturer",
    example: "Prof. John Smith",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @ApiPropertyOptional({
    description: "Current password for verification",
    example: "OldPass123!",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  oldPassword: string;

  @ApiPropertyOptional({
    description: "New password",
    example: "NewSecurePass123!",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password: string;
}
