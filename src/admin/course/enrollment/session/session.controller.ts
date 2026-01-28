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
import { AdminService } from 'src/admin/admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';
import {
  CreateEnrollmentSessionDto,
  CreateMultipleEnrollmentSessionsDto,
  UpdateEnrollmentSessionDto,
} from 'src/admin/dto/enrollment-session.dto';

@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/enrollment/session')
export class SessionController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async getAllEnrollmentSessions() {
    return this.adminService.getAllEnrollmentSessionsService();
  }

  @Get(':id')
  async getEnrollmentSessionById(@Param('id') id: string) {
    return this.adminService.getEnrollmentSessionByIdService(id);
  }

  @Get('semester/:semesterId')
  async getEnrollmentSessionsBySemesterId(
    @Param('semesterId') semesterId: string,
  ) {
    return this.adminService.getEnrollmentSessionsBySemesterIdService(
      semesterId,
    );
  }

  @Post('create')
  async createEnrollmentSession(@Body() data: CreateEnrollmentSessionDto) {
    return this.adminService.createEnrollmentSessionService(data);
  }

  @Post('create-multiple')
  async createMultipleEnrollmentSessions(
    @Body() data: CreateMultipleEnrollmentSessionsDto,
  ) {
    return this.adminService.createMultipleEnrollmentSessionsService(data);
  }

  @Patch('update/:id')
  async updateEnrollmentSession(
    @Param('id') id: string,
    @Body() data: UpdateEnrollmentSessionDto,
  ) {
    return this.adminService.updateEnrollmentSessionService(id, data);
  }

  @Delete('delete/:id')
  async deleteEnrollmentSession(@Param('id') id: string) {
    return this.adminService.deleteEnrollmentSessionService(id);
  }

  @Delete('delete-multiple')
  async deleteMultipleEnrollmentSessions(@Body() data: { ids: string[] }) {
    return this.adminService.deleteMultipleEnrollmentSessionsService(data.ids);
  }
}
