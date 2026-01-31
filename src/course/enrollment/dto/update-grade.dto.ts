import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateGradeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  gradeType1?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  gradeType2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  gradeType3?: number;
}
