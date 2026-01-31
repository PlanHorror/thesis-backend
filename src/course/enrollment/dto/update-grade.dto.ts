import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGradeDto {
  @ApiPropertyOptional({
    description: 'Grade type 1 score (0-10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  gradeType1?: number;

  @ApiPropertyOptional({
    description: 'Grade type 2 score (0-10)',
    example: 7.5,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  gradeType2?: number;

  @ApiPropertyOptional({
    description: 'Grade type 3 score (0-10)',
    example: 9.0,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  gradeType3?: number;
}
