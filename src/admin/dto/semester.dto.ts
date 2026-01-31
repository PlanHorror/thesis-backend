import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsLaterTime } from 'common';
import { CreateCourseDocumentDto, UpdateCourseDocumentDto } from './course.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSemesterDto {
  @ApiProperty({ description: 'Name of the semester', example: 'Spring 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Start date of the semester',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'End date of the semester',
    example: '2026-05-30T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class UpdateSemesterDto {
  @ApiPropertyOptional({
    description: 'Name of the semester',
    example: 'Spring 2026',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Start date of the semester',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate: Date;

  @ApiPropertyOptional({
    description: 'End date of the semester',
    example: '2026-05-30T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate: Date;
}

export class CourseOnSemesterDto {
  @ApiProperty({ description: 'Course ID', example: 'CRS-001' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Semester ID', example: 'SEM-2026-01' })
  @IsString()
  @IsNotEmpty()
  semesterId: string;

  @ApiProperty({
    description: 'Lecturer ID teaching the course',
    example: 'LEC-001',
  })
  @IsString()
  @IsNotEmpty()
  lecturerId: string;

  @ApiProperty({
    description: 'Day of week (1=Monday, 6=Saturday)',
    example: 1,
    minimum: 1,
    maximum: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  @Max(6)
  @Min(1)
  @Type(() => Number)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time in minutes from midnight (0-1439)',
    example: 480,
    minimum: 0,
    maximum: 1439,
  })
  @IsNumber()
  @IsNotEmpty()
  @Max(1439)
  @Min(0)
  @Type(() => Number)
  startTime: number;

  @ApiProperty({
    description: 'End time in minutes from midnight (0-1439)',
    example: 570,
    minimum: 0,
    maximum: 1439,
  })
  @IsNumber()
  @IsNotEmpty()
  @Max(1439)
  @Min(0)
  @Type(() => Number)
  @IsLaterTime('startTime', { message: 'endTime must be later than startTime' })
  endTime: number;

  @ApiPropertyOptional({
    description: 'Location of the class',
    example: 'Room A101',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({
    description: 'Course documents to create',
    type: [CreateCourseDocumentDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateCourseDocumentDto)
  @IsOptional()
  courseDocuments: CreateCourseDocumentDto[];

  @ApiPropertyOptional({
    description: 'New documents to create',
    type: [CreateCourseDocumentDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateCourseDocumentDto)
  @IsOptional()
  createDocuments: CreateCourseDocumentDto[];

  @ApiPropertyOptional({
    description: 'Documents to update',
    type: [UpdateCourseDocumentDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateCourseDocumentDto)
  @IsOptional()
  updateDocuments: UpdateCourseDocumentDto[];

  @ApiPropertyOptional({
    description: 'Document IDs to delete',
    example: ['doc-001', 'doc-002'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deleteDocumentIds: string[];
}
