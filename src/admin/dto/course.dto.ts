import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class CreateCourseDto {
  @ApiPropertyOptional({
    description: "Department ID the course belongs to",
    example: "DEPT-CS-001",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: "Name of the course",
    example: "Introduction to Programming",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: "Description of the course",
    example: "A beginner course covering programming fundamentals",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    description:
      "Recommended semester/level for the course (e.g. Year 1 Sem 1). Optional; distinct from offering (semesterId).",
    example: "Year 1 Sem 1",
  })
  @IsString()
  @IsOptional()
  recommendedSemester?: string;

  @ApiProperty({ description: "Number of credits for the course", example: 3 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  credits: number;

  @ApiPropertyOptional({
    description:
      "Semester ID to offer this course in. When provided, creates a course-semester so the course appears in the catalog immediately.",
    example: "clxx1234567890",
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  semesterId?: string;
}

/** Single course item for bulk create (no semesterId – offerings managed separately) */
export class CreateCourseBulkItemDto {
  @ApiProperty({ description: "Name of the course", example: "Calculus I" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Number of credits", example: 3 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  credits: number;

  @ApiPropertyOptional({
    description: "Department ID the course belongs to",
    example: "clxx1234567890",
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: "Recommended semester/level (e.g. Year 1 Sem 1)",
    example: "Year 1 Sem 1",
  })
  @IsString()
  @IsOptional()
  recommendedSemester?: string;

  @ApiPropertyOptional({
    description: "Course description",
    example: "Introduction to single-variable calculus",
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateMultipleCoursesDto {
  @ApiProperty({
    description: "Array of courses to create",
    type: [CreateCourseBulkItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateCourseBulkItemDto)
  courses: CreateCourseBulkItemDto[];
}

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: "Department ID the course belongs to",
    example: "DEPT-CS-001",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  departmentId: string;

  @ApiPropertyOptional({
    description: "Name of the course",
    example: "Introduction to Programming",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    description: "Description of the course",
    example: "A beginner course covering programming fundamentals",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    description:
      "Recommended semester/level for the course (optional). Distinct from offering (course-semester).",
    example: "Year 1 Sem 1",
  })
  @IsString()
  @IsOptional()
  recommendedSemester?: string;

  @ApiPropertyOptional({
    description: "Number of credits for the course",
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  credits: number;
}

export class CreateCourseDocumentDto {
  @ApiProperty({ description: "Document ID", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty({
    description: "Title of the document",
    example: "Lecture Notes Week 1",
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateCourseDocumentDto {
  @ApiProperty({ description: "Document ID", example: "doc-001" })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({
    description: "Title of the document",
    example: "Updated Lecture Notes Week 1",
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title: string;
}
