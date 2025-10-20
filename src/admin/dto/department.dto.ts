import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  headId: string;
}

export class CreateMultipleDepartmentsDto {
  @ValidateNested({ each: true })
  @Type(() => CreateDepartmentDto)
  departments: CreateDepartmentDto[];
}

export class UpdateDepartmentDto {
  @IsNotEmpty()
  @IsString()
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
  headId: string;
}
