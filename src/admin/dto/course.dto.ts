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

  @ValidateNested({ each: true })
  @Type(() => CreateCourseDocumentDto)
  courseDocuments: CreateCourseDocumentDto[];
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
