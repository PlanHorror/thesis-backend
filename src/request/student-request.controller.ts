import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Student } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { GetUser, Role, RoleGuard } from "common";
import { RequestService } from "./request.service";

class CreateWithdrawalRequestDto {
  @IsString()
  @IsNotEmpty()
  courseOnSemesterId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsOptional()
  details?: string;
}

@ApiTags("Requests (Student)")
@ApiBearerAuth("accessToken")
@UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
@Controller("request/student")
export class StudentRequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post("withdrawal")
  @ApiOperation({ summary: "Request to withdraw from a course" })
  @ApiBody({ type: CreateWithdrawalRequestDto })
  @ApiResponse({ status: 201, description: "Withdrawal request created" })
  async createWithdrawalRequest(
    @GetUser() student: Student,
    @Body() dto: CreateWithdrawalRequestDto,
  ) {
    return this.requestService.createCourseWithdrawalRequest(
      student.id,
      dto.courseOnSemesterId,
      dto.reason,
      dto.details,
    );
  }

  @Get("withdrawal/:id")
  @ApiOperation({ summary: "Get a single withdrawal request (current student)" })
  @ApiResponse({ status: 200, description: "Withdrawal request" })
  getWithdrawalRequest(
    @GetUser() student: Student,
    @Param("id") id: string,
  ) {
    return this.requestService.findStudentWithdrawalRequestById(
      student.id,
      id,
    );
  }
}
