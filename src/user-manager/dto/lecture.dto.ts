import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LecturerUpdateAccountDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password: string;
}
