import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Admin username',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Confirm password - must match password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class UpdateAdminDto {
  @ApiPropertyOptional({
    description: 'New admin username',
    example: 'new_admin',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @ApiPropertyOptional({
    description: 'New password',
    example: 'newpassword123',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  newPassword: string;

  @ApiPropertyOptional({
    description: 'Confirm new password - required if newPassword is provided',
    example: 'newpassword123',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ValidateIf((o) => o.newPassword)
  confirmPassword: string;

  @ApiPropertyOptional({
    description: 'Whether the admin account is active',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isActive: boolean;
}
