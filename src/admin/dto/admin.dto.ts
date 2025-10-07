import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class UpdateAdminDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ValidateIf((o) => o.newPassword)
  confirmPassword: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isActive: boolean;
}
