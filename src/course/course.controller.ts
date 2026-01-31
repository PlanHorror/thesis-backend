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
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { AuthGuard } from '@nestjs/passport';
import { isBoolean } from 'class-validator';

@ApiTags('Courses')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'))
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({
    name: 'includeDepartment',
    description: 'Include department information',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all courses returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query('includeDepartment') includeDepartment?: boolean) {
    return await this.courseService.findAll(
      isBoolean(includeDepartment) ? includeDepartment : false,
    );
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get courses by department ID' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @ApiQuery({
    name: 'includeDepartment',
    description: 'Include department information',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Courses for department returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findByDepartmentId(
    @Param('departmentId') departmentId: string,
    @Query('includeDepartment') includeDepartment?: boolean,
  ) {
    return await this.courseService.findByDepartmentId(
      departmentId,
      isBoolean(includeDepartment) ? includeDepartment : false,
    );
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiQuery({
    name: 'includeDepartment',
    description: 'Include department information',
    required: false,
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Course found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(
    @Param('id') id: string,
    @Query('includeDepartment') includeDepartment?: boolean,
  ) {
    return await this.courseService.findOne(
      id,
      isBoolean(includeDepartment) ? includeDepartment : false,
    );
  }
}
