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
import { AdminService } from '../admin.service';
import { CreateSemesterDto, UpdateSemesterDto } from '../dto/semester.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Semesters')
@Controller('admin/semester')
export class SemesterController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all semesters' })
  @ApiQuery({
    name: 'includeCourses',
    required: false,
    description: 'Include course-semester associations',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeDocuments',
    required: false,
    description: 'Include documents',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeCourse',
    required: false,
    description: 'Include course details',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all semesters retrieved successfully',
  })
  async findAll(
    @Query('includeCourses') includeCourses?: boolean,
    @Query('includeDocuments') includeDocuments?: boolean,
    @Query('includeCourse') includeCourse?: boolean,
  ) {
    return await this.adminService.getAllSemestersService(
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeDocuments) ? includeDocuments : false,
      isBoolean(includeCourse) ? includeCourse : false,
    );
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get semester by ID' })
  @ApiParam({ name: 'id', description: 'Semester ID', type: String })
  @ApiQuery({
    name: 'includeCourses',
    required: false,
    description: 'Include course-semester associations',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeDocuments',
    required: false,
    description: 'Include documents',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeCourse',
    required: false,
    description: 'Include course details',
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Semester retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async findById(
    @Param('id') id: string,
    @Query('includeCourses') includeCourses?: boolean,
    @Query('includeDocuments') includeDocuments?: boolean,
    @Query('includeCourse') includeCourse?: boolean,
  ) {
    return await this.adminService.getSemesterByIdService(
      id,
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeDocuments) ? includeDocuments : false,
      isBoolean(includeCourse) ? includeCourse : false,
    );
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new semester' })
  @ApiBody({ type: CreateSemesterDto })
  @ApiResponse({ status: 201, description: 'Semester created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Semester already exists',
  })
  async create(@Body() data: CreateSemesterDto) {
    return await this.adminService.createSemesterService(data);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a semester' })
  @ApiParam({ name: 'id', description: 'Semester ID', type: String })
  @ApiBody({ type: UpdateSemesterDto })
  @ApiResponse({ status: 200, description: 'Semester updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async update(@Param('id') id: string, @Body() data: UpdateSemesterDto) {
    return await this.adminService.updateSemesterService(id, data);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a semester' })
  @ApiParam({ name: 'id', description: 'Semester ID', type: String })
  @ApiResponse({ status: 200, description: 'Semester deleted successfully' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async delete(@Param('id') id: string) {
    return await this.adminService.deleteSemesterService(id);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete multiple semesters' })
  @ApiQuery({
    name: 'ids',
    description: 'Comma-separated list of semester IDs to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Semesters deleted successfully' })
  async deleteMany(@Query('ids') ids: string) {
    return await this.adminService.deleteManySemestersService(ids.split(','));
  }
}
