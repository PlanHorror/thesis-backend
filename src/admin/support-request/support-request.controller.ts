import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Role, RoleGuard } from "common";
import { SupportRequestService } from "src/support-request/support-request.service";

@ApiTags("Admin - Support Requests")
@ApiBearerAuth("accessToken")
@UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.ADMIN]))
@Controller("admin/support-request")
export class AdminSupportRequestController {
  constructor(private readonly supportRequestService: SupportRequestService) {}

  @Get("all")
  @ApiOperation({ summary: "Get all support requests" })
  @ApiResponse({ status: 200, description: "List of support requests" })
  async getAll() {
    return this.supportRequestService.findAll();
  }
}
