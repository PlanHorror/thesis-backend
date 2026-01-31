import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { isBoolean, isString } from 'class-validator';
import { AdminService } from 'src/admin/admin.service';
import { CourseOnSemesterDto } from 'src/admin/dto/semester.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Admin - Course Semesters')
@Controller('admin/semester/course')
export class CourseSemesterController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all course-semester associations' })
  @ApiQuery({
    name: 'includeCourses',
    required: false,
    description: 'Include course details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeSemesters',
    required: false,
    description: 'Include semester details',
    type: Boolean,
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filter by course ID',
    type: String,
  })
  @ApiQuery({
    name: 'semesterId',
    required: false,
    description: 'Filter by semester ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of course-semester associations retrieved successfully',
  })
  async getAllCourseSemesters(
    @Query('includeCourses') includeCourses: boolean,
    @Query('includeSemesters') includeSemesters: boolean,
    @Query('courseId') courseId: string,
    @Query('semesterId') semesterId: string,
  ) {
    return this.adminService.getAllCoursesOnSemestersService(
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeSemesters) ? includeSemesters : false,
      isString(courseId) ? courseId : undefined,
      isString(semesterId) ? semesterId : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course-semester association by ID' })
  @ApiParam({
    name: 'id',
    description: 'Course-semester association ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Course-semester association retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Course-semester association not found',
  })
  async getCourseSemesterById(@Param('id') id: string) {
    return this.adminService.getCourseOnSemesterByIdService(id);
  }

  @Post('create')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({
    summary: 'Create a new course-semester association with documents',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CourseOnSemesterDto })
  @ApiResponse({
    status: 201,
    description: 'Course-semester association created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Association already exists',
  })
  async createCourseSemester(
    @Body() createCourseSemesterDto: CourseOnSemesterDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.adminService.createCourseToSemesterService(
      createCourseSemesterDto,
      files,
    );
  }

  @Put('update/:id')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({
    summary: 'Update a course-semester association with documents',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Course-semester association ID',
    type: String,
  })
  @ApiBody({ type: CourseOnSemesterDto })
  @ApiResponse({
    status: 200,
    description: 'Course-semester association updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 404,
    description: 'Course-semester association not found',
  })
  async updateCourseSemester(
    @Param('id') id: string,
    @Body() updateCourseSemesterDto: CourseOnSemesterDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.adminService.updateCourseOnSemesterService(
      id,
      updateCourseSemesterDto,
      files,
    );
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a course-semester association' })
  @ApiParam({
    name: 'id',
    description: 'Course-semester association ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Course-semester association deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Course-semester association not found',
  })
  async deleteCourseSemester(@Param('id') id: string) {
    return this.adminService.deleteCourseFromSemesterService(id);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete multiple course-semester associations' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'string', description: 'Comma-separated list of IDs' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Course-semester associations deleted successfully',
  })
  async deleteManyCourseSemesters(@Body('ids') ids: string) {
    return this.adminService.deleteManyCoursesFromSemestersService(
      ids.split(','),
    );
  }
}
