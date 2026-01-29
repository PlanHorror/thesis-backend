import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';
import { GetUser } from 'common/decorator/getuser.decorator';
import type { Student, Lecturer, Prisma } from '@prisma/client';

class CreateWebhookBodyDto {
  url: string;
  isActive?: boolean;
}

class UpdateWebhookBodyDto {
  url?: string;
  isActive?: boolean;
}

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  // Student endpoints
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Get('student/all')
  async getStudentWebhooks(@GetUser() student: Student) {
    return await this.webhookService.findByUser(undefined, student.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Get('student/:id')
  async getStudentWebhookById(
    @GetUser() student: Student,
    @Param('id') id: string,
  ) {
    return await this.webhookService.findByIdForUser(id, undefined, student.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Post('student/create')
  async createStudentWebhook(
    @GetUser() student: Student,
    @Body() data: CreateWebhookBodyDto,
  ) {
    const webhookData: Prisma.WebhookCreateInput = {
      url: data.url,
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      student: { connect: { id: student.id } },
    };
    return await this.webhookService.create(webhookData);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Patch('student/:id')
  async updateStudentWebhook(
    @GetUser() student: Student,
    @Param('id') id: string,
    @Body() data: UpdateWebhookBodyDto,
  ) {
    const updateData: Prisma.WebhookUpdateInput = {};
    if (data.url !== undefined) updateData.url = data.url;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await this.webhookService.updateForUser(
      id,
      updateData,
      undefined,
      student.id,
    );
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Patch('student/:id/toggle')
  async toggleStudentWebhookActive(
    @GetUser() student: Student,
    @Param('id') id: string,
  ) {
    return await this.webhookService.toggleActiveForUser(
      id,
      undefined,
      student.id,
    );
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Delete('student/:id')
  async deleteStudentWebhook(
    @GetUser() student: Student,
    @Param('id') id: string,
  ) {
    return await this.webhookService.deleteForUser(id, undefined, student.id);
  }

  // Lecturer endpoints
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Get('lecturer/all')
  async getLecturerWebhooks(@GetUser() lecturer: Lecturer) {
    return await this.webhookService.findByUser(lecturer.id, undefined);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Get('lecturer/:id')
  async getLecturerWebhookById(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
  ) {
    return await this.webhookService.findByIdForUser(
      id,
      lecturer.id,
      undefined,
    );
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Post('lecturer/create')
  async createLecturerWebhook(
    @GetUser() lecturer: Lecturer,
    @Body() data: CreateWebhookBodyDto,
  ) {
    const webhookData: Prisma.WebhookCreateInput = {
      url: data.url,
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      lecturer: { connect: { id: lecturer.id } },
    };
    return await this.webhookService.create(webhookData);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Patch('lecturer/:id')
  async updateLecturerWebhook(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
    @Body() data: UpdateWebhookBodyDto,
  ) {
    const updateData: Prisma.WebhookUpdateInput = {};
    if (data.url !== undefined) updateData.url = data.url;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await this.webhookService.updateForUser(
      id,
      updateData,
      lecturer.id,
      undefined,
    );
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Patch('lecturer/:id/toggle')
  async toggleLecturerWebhookActive(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
  ) {
    return await this.webhookService.toggleActiveForUser(
      id,
      lecturer.id,
      undefined,
    );
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Delete('lecturer/:id')
  async deleteLecturerWebhook(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
  ) {
    return await this.webhookService.deleteForUser(id, lecturer.id, undefined);
  }
}
