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
  CreateExamScheduleDto,
  CreateMultipleExamSchedulesDto,
  UpdateExamScheduleDto,
} from 'src/admin/dto/exam-schedule.dto';

@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/exam-schedule')
export class ExamScheduleController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async getAllExamSchedules() {
    return this.adminService.getAllExamSchedulesService(true);
  }

  @Get(':id')
  async getExamScheduleById(@Param('id') id: string) {
    return this.adminService.getExamScheduleByIdService(id, true);
  }

  @Post('create')
  async createExamSchedule(@Body() data: CreateExamScheduleDto) {
    return this.adminService.createExamScheduleService(data);
  }

  @Post('create-multiple')
  async createMultipleExamSchedules(
    @Body() data: CreateMultipleExamSchedulesDto,
  ) {
    return this.adminService.createMultipleExamSchedulesService(data);
  }

  @Patch(':id')
  async updateExamSchedule(
    @Param('id') id: string,
    @Body() data: UpdateExamScheduleDto,
  ) {
    return this.adminService.updateExamScheduleService(id, data);
  }

  @Delete(':id')
  async deleteExamSchedule(@Param('id') id: string) {
    return this.adminService.deleteExamScheduleService(id);
  }

  @Delete('delete-multiple')
  async deleteMultipleExamSchedules(@Body() { ids }: { ids: string[] }) {
    return this.adminService.deleteMultipleExamSchedulesService(ids);
  }
}
