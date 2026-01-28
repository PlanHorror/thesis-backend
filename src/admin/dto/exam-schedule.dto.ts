import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDate } from 'class-validator';

export class CreateExamScheduleDto {
  @IsString()
  courseOnSemesterId: string;

  @IsOptional()
  @IsString()
  examDate?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateExamScheduleDto {
  @IsOptional()
  @IsString()
  courseOnSemesterId?: string;

  @IsOptional()
  @IsString()
  examDate?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateMultipleExamSchedulesDto {
  @Type(() => CreateExamScheduleDto)
  examSchedules: CreateExamScheduleDto[];
}
