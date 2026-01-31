import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentSessionDto {
  @ApiPropertyOptional({
    description: 'Name of the enrollment session',
    example: 'Spring 2026 Enrollment',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Semester ID for the enrollment session',
    example: 'SEM-2026-01',
  })
  @IsString()
  @IsNotEmpty()
  semesterId: string;

  @ApiProperty({
    description: 'Start date of enrollment period',
    example: '2026-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date of enrollment period',
    example: '2026-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Whether the enrollment session is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEnrollmentSessionDto {
  @ApiPropertyOptional({
    description: 'Name of the enrollment session',
    example: 'Spring 2026 Enrollment',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Semester ID for the enrollment session',
    example: 'SEM-2026-01',
  })
  @IsOptional()
  @IsString()
  semesterId?: string;

  @ApiPropertyOptional({
    description: 'Start date of enrollment period',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date of enrollment period',
    example: '2026-01-15',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the enrollment session is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateMultipleEnrollmentSessionsDto {
  @ApiProperty({
    description: 'Array of enrollment sessions to create',
    type: [CreateEnrollmentSessionDto],
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateEnrollmentSessionDto)
  sessions: CreateEnrollmentSessionDto[];
}
