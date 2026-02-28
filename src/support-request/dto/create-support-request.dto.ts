import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateSupportRequestDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "student",
    enum: ["student", "lecturer", "admin", "other"],
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    example: "account",
    enum: [
      "login",
      "enrollment",
      "grades",
      "schedule",
      "technical",
      "account",
      "other",
    ],
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: "Cannot reset password" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject: string;

  @ApiProperty({ example: "I need help with..." })
  @IsString()
  @MinLength(10)
  message: string;

  @ApiPropertyOptional({ description: "User ID if authenticated" })
  @IsOptional()
  @IsString()
  userId?: string;
}
