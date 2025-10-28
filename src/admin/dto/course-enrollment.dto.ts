import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  courseOnSemesterId: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType1: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType2: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType3: number;
}

export class UpdateCourseEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  studentId: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  courseOnSemesterId: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType1: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType2: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gradeType3: number;
}
