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

export class CreateSemesterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class UpdateSemesterDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate: Date;
}

export class CourseOnSemesterDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  semesterId: string;

  @IsString()
  @IsNotEmpty()
  lecturerId: string;

  @IsNumber()
  @IsNotEmpty()
  @Max(6)
  @Min(1)
  @Type(() => Number)
  dayOfWeek: number;

  @IsNumber()
  @IsNotEmpty()
  @Max(1439)
  @Min(0)
  @Type(() => Number)
  startTime: number;

  @IsNumber()
  @IsNotEmpty()
  @Max(1439)
  @Min(0)
  @Type(() => Number)
  @IsLaterTime('startTime', { message: 'endTime must be later than startTime' })
  endTime: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  location: string;

  @ValidateNested({ each: true })
  @Type(() => CreateCourseDocumentDto)
  @IsOptional()
  courseDocuments: CreateCourseDocumentDto[];

  @ValidateNested({ each: true })
  @Type(() => CreateCourseDocumentDto)
  @IsOptional()
  createDocuments: CreateCourseDocumentDto[];

  @ValidateNested({ each: true })
  @Type(() => UpdateCourseDocumentDto)
  @IsOptional()
  updateDocuments: UpdateCourseDocumentDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deleteDocumentIds: string[];
}
