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
@Controller('admin/semester/course')
export class CourseSemesterController {
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
  @UseInterceptors(AnyFilesInterceptor())
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
