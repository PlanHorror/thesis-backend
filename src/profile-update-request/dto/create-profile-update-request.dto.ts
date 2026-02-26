import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";

export class CreateProfileUpdateRequestDto {
  @ApiProperty({
    description:
      "Requested profile data (fullName, phone, address, gender, birthDate, citizenId)",
    example: { fullName: "John Doe", phone: "+84123456789" },
  })
  @IsObject()
  requestedData: Record<string, unknown>;

  @ApiPropertyOptional({
    description: "Role of the requester",
    example: "student",
  })
  @IsOptional()
  @IsString()
  role?: string;
}
