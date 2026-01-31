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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ExamScheduleService } from './exam-schedule.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';
import { GetUser } from 'common/decorator/getuser.decorator';
import type { Student, Lecturer } from '@prisma/client';
import {
  CreateExamScheduleDto,
  UpdateExamScheduleDto,
} from 'src/admin/dto/exam-schedule.dto';

@ApiTags('Exam Schedules')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'))
@Controller('exam-schedule')
export class ExamScheduleController {
  constructor(private readonly examScheduleService: ExamScheduleService) {}

  // Public endpoint - any authenticated user can get all schedules
  @Get('all')
  @ApiOperation({ summary: 'Get all exam schedules' })
  @ApiResponse({
    status: 200,
    description: 'List of all exam schedules returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllSchedules() {
    return this.examScheduleService.findAll(true);
  }

  // Public endpoint - any authenticated user can get schedule by id
  @Get('find/:id')
  @ApiOperation({ summary: 'Get exam schedule by ID' })
  @ApiParam({ name: 'id', description: 'Exam Schedule ID' })
  @ApiResponse({ status: 200, description: 'Exam schedule found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  async getScheduleById(@Param('id') id: string) {
    return this.examScheduleService.findById(id, true);
  }

  // Student endpoint - get schedules with optional semester filter
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Get('student/my-schedules')
  @ApiOperation({ summary: 'Get exam schedules for current student' })
  @ApiQuery({
    name: 'semesterId',
    description: 'Filter by semester ID',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Student exam schedules returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  async getMySchedules(
    @GetUser() student: Student,
    @Query('semesterId') semesterId?: string,
  ) {
    return this.examScheduleService.findByStudentId(student.id, semesterId);
  }

  // Lecturer endpoints
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Get('lecturer/my-courses')
  @ApiOperation({ summary: 'Get exam schedules for lecturer courses' })
  @ApiResponse({
    status: 200,
    description: 'Lecturer exam schedules returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  async getLecturerSchedules(@GetUser() lecturer: Lecturer) {
    return this.examScheduleService.findByLecturerId(lecturer.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Post('lecturer/create')
  @ApiOperation({ summary: 'Create an exam schedule' })
  @ApiBody({ type: CreateExamScheduleDto })
  @ApiResponse({
    status: 201,
    description: 'Exam schedule created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async createExamSchedule(
    @GetUser() lecturer: Lecturer,
    @Body() data: CreateExamScheduleDto,
  ) {
    return this.examScheduleService.createByLecturer(
      lecturer.id,
      data.courseOnSemesterId,
      {
        examDate: data.examDate,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        description: data.description,
      },
    );
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Patch('lecturer/:id')
  @ApiOperation({ summary: 'Update an exam schedule' })
  @ApiParam({ name: 'id', description: 'Exam Schedule ID' })
  @ApiBody({ type: UpdateExamScheduleDto })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  async updateExamSchedule(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
    @Body() data: UpdateExamScheduleDto,
  ) {
    return this.examScheduleService.updateByLecturer(lecturer.id, id, {
      examDate: data.examDate,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      description: data.description,
    });
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Delete('lecturer/:id')
  @ApiOperation({ summary: 'Delete an exam schedule' })
  @ApiParam({ name: 'id', description: 'Exam Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  async deleteExamSchedule(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
  ) {
    return this.examScheduleService.deleteByLecturer(lecturer.id, id);
  }
}
