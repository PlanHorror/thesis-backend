import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';
import { GetUser } from 'common/decorator/getuser.decorator';
import type { Student, Lecturer } from '@prisma/client';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Student endpoints
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Get('student/all')
  async getStudentNotifications(@GetUser() student: Student) {
    return this.notificationService.findByUser(undefined, student.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Get('student/:id')
  async getStudentNotificationById(
    @GetUser() student: Student,
    @Param('id') id: string,
  ) {
    return this.notificationService.findByIdForUser(id, undefined, student.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Delete('student/all')
  async deleteAllStudentNotifications(@GetUser() student: Student) {
    return this.notificationService.deleteAllForUser(undefined, student.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Delete('student/:id')
  async deleteStudentNotificationById(
    @GetUser() student: Student,
    @Param('id') id: string,
  ) {
    return this.notificationService.deleteForUser(id, undefined, student.id);
  }

  // Lecturer endpoints
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Get('lecturer/all')
  async getLecturerNotifications(@GetUser() lecturer: Lecturer) {
    return this.notificationService.findByUser(lecturer.id, undefined);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Get('lecturer/:id')
  async getLecturerNotificationById(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
  ) {
    return this.notificationService.findByIdForUser(id, lecturer.id, undefined);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Delete('lecturer/all')
  async deleteAllLecturerNotifications(@GetUser() lecturer: Lecturer) {
    return this.notificationService.deleteAllForUser(lecturer.id, undefined);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Delete('lecturer/:id')
  async deleteLecturerNotificationById(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
  ) {
    return this.notificationService.deleteForUser(id, lecturer.id, undefined);
  }
}
