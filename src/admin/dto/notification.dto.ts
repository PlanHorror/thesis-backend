import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  isURL,
  IsUrl,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUrl()
  @IsNotEmpty()
  @IsOptional()
  url?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lecturerId?: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lecturerId?: string;
}
