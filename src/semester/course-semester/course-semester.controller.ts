import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CourseSemesterService } from './course-semester.service';
import { isBoolean } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('accessToken'))
@Controller('course-semester')
export class CourseSemesterController {
  constructor(private readonly courseSemesterService: CourseSemesterService) {}

  @Get('all')
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
