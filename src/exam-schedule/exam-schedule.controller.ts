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

@UseGuards(AuthGuard('accessToken'))
@Controller('exam-schedule')
export class ExamScheduleController {
  constructor(private readonly examScheduleService: ExamScheduleService) {}

  // Public endpoint - any authenticated user can get all schedules
  @Get('all')
  async getAllSchedules() {
    return this.examScheduleService.findAll(true);
  }

  // Public endpoint - any authenticated user can get schedule by id
  @Get(':id')
  async getScheduleById(@Param('id') id: string) {
    return this.examScheduleService.findById(id, true);
  }

  // Student endpoint - get schedules with optional semester filter
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @Get('student/my-schedules')
  async getMySchedules(
    @GetUser() student: Student,
    @Query('semesterId') semesterId?: string,
  ) {
    return this.examScheduleService.findByStudentId(student.id, semesterId);
  }

  // Lecturer endpoints
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Get('lecturer/my-courses')
  async getLecturerSchedules(@GetUser() lecturer: Lecturer) {
    return this.examScheduleService.findByLecturerId(lecturer.id);
  }

  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @Post('lecturer/create')
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
  async deleteExamSchedule(
    @GetUser() lecturer: Lecturer,
    @Param('id') id: string,
  ) {
    return this.examScheduleService.deleteByLecturer(lecturer.id, id);
  }
}
