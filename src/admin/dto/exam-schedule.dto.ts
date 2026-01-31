import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamScheduleDto {
  @ApiProperty({ description: 'Course on semester ID', example: 'COS-001' })
  @IsString()
  courseOnSemesterId: string;

  @ApiPropertyOptional({
    description: 'Exam date in string format',
    example: '2026-05-15',
  })
  @IsOptional()
  @IsString()
  examDate?: string;

  @ApiPropertyOptional({
    description: 'Start time of the exam',
    example: '2026-05-15T09:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;

  @ApiPropertyOptional({
    description: 'End time of the exam',
    example: '2026-05-15T11:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @ApiPropertyOptional({
    description: 'Location of the exam',
    example: 'Exam Hall A',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Description or notes about the exam',
    example: 'Final exam - bring calculator',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateExamScheduleDto {
  @ApiPropertyOptional({
    description: 'Course on semester ID',
    example: 'COS-001',
  })
  @IsOptional()
  @IsString()
  courseOnSemesterId?: string;

  @ApiPropertyOptional({
    description: 'Exam date in string format',
    example: '2026-05-15',
  })
  @IsOptional()
  @IsString()
  examDate?: string;

  @ApiPropertyOptional({
    description: 'Start time of the exam',
    example: '2026-05-15T09:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;

  @ApiPropertyOptional({
    description: 'End time of the exam',
    example: '2026-05-15T11:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @ApiPropertyOptional({
    description: 'Location of the exam',
    example: 'Exam Hall A',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Description or notes about the exam',
    example: 'Final exam - bring calculator',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateMultipleExamSchedulesDto {
  @ApiProperty({
    description: 'Array of exam schedules to create',
    type: [CreateExamScheduleDto],
  })
  @Type(() => CreateExamScheduleDto)
  examSchedules: CreateExamScheduleDto[];
}
