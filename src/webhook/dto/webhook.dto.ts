import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateWebhookBodyDto {
  @ApiProperty({
    description: 'Webhook URL to receive notifications',
    example: 'https://example.com/webhook',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    description: 'Whether the webhook is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateWebhookBodyDto {
  @ApiPropertyOptional({
    description: 'Webhook URL to receive notifications',
    example: 'https://example.com/webhook',
  })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Whether the webhook is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
