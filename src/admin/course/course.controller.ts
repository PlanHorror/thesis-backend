import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { isBoolean } from 'class-validator';
import { CourseService } from 'src/course/course.service';
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto';
import { AdminService } from '../admin.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Courses')
@Controller('admin/course')
export class CourseController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'List of all courses retrieved successfully',
  })
  async getAllCourses() {
    return this.adminService.getAllCoursesService(true);
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @ApiQuery({
    name: 'includeDepartment',
    required: false,
    description: 'Include department information',
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(
    @Param('id') id: string,
    @Query('includeDepartment') includeDepartment: boolean,
  ) {
    return this.adminService.getCourseByIdService(
      id,
      isBoolean(includeDepartment) ? includeDepartment : false,
    );
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get courses by department ID' })
  @ApiParam({
    name: 'departmentId',
    description: 'Department ID',
    type: String,
  })
  @ApiQuery({
    name: 'includeDepartment',
    required: false,
    description: 'Include department information',
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getCoursesByDepartmentId(
    @Param('departmentId') departmentId: string,
    @Query('includeDepartment') includeDepartment: boolean,
  ) {
    return this.adminService.getAllCoursesByDepartmentIdService(
      departmentId,
      isBoolean(includeDepartment) ? includeDepartment : false,
    );
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 409, description: 'Conflict - Course already exists' })
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.adminService.createCourseService(createCourseDto);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.adminService.updateCourseService(id, updateCourseDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourseService(id);
  }

  @Delete('delete/')
  @ApiOperation({ summary: 'Delete multiple courses' })
  @ApiQuery({
    name: 'ids',
    description: 'Comma-separated list of course IDs to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Courses deleted successfully' })
  async deleteManyCourses(@Query('ids') ids: string) {
    return this.adminService.deleteManyCoursesService(ids.split(','));
  }
}
