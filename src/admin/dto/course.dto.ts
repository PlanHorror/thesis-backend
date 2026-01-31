import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiPropertyOptional({
    description: 'Department ID the course belongs to',
    example: 'DEPT-CS-001',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: 'Name of the course',
    example: 'Introduction to Programming',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the course',
    example: 'A beginner course covering programming fundamentals',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Semester ID for the course',
    example: 'SEM-2026-01',
  })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: 'Number of credits for the course', example: 3 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  credits: number;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'Department ID the course belongs to',
    example: 'DEPT-CS-001',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  departmentId: string;

  @ApiPropertyOptional({
    description: 'Name of the course',
    example: 'Introduction to Programming',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the course',
    example: 'A beginner course covering programming fundamentals',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    description: 'Semester ID for the course',
    example: 'SEM-2026-01',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  semester: string;

  @ApiPropertyOptional({
    description: 'Number of credits for the course',
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  credits: number;
}

export class CreateCourseDocumentDto {
  @ApiProperty({ description: 'Document ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty({
    description: 'Title of the document',
    example: 'Lecture Notes Week 1',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateCourseDocumentDto {
  @ApiProperty({ description: 'Document ID', example: 'doc-001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({
    description: 'Title of the document',
    example: 'Updated Lecture Notes Week 1',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title: string;
}
