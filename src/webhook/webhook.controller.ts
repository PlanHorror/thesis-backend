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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';
import { GetUser } from 'common/decorator/getuser.decorator';
import type { Student, Lecturer, Prisma } from '@prisma/client';
import { CreateWebhookBodyDto, UpdateWebhookBodyDto } from './dto/webhook.dto';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  // Student endpoints
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Get('student/all')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get all webhooks for current student' })
  @ApiResponse({
    status: 200,
    description: 'Student webhooks returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  async getStudentWebhooks(@GetUser() student: Student) {
    return await this.webhookService.findByUser(undefined, student.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Get('student/:id')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get student webhook by ID' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async getStudentWebhookById(
    @GetUser() student: Student,
    @Param('id') id: string,
  ) {
    return await this.webhookService.findByIdForUser(id, undefined, student.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Post('student/create')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Create a webhook for current student' })
  @ApiBody({ type: CreateWebhookBodyDto })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Update a student webhook' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiBody({ type: UpdateWebhookBodyDto })
  @ApiResponse({ status: 200, description: 'Webhook updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Toggle student webhook active status' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook toggled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Delete a student webhook' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async deleteStudentWebhook(
    @GetUser() student: Student,
    @Param('id') id: string,
  ) {
    return await this.webhookService.deleteForUser(id, undefined, student.id);
  }

  // Lecturer endpoints
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Get('lecturer/all')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get all webhooks for current lecturer' })
  @ApiResponse({
    status: 200,
    description: 'Lecturer webhooks returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  async getLecturerWebhooks(@GetUser() lecturer: Lecturer) {
    return await this.webhookService.findByUser(lecturer.id, undefined);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Get('lecturer/:id')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get lecturer webhook by ID' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Create a webhook for current lecturer' })
  @ApiBody({ type: CreateWebhookBodyDto })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Update a lecturer webhook' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiBody({ type: UpdateWebhookBodyDto })
  @ApiResponse({ status: 200, description: 'Webhook updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Toggle lecturer webhook active status' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook toggled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Delete a lecturer webhook' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async deleteLecturerWebhook(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
  ) {
    return await this.webhookService.deleteForUser(id, lecturer.id, undefined);
  }
}
