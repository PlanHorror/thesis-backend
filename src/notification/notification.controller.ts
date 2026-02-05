import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Lecturer, Student } from "@prisma/client";
import { Role } from "common";
import { GetUser } from "common/decorator/getuser.decorator";
import { RoleGuard } from "common/guard/role.guard";
import { NotificationService } from "./notification.service";

@ApiTags("Notifications")
@Controller("notification")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Student endpoints
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @Get("student/all")
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Get all notifications for current student" })
  @ApiResponse({
    status: 200,
    description: "Student notifications returned successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  async getStudentNotifications(@GetUser() student: Student) {
    return this.notificationService.findByUser(undefined, student.id);
  }

  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @Get("student/:id")
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Get student notification by ID" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification found successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async getStudentNotificationById(
    @GetUser() student: Student,
    @Param("id") id: string,
  ) {
    return this.notificationService.findByIdForUser(id, undefined, student.id);
  }

  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @Patch("student/all/read")
  @ApiBearerAuth("accessToken")
  @ApiOperation({
    summary: "Mark all notifications as read for current student",
  })
  @ApiResponse({
    status: 200,
    description: "Notifications marked as read",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  async markAllStudentNotificationsAsRead(@GetUser() student: Student) {
    return this.notificationService.markAllAsRead(undefined, student.id);
  }

  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @Delete("student/all")
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Delete all notifications for current student" })
  @ApiResponse({
    status: 200,
    description: "All student notifications deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  async deleteAllStudentNotifications(@GetUser() student: Student) {
    return this.notificationService.deleteAllForUser(undefined, student.id);
  }

  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @Delete("student/:id")
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Delete student notification by ID" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async deleteStudentNotificationById(
    @GetUser() student: Student,
    @Param("id") id: string,
  ) {
    return this.notificationService.deleteForUser(id, undefined, student.id);
  }

  // Lecturer endpoints
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @Get("lecturer/all")
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Get all notifications for current lecturer" })
  @ApiResponse({
    status: 200,
    description: "Lecturer notifications returned successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Lecturer role required",
  })
  async getLecturerNotifications(@GetUser() lecturer: Lecturer) {
    return this.notificationService.findByUser(lecturer.id, undefined);
  }

  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @Get("lecturer/:id")
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Get lecturer notification by ID" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification found successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Lecturer role required",
  })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async getLecturerNotificationById(
    @GetUser() lecturer: Lecturer,
    @Param("id") id: string,
  ) {
    return this.notificationService.findByIdForUser(id, lecturer.id, undefined);
  }

  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @Patch("lecturer/all/read")
  @ApiBearerAuth("accessToken")
  @ApiOperation({
    summary: "Mark all notifications as read for current lecturer",
  })
  @ApiResponse({
    status: 200,
    description: "Notifications marked as read",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Lecturer role required",
  })
  async markAllLecturerNotificationsAsRead(@GetUser() lecturer: Lecturer) {
    return this.notificationService.markAllAsRead(lecturer.id, undefined);
  }

  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @Delete("lecturer/all")
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Delete all notifications for current lecturer" })
  @ApiResponse({
    status: 200,
    description: "All lecturer notifications deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Lecturer role required",
  })
  async deleteAllLecturerNotifications(@GetUser() lecturer: Lecturer) {
    return this.notificationService.deleteAllForUser(lecturer.id, undefined);
  }

  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @Delete("lecturer/:id")
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Delete lecturer notification by ID" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Lecturer role required",
  })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async deleteLecturerNotificationById(
    @GetUser() lecturer: Lecturer,
    @Param("id") id: string,
  ) {
    return this.notificationService.deleteForUser(id, lecturer.id, undefined);
  }
}
