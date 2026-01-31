import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseEnrollmentDto {
  @ApiProperty({ description: 'Student ID to enroll', example: 'STU-2026-001' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Course on semester ID', example: 'COS-001' })
  @IsString()
  @IsNotEmpty()
  courseOnSemesterId: string;

  @ApiProperty({ description: 'Grade type 1 score', example: 8.5 })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType1: number;

  @ApiPropertyOptional({ description: 'Grade type 2 score', example: 7.5 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType2: number;

  @ApiPropertyOptional({ description: 'Grade type 3 score', example: 9.0 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType3: number;
}

export class UpdateCourseEnrollmentDto {
  @ApiPropertyOptional({ description: 'Student ID', example: 'STU-2026-001' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  studentId: string;

  @ApiPropertyOptional({
    description: 'Course on semester ID',
    example: 'COS-001',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  courseOnSemesterId: string;

  @ApiPropertyOptional({ description: 'Grade type 1 score', example: 8.5 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType1: number;

  @ApiPropertyOptional({ description: 'Grade type 2 score', example: 7.5 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType2: number;

  @ApiPropertyOptional({ description: 'Grade type 3 score', example: 9.0 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType3: number;
}
