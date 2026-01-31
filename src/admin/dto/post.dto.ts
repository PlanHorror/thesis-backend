import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { PostType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Title of the post',
    example: 'Important Announcement',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'This is the content of the announcement...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Type of post',
    enum: PostType,
    example: 'NEWS',
  })
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @ApiPropertyOptional({
    description: 'Department ID the post belongs to',
    example: 'DEPT-CS-001',
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Thumbnail URL for the post',
    example: 'https://example.com/images/thumbnail.jpg',
  })
  @IsUrl()
  @IsOptional()
  thumbnail?: string;
}

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Title of the post',
    example: 'Updated Announcement',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Content of the post',
    example: 'This is the updated content...',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Type of post',
    enum: PostType,
    example: 'NEWS',
  })
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @ApiPropertyOptional({
    description: 'Department ID the post belongs to',
    example: 'DEPT-CS-001',
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Thumbnail URL for the post',
    example: 'https://example.com/images/thumbnail.jpg',
  })
  @IsUrl()
  @IsOptional()
  thumbnail?: string;
}
