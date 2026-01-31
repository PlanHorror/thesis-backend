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
import { CreateWebhookDto, UpdateWebhookDto } from 'src/admin/dto/webhook.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Webhooks')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/webhook')
export class WebhookController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all webhooks' })
  @ApiResponse({
    status: 200,
    description: 'List of all webhooks retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllWebhooks() {
    return await this.adminService.getAllWebhooksService();
  }

  @Get('user')
  @ApiOperation({ summary: 'Get webhooks by user' })
  @ApiQuery({
    name: 'lecturerId',
    required: false,
    description: 'Filter by lecturer ID',
    type: String,
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Filter by student ID',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Webhooks retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getWebhooksByUser(
    @Query('lecturerId') lecturerId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return await this.adminService.getWebhooksByUserService(
      lecturerId,
      studentId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by ID' })
  @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
  @ApiResponse({ status: 200, description: 'Webhook retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async getWebhookById(@Param('id') id: string) {
    return await this.adminService.getWebhookByIdService(id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiBody({ type: CreateWebhookDto })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createWebhook(@Body() data: CreateWebhookDto) {
    return await this.adminService.createWebhookService(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
  @ApiBody({ type: UpdateWebhookDto })
  @ApiResponse({ status: 200, description: 'Webhook updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async updateWebhook(@Param('id') id: string, @Body() data: UpdateWebhookDto) {
    return await this.adminService.updateWebhookService(id, data);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle webhook active status' })
  @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Webhook status toggled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async toggleWebhookActive(@Param('id') id: string) {
    return await this.adminService.toggleWebhookActiveService(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
  @ApiResponse({ status: 200, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async deleteWebhook(@Param('id') id: string) {
    return await this.adminService.deleteWebhookService(id);
  }
}
