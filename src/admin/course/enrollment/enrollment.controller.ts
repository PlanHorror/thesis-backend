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
import { AdminService } from 'src/admin/admin.service';
import { CreateCourseEnrollmentDto } from 'src/admin/dto/course-enrollment.dto';

@Controller('admin/course/enrollment')
export class EnrollmentController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async getAllEnrollments(
    @Query('includeStudent') includeStudent?: boolean,
    @Query('includeCourseOnSemester') includeCourseOnSemester?: boolean,
    @Query('includeCourse') includeCourse?: boolean,
    @Query('includeSemester') includeSemester?: boolean,
    @Query('includeLecturer') includeLecturer?: boolean,
  ) {
    return await this.adminService.getAllEnrollmentsService(
      isBoolean(includeStudent) ? includeStudent : false,
      isBoolean(includeCourseOnSemester) ? includeCourseOnSemester : false,
      isBoolean(includeCourse) ? includeCourse : false,
      isBoolean(includeSemester) ? includeSemester : false,
      isBoolean(includeLecturer) ? includeLecturer : false,
    );
  }

  @Get('find/:id')
  async getEnrollmentById(
    @Param('id') id: string,
    @Query('includeStudent') includeStudent?: boolean,
    @Query('includeCourseOnSemester') includeCourseOnSemester?: boolean,
    @Query('includeCourse') includeCourse?: boolean,
    @Query('includeSemester') includeSemester?: boolean,
    @Query('includeLecturer') includeLecturer?: boolean,
  ) {
    return await this.adminService.getEnrollmentByIdService(
      id,
      isBoolean(includeStudent) ? includeStudent : false,
      isBoolean(includeCourseOnSemester) ? includeCourseOnSemester : false,
      isBoolean(includeCourse) ? includeCourse : false,
      isBoolean(includeSemester) ? includeSemester : false,
      isBoolean(includeLecturer) ? includeLecturer : false,
    );
  }

  @Post('create')
  async createEnrollment(@Body() data: CreateCourseEnrollmentDto) {
    return await this.adminService.createEnrollmentService(data);
  }

  @Patch('update/:id')
  async updateEnrollment(
    @Param('id') id: string,
    @Body() data: CreateCourseEnrollmentDto,
  ) {
    return await this.adminService.updateEnrollmentService(id, data);
  }

  @Delete('delete/:id')
  async deleteEnrollment(@Param('id') id: string) {
    return await this.adminService.deleteEnrollmentService(id);
  }

  @Delete('delete')
  async deleteManyEnrollments(@Query('ids') ids: string) {
    return await this.adminService.deleteManyEnrollmentsService(ids.split(','));
  }
}
