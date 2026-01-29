import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  secret?: string;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lecturerId?: string;
}

export class UpdateWebhookDto {
  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  secret?: string;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lecturerId?: string;
}
