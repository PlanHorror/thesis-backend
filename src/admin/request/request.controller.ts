import {
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
import { LecturerTeachingRequestStatus } from "@prisma/client";
import { Role } from "common";
import { RoleGuard } from "common/guard/role.guard";
import { RequestService } from "src/request/request.service";

@ApiTags("Admin - Requests")
@ApiBearerAuth("accessToken")
@UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.ADMIN]))
@Controller("admin/request")
export class AdminRequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get("lecturer/all")
  @ApiOperation({ summary: "Get all lecturer teaching requests" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: LecturerTeachingRequestStatus,
    description: "Filter by status",
  })
  @ApiResponse({
    status: 200,
    description: "List of lecturer teaching requests",
  })
  async getAllLecturerRequests(
    @Query("status") status?: LecturerTeachingRequestStatus,
  ) {
    return this.requestService.findAllLecturerTeachingRequests(status);
  }

  @Patch("lecturer/approve/:id")
  @ApiOperation({ summary: "Approve a lecturer teaching request" })
  @ApiParam({ name: "id", description: "Request ID" })
  @ApiResponse({ status: 200, description: "Request approved" })
  @ApiResponse({ status: 404, description: "Request not found" })
  async approveLecturerRequest(@Param("id") id: string) {
    return this.requestService.approveLecturerTeachingRequest(id);
  }

  @Patch("lecturer/reject/:id")
  @ApiOperation({ summary: "Reject a lecturer teaching request" })
  @ApiParam({ name: "id", description: "Request ID" })
  @ApiResponse({ status: 200, description: "Request rejected" })
  @ApiResponse({ status: 404, description: "Request not found" })
  async rejectLecturerRequest(@Param("id") id: string) {
    return this.requestService.rejectLecturerTeachingRequest(id);
  }
}
