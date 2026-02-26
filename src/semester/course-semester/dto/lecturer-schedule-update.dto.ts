import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, IsUrl, ValidateIf } from "class-validator";

/**
 * DTO for lecturers to update meeting link and session details for their course-semester.
 * Lecturers can only update these fields; day/time and capacity remain admin-only.
 */
export class LecturerScheduleUpdateDto {
  @ApiPropertyOptional({
    description: "Schedule mode: ONLINE, ON_CAMPUS, or HYBRID",
    enum: ["ONLINE", "ON_CAMPUS", "HYBRID"],
  })
  @IsOptional()
  @IsIn(["ONLINE", "ON_CAMPUS", "HYBRID"])
  mode?: "ONLINE" | "ON_CAMPUS" | "HYBRID";

  @ApiPropertyOptional({
    description: "Location (room/building for on-campus)",
    example: "Room A101",
  })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiPropertyOptional({
    description:
      "Meeting URL for online/hybrid sessions (e.g. Google Meet, Zoom). Omit or send null to clear.",
    example: "https://meet.google.com/xxx-xxxx-xxx",
  })
  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== "")
  @IsUrl()
  meetingUrl?: string | null;
}
