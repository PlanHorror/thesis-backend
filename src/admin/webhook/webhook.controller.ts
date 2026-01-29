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

@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/webhook')
export class WebhookController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async getAllWebhooks() {
    return await this.adminService.getAllWebhooksService();
  }

  @Get('user')
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
  async getWebhookById(@Param('id') id: string) {
    return await this.adminService.getWebhookByIdService(id);
  }

  @Post('create')
  async createWebhook(@Body() data: CreateWebhookDto) {
    return await this.adminService.createWebhookService(data);
  }

  @Patch(':id')
  async updateWebhook(@Param('id') id: string, @Body() data: UpdateWebhookDto) {
    return await this.adminService.updateWebhookService(id, data);
  }

  @Patch(':id/toggle')
  async toggleWebhookActive(@Param('id') id: string) {
    return await this.adminService.toggleWebhookActiveService(id);
  }

  @Delete(':id')
  async deleteWebhook(@Param('id') id: string) {
    return await this.adminService.deleteWebhookService(id);
  }
}
