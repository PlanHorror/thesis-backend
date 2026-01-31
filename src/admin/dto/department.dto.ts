import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Name of the department',
    example: 'Computer Science',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique department ID', example: 'DEPT-CS-001' })
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @ApiPropertyOptional({
    description: 'Description of the department',
    example: 'Department of Computer Science and Engineering',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'ID of the department head (lecturer)',
    example: 'LEC-001',
  })
  @IsString()
  @IsNotEmpty()
  headId: string;
}

export class CreateMultipleDepartmentsDto {
  @ApiProperty({
    description: 'Array of departments to create',
    type: [CreateDepartmentDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateDepartmentDto)
  departments: CreateDepartmentDto[];
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Unique department ID',
    example: 'DEPT-CS-001',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  departmentId: string;

  @ApiPropertyOptional({
    description: 'Name of the department',
    example: 'Computer Science',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the department',
    example: 'Department of Computer Science and Engineering',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    description: 'ID of the department head (lecturer)',
    example: 'LEC-001',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  headId: string;
}
