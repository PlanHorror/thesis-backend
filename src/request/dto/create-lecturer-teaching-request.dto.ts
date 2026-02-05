import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateLecturerTeachingRequestDto {
  @ApiProperty({ description: "Course-semester ID to request teaching" })
  @IsString()
  @IsNotEmpty()
  courseOnSemesterId: string;
}
