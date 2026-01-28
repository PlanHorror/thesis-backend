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

export class CreateCourseDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  semester: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  credits: number;
}

export class UpdateCourseDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  semester: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  credits: number;
}

export class CreateCourseDocumentDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateCourseDocumentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title: string;
}
