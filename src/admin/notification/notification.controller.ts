import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "common";
import { RoleGuard } from "common/guard/role.guard";
import { AdminService } from "src/admin/admin.service";
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from "src/admin/dto/notification.dto";

@ApiTags("Admin - Notifications")
@ApiBearerAuth("accessToken")
@UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.ADMIN]))
@Controller("admin/notification")
export class NotificationController {
  constructor(private readonly adminService: AdminService) {}

  @Get("all")
  @ApiOperation({ summary: "Get all notifications" })
  @ApiResponse({
    status: 200,
    description: "List of all notifications retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getAllNotifications() {
    return this.adminService.getAllNotificationsService();
  }

  @Get("admin-broadcast")
  @ApiOperation({
    summary: "Get admin broadcast notifications (for admin bell)",
  })
  @ApiResponse({
    status: 200,
    description: "List of admin broadcast notifications",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getAdminBroadcastNotifications() {
    return this.adminService.getAdminBroadcastNotificationsService();
  }

  @Patch("admin-broadcast/read")
  @ApiOperation({ summary: "Mark all admin broadcast notifications as read" })
  @ApiResponse({
    status: 200,
    description: "Notifications marked as read",
  })
  async markAllAdminBroadcastAsRead() {
    return this.adminService.markAdminBroadcastAsReadService();
  }

  @Patch("admin-broadcast/:id/read")
  @ApiOperation({ summary: "Mark an admin broadcast notification as read" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read",
  })
  async markAdminBroadcastAsReadById(@Param("id") id: string) {
    return this.adminService.markAdminBroadcastAsReadService(id);
  }

  @Get("user")
  @ApiOperation({ summary: "Get notifications by user" })
  @ApiQuery({
    name: "lecturerId",
    required: false,
    description: "Filter by lecturer ID",
    type: String,
  })
  @ApiQuery({
    name: "studentId",
    required: false,
    description: "Filter by student ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async getNotificationsByUser(
    @Query("lecturerId") lecturerId?: string,
    @Query("studentId") studentId?: string,
  ) {
    return this.adminService.getNotificationsByUserService(
      lecturerId,
      studentId,
    );
  }

  @Get("find/:id")
  @ApiOperation({ summary: "Get notification by ID" })
  @ApiParam({ name: "id", description: "Notification ID", type: String })
  @ApiResponse({
    status: 200,
    description: "Notification retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async getNotificationById(@Param("id") id: string) {
    return this.adminService.getNotificationByIdService(id);
  }

  @Post("create")
  @ApiOperation({ summary: "Create a new notification" })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: "Notification created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async createNotification(@Body() data: CreateNotificationDto) {
    return this.adminService.createNotificationService(data);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "Update a notification" })
  @ApiParam({ name: "id", description: "Notification ID", type: String })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: 200,
    description: "Notification updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async updateNotification(
    @Param("id") id: string,
    @Body() data: UpdateNotificationDto,
  ) {
    return this.adminService.updateNotificationService(id, data);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "Delete a notification" })
  @ApiParam({ name: "id", description: "Notification ID", type: String })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async deleteNotification(@Param("id") id: string) {
    return this.adminService.deleteNotificationService(id);
  }
}
