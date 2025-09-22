import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLecturerDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;
}
