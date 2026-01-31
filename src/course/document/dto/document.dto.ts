import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Title of the document',
    example: 'Lecture Notes Week 1',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Course on semester ID', example: 'COS-001' })
  @IsString()
  @IsNotEmpty()
  courseOnSemesterId: string;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({
    description: 'Title of the document',
    example: 'Updated Lecture Notes Week 1',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title: string;
}
