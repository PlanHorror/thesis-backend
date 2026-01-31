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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Exam Schedules')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/exam-schedule')
export class ExamScheduleController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all exam schedules' })
  @ApiResponse({
    status: 200,
    description: 'List of all exam schedules retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllExamSchedules() {
    return this.adminService.getAllExamSchedulesService(true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam schedule by ID' })
  @ApiParam({ name: 'id', description: 'Exam schedule ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  async getExamScheduleById(@Param('id') id: string) {
    return this.adminService.getExamScheduleByIdService(id, true);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new exam schedule' })
  @ApiBody({ type: CreateExamScheduleDto })
  @ApiResponse({
    status: 201,
    description: 'Exam schedule created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Schedule already exists',
  })
  async createExamSchedule(@Body() data: CreateExamScheduleDto) {
    return this.adminService.createExamScheduleService(data);
  }

  @Post('create-multiple')
  @ApiOperation({ summary: 'Create multiple exam schedules' })
  @ApiBody({ type: CreateMultipleExamSchedulesDto })
  @ApiResponse({
    status: 201,
    description: 'Exam schedules created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createMultipleExamSchedules(
    @Body() data: CreateMultipleExamSchedulesDto,
  ) {
    return this.adminService.createMultipleExamSchedulesService(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an exam schedule' })
  @ApiParam({ name: 'id', description: 'Exam schedule ID', type: String })
  @ApiBody({ type: UpdateExamScheduleDto })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  async updateExamSchedule(
    @Param('id') id: string,
    @Body() data: UpdateExamScheduleDto,
  ) {
    return this.adminService.updateExamScheduleService(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exam schedule' })
  @ApiParam({ name: 'id', description: 'Exam schedule ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  async deleteExamSchedule(@Param('id') id: string) {
    return this.adminService.deleteExamScheduleService(id);
  }

  @Delete('delete-multiple')
  @ApiOperation({ summary: 'Delete multiple exam schedules' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ids: { type: 'array', items: { type: 'string' } } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Exam schedules deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteMultipleExamSchedules(@Body() { ids }: { ids: string[] }) {
    return this.adminService.deleteMultipleExamSchedulesService(ids);
  }
}
