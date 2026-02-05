import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Lecturer } from "@prisma/client";
import { GetUser, Role, RoleGuard } from "common";
import { CreateLecturerTeachingRequestDto } from "./dto/create-lecturer-teaching-request.dto";
import { RequestService } from "./request.service";

@ApiTags("Requests (Lecturer)")
@ApiBearerAuth("accessToken")
@UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
@Controller("request/lecturer")
export class LecturerRequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post("teaching")
  @ApiOperation({ summary: "Request to teach a course-semester" })
  @ApiBody({ type: CreateLecturerTeachingRequestDto })
  @ApiResponse({ status: 201, description: "Request created" })
  @ApiResponse({
    status: 400,
    description: "Bad request (e.g. semester not started)",
  })
  @ApiResponse({
    status: 409,
    description: "Conflict (e.g. already requested or schedule conflict)",
  })
  async createTeachingRequest(
    @GetUser() lecturer: Lecturer,
    @Body() dto: CreateLecturerTeachingRequestDto,
  ) {
    return this.requestService.createLecturerTeachingRequest(
      lecturer.id,
      dto.courseOnSemesterId,
    );
  }

  @Get("teaching")
  @ApiOperation({ summary: "Get my teaching requests" })
  @ApiResponse({ status: 200, description: "List of my teaching requests" })
  async getMyTeachingRequests(@GetUser() lecturer: Lecturer) {
    return this.requestService.findMyLecturerTeachingRequests(lecturer.id);
  }
}
