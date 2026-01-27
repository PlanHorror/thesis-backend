import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SemesterService } from './semester.service';
import { isBoolean } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('accessToken'))
@Controller('semester')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get('all')
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
