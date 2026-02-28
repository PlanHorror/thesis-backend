import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Lecturer, Student } from "@prisma/client";
import { GetUser, Role, RoleGuard } from "common";
import { CreateProfileUpdateRequestDto } from "./dto/create-profile-update-request.dto";
import { ProfileUpdateRequestService } from "./profile-update-request.service";

@ApiTags("Profile Update Request")
@ApiBearerAuth("accessToken")
@UseGuards(
  AuthGuard("accessToken"),
  new RoleGuard([Role.STUDENT, Role.LECTURER]),
)
@Controller("profile-update-request")
export class ProfileUpdateRequestController {
  constructor(
    private readonly profileUpdateRequestService: ProfileUpdateRequestService,
  ) {}

  @Get("cooldown")
  @ApiOperation({
    summary: "Get profile change cooldown status",
  })
  @ApiResponse({
    status: 200,
    description: "Cooldown status",
    schema: {
      type: "object",
      properties: {
        canUpdateProfile: { type: "boolean" },
        profileChangeCooldownUntil: {
          type: "string",
          format: "date-time",
          nullable: true,
        },
      },
    },
  })
  async getCooldown(@GetUser() user: Student | Lecturer) {
    const role = "studentId" in user ? "student" : "lecturer";
    const until =
      await this.profileUpdateRequestService.getProfileChangeCooldownUntil(
        user.id,
        role,
      );
    return {
      canUpdateProfile: !until,
      profileChangeCooldownUntil: until?.toISOString() ?? null,
    };
  }

  @Post()
  @ApiOperation({
    summary: "Create a profile update request (student or lecturer)",
  })
  @ApiBody({ type: CreateProfileUpdateRequestDto })
  @ApiResponse({ status: 201, description: "Request created" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async create(
    @GetUser() user: Student | Lecturer,
    @Body() dto: CreateProfileUpdateRequestDto,
  ) {
    const role = "studentId" in user ? "student" : "lecturer";
    return this.profileUpdateRequestService.create(
      user.id,
      role,
      dto.requestedData,
    );
  }
}
