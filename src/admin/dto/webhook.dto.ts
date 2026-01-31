import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebhookDto {
  @ApiProperty({
    description: 'Webhook URL endpoint',
    example: 'https://example.com/webhook/callback',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    description: 'Whether the webhook is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Student ID associated with the webhook',
    example: 'STU-2026-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Lecturer ID associated with the webhook',
    example: 'LEC-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lecturerId?: string;
}

export class UpdateWebhookDto {
  @ApiPropertyOptional({
    description: 'Webhook URL endpoint',
    example: 'https://example.com/webhook/callback',
  })
  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  url?: string;

  @ApiPropertyOptional({
    description: 'Whether the webhook is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Student ID associated with the webhook',
    example: 'STU-2026-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Lecturer ID associated with the webhook',
    example: 'LEC-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lecturerId?: string;
}
