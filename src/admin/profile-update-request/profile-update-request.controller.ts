import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ProfileUpdateRequestStatus } from "@prisma/client";
import { IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "common";
import { RoleGuard } from "common/guard/role.guard";
import { ProfileUpdateRequestService } from "src/profile-update-request/profile-update-request.service";

class RejectProfileUpdateDto {
  @IsString()
  @IsOptional()
  @MinLength(10)
  reason?: string;
}

@ApiTags("Admin - Profile Update Requests")
@ApiBearerAuth("accessToken")
@UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.ADMIN]))
@Controller("admin/profile-update-request")
export class AdminProfileUpdateRequestController {
  constructor(
    private readonly profileUpdateRequestService: ProfileUpdateRequestService,
  ) {}

  @Get("all")
  @ApiOperation({ summary: "Get all profile update requests" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ProfileUpdateRequestStatus,
    description: "Filter by status",
  })
  @ApiResponse({
    status: 200,
    description: "List of profile update requests",
  })
  async getAll(@Query("status") status?: ProfileUpdateRequestStatus) {
    return this.profileUpdateRequestService.findAll(status);
  }

  @Patch("approve/:id")
  @ApiOperation({ summary: "Approve a profile update request" })
  @ApiParam({ name: "id", description: "Request ID" })
  @ApiResponse({ status: 200, description: "Request approved" })
  @ApiResponse({ status: 404, description: "Request not found" })
  async approve(@Param("id") id: string) {
    return this.profileUpdateRequestService.approve(id);
  }

  @Patch("reject/:id")
  @ApiOperation({ summary: "Reject a profile update request" })
  @ApiParam({ name: "id", description: "Request ID" })
  @ApiResponse({ status: 200, description: "Request rejected" })
  @ApiResponse({ status: 404, description: "Request not found" })
  async reject(@Param("id") id: string, @Body() body: RejectProfileUpdateDto) {
    return this.profileUpdateRequestService.reject(id, body.reason);
  }
}
