import { IsIn, IsOptional, IsString } from "class-validator";

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn([
    "schedule_insights",
    "schedule_optimizer",
    "general",
    "academic_advisor",
    "course_analytics",
  ])
  preset?:
    | "schedule_insights"
    | "schedule_optimizer"
    | "general"
    | "academic_advisor"
    | "course_analytics";
}
