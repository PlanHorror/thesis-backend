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
import { CourseService } from './course.service';
import { AuthGuard } from '@nestjs/passport';
import { isBoolean } from 'class-validator';

@UseGuards(AuthGuard('accessToken'))
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('all')
  async findAll(
    @Query('includeDepartment') includeDepartment?: boolean,
    @Query('includeDocuments') includeDocuments?: boolean,
  ) {
    return await this.courseService.findAll(
      isBoolean(includeDepartment) ? includeDepartment : false,
      isBoolean(includeDocuments) ? includeDocuments : false,
    );
  }

  @Get('department/:departmentId')
  async findByDepartmentId(
    @Param('departmentId') departmentId: string,
    @Query('includeDocuments') includeDocuments?: boolean,
    @Query('includeDepartment') includeDepartment?: boolean,
  ) {
    return await this.courseService.findByDepartmentId(
      departmentId,
      isBoolean(includeDocuments) ? includeDocuments : false,
      isBoolean(includeDepartment) ? includeDepartment : false,
    );
  }

  @Get('find/:id')
  async findOne(
    @Param('id') id: string,
    @Query('includeDepartment') includeDepartment?: boolean,
    @Query('includeDocuments') includeDocuments?: boolean,
  ) {
    return await this.courseService.findOne(
      id,
      isBoolean(includeDepartment) ? includeDepartment : false,
      isBoolean(includeDocuments) ? includeDocuments : false,
    );
  }
}
