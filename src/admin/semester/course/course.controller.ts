import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { isBoolean, isString } from 'class-validator';
import { AdminService } from 'src/admin/admin.service';
import { CourseOnSemesterDto } from 'src/admin/dto/semester.dto';

@Controller('admin/semester/course')
export class CourseController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
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
  async getCourseSemesterById(@Param('id') id: string) {
    return this.adminService.getCourseOnSemesterByIdService(id);
  }

  @Post('create')
  async createCourseSemester(
    @Body() createCourseSemesterDto: CourseOnSemesterDto,
  ) {
    return this.adminService.createCourseToSemesterService(
      createCourseSemesterDto,
    );
  }

  @Put('update/:id')
  async updateCourseSemester(
    @Param('id') id: string,
    @Body() updateCourseSemesterDto: CourseOnSemesterDto,
  ) {
    return this.adminService.updateCourseOnSemesterService(
      id,
      updateCourseSemesterDto,
    );
  }

  @Delete('delete/:id')
  async deleteCourseSemester(@Param('id') id: string) {
    return this.adminService.deleteCourseFromSemesterService(id);
  }

  @Delete('delete')
  async deleteManyCourseSemesters(@Body('ids') ids: string) {
    return this.adminService.deleteManyCoursesFromSemestersService(
      ids.split(','),
    );
  }
}
