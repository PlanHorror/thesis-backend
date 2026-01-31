import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CourseSemesterService } from './course-semester.service';
import { isBoolean } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Course Semesters')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'))
@Controller('course-semester')
export class CourseSemesterController {
  constructor(private readonly courseSemesterService: CourseSemesterService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all course semesters' })
  @ApiQuery({
    name: 'includeCourses',
    description: 'Include course information',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeSemesters',
    description: 'Include semester information',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'courseId',
    description: 'Filter by course ID',
    required: false,
  })
  @ApiQuery({
    name: 'semesterId',
    description: 'Filter by semester ID',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of course semesters returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllCourseSemesters(
    @Query('includeCourses') includeCourses?: boolean,
    @Query('includeSemesters') includeSemesters?: boolean,
    @Query('courseId') courseId?: string,
    @Query('semesterId') semesterId?: string,
  ) {
    return await this.courseSemesterService.findAll(
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeSemesters) ? includeSemesters : false,
      courseId,
      semesterId,
    );
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get course semester by ID' })
  @ApiParam({ name: 'id', description: 'Course Semester ID' })
  @ApiQuery({
    name: 'includeCourses',
    description: 'Include course information',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeSemesters',
    description: 'Include semester information',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Course semester found successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course semester not found' })
  async getCourseSemesterById(
    @Param('id') id: string,
    @Query('includeCourses') includeCourses?: boolean,
    @Query('includeSemesters') includeSemesters?: boolean,
  ) {
    return await this.courseSemesterService.findOne(
      id,
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeSemesters) ? includeSemesters : false,
    );
  }
}
