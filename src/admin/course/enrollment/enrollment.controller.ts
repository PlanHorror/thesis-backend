import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { isBoolean } from 'class-validator';
import { AdminService } from 'src/admin/admin.service';
import { CreateCourseEnrollmentDto } from 'src/admin/dto/course-enrollment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Enrollments')
@Controller('admin/course/enrollment')
export class EnrollmentController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all course enrollments' })
  @ApiQuery({
    name: 'includeStudent',
    required: false,
    description: 'Include student details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeCourseOnSemester',
    required: false,
    description: 'Include course-semester association details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeCourse',
    required: false,
    description: 'Include course details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeSemester',
    required: false,
    description: 'Include semester details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeLecturer',
    required: false,
    description: 'Include lecturer details',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all enrollments retrieved successfully',
  })
  async getAllEnrollments(
    @Query('includeStudent') includeStudent?: boolean,
    @Query('includeCourseOnSemester') includeCourseOnSemester?: boolean,
    @Query('includeCourse') includeCourse?: boolean,
    @Query('includeSemester') includeSemester?: boolean,
    @Query('includeLecturer') includeLecturer?: boolean,
  ) {
    return await this.adminService.getAllEnrollmentsService(
      isBoolean(includeStudent) ? includeStudent : false,
      isBoolean(includeCourseOnSemester) ? includeCourseOnSemester : false,
      isBoolean(includeCourse) ? includeCourse : false,
      isBoolean(includeSemester) ? includeSemester : false,
      isBoolean(includeLecturer) ? includeLecturer : false,
    );
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment ID', type: String })
  @ApiQuery({
    name: 'includeStudent',
    required: false,
    description: 'Include student details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeCourseOnSemester',
    required: false,
    description: 'Include course-semester association details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeCourse',
    required: false,
    description: 'Include course details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeSemester',
    required: false,
    description: 'Include semester details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeLecturer',
    required: false,
    description: 'Include lecturer details',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async getEnrollmentById(
    @Param('id') id: string,
    @Query('includeStudent') includeStudent?: boolean,
    @Query('includeCourseOnSemester') includeCourseOnSemester?: boolean,
    @Query('includeCourse') includeCourse?: boolean,
    @Query('includeSemester') includeSemester?: boolean,
    @Query('includeLecturer') includeLecturer?: boolean,
  ) {
    return await this.adminService.getEnrollmentByIdService(
      id,
      isBoolean(includeStudent) ? includeStudent : false,
      isBoolean(includeCourseOnSemester) ? includeCourseOnSemester : false,
      isBoolean(includeCourse) ? includeCourse : false,
      isBoolean(includeSemester) ? includeSemester : false,
      isBoolean(includeLecturer) ? includeLecturer : false,
    );
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new course enrollment' })
  @ApiBody({ type: CreateCourseEnrollmentDto })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Enrollment already exists',
  })
  async createEnrollment(@Body() data: CreateCourseEnrollmentDto) {
    return await this.adminService.createEnrollmentService(data);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update an enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment ID', type: String })
  @ApiBody({ type: CreateCourseEnrollmentDto })
  @ApiResponse({ status: 200, description: 'Enrollment updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async updateEnrollment(
    @Param('id') id: string,
    @Body() data: CreateCourseEnrollmentDto,
  ) {
    return await this.adminService.updateEnrollmentService(id, data);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete an enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment ID', type: String })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async deleteEnrollment(@Param('id') id: string) {
    return await this.adminService.deleteEnrollmentService(id);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete multiple enrollments' })
  @ApiQuery({
    name: 'ids',
    description: 'Comma-separated list of enrollment IDs to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Enrollments deleted successfully' })
  async deleteManyEnrollments(@Query('ids') ids: string) {
    return await this.adminService.deleteManyEnrollmentsService(ids.split(','));
  }
}
