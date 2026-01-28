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
} from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from 'src/admin/dto/notification.dto';

@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/notification')
export class NotificationController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async getAllNotifications() {
    return this.adminService.getAllNotificationsService();
  }

  @Get('user')
  async getNotificationsByUser(
    @Query('lecturerId') lecturerId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.adminService.getNotificationsByUserService(
      lecturerId,
      studentId,
    );
  }

  @Get(':id')
  async getNotificationById(@Param('id') id: string) {
    return this.adminService.getNotificationByIdService(id);
  }

  @Post('create')
  async createNotification(@Body() data: CreateNotificationDto) {
    return this.adminService.createNotificationService(data);
  }

  @Patch(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() data: UpdateNotificationDto,
  ) {
    return this.adminService.updateNotificationService(id, data);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.adminService.deleteNotificationService(id);
  }
}
