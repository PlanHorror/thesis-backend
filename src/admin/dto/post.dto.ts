import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { PostType } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsUrl()
  @IsOptional()
  thumbnail?: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsUrl()
  @IsOptional()
  thumbnail?: string;
}
