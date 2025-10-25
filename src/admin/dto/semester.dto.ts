import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { IsLaterTime } from 'common';

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

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format',
  })
  @IsLaterTime('startTime', { message: 'endTime must be later than startTime' })
  endTime: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  location: string;
}
