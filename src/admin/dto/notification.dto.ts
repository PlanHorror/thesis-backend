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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Title of the notification',
    example: 'New Assignment Posted',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Message content of the notification',
    example: 'A new assignment has been posted for your course.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'URL link for the notification',
    example: 'https://example.com/assignment/1',
  })
  @IsUrl()
  @IsNotEmpty()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Type of notification',
    enum: NotificationType,
    example: 'SYSTEM',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Student ID to send notification to',
    example: 'STU-2026-001',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Lecturer ID to send notification to',
    example: 'LEC-001',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lecturerId?: string;
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    description: 'Title of the notification',
    example: 'Updated Assignment',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Message content of the notification',
    example: 'Assignment details have been updated.',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Type of notification',
    enum: NotificationType,
    example: 'SYSTEM',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Whether the notification has been read',
    example: true,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    description: 'Student ID associated with the notification',
    example: 'STU-2026-001',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Lecturer ID associated with the notification',
    example: 'LEC-001',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lecturerId?: string;
}
