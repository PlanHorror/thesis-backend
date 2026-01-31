import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SemesterService } from './semester.service';
import { isBoolean } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Semesters')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'))
@Controller('semester')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all semesters' })
  @ApiQuery({
    name: 'includeCourses',
    description: 'Include courses in response',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeDocuments',
    description: 'Include documents in response',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all semesters returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllSemesters(
    @Query('includeCourses') includeCourses?: boolean,
    @Query('includeDocuments') includeDocuments?: boolean,
  ) {
    return await this.semesterService.findAll(
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeDocuments) ? includeDocuments : false,
    );
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get semester by ID' })
  @ApiParam({ name: 'id', description: 'Semester ID' })
  @ApiQuery({
    name: 'includeCourses',
    description: 'Include courses in response',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeDocuments',
    description: 'Include documents in response',
    required: false,
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Semester found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async getSemesterById(
    @Param('id') id: string,
    @Query('includeCourses') includeCourses?: boolean,
    @Query('includeDocuments') includeDocuments?: boolean,
  ) {
    return await this.semesterService.findById(
      id,
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeDocuments) ? includeDocuments : false,
    );
  }
}
