import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { AuthGuard } from '@nestjs/passport';
import { Role, RoleGuard, GetUser } from 'common';
import type { Student, Lecturer } from '@prisma/client';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // Student endpoints
  @Get('my-enrollments')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  async getMyEnrollments(@GetUser() student: Student) {
    return this.enrollmentService.findAll(
      false,
      false,
      false,
      false,
      false,
      student.id,
    );
  }

  @Get('my-enrollments/:id')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  async getMyEnrollmentById(
    @Param('id') id: string,
    @GetUser() student: Student,
  ) {
    const enrollment = await this.enrollmentService.findOne(id);
    if (enrollment.studentId !== student.id) {
      throw new Error('Unauthorized');
    }
    return enrollment;
  }

  @Post('enroll')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  async enrollInCourse(
    @Body() data: { courseOnSemesterId: string },
    @GetUser() student: Student,
  ) {
    return this.enrollmentService.enrollStudentInCourse(
      student,
      data.courseOnSemesterId,
    );
  }

  @Delete('unenroll/:id')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  async unenrollFromCourse(
    @Param('id') id: string,
    @GetUser() student: Student,
  ) {
    return this.enrollmentService.unenrollStudentFromCourse(student, id);
  }

  // Lecturer endpoint
  @Get('course-semester/:courseOnSemesterId')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  async getEnrollmentsByCourseOnSemester(
    @Param('courseOnSemesterId') courseOnSemesterId: string,
    @GetUser() lecturer: Lecturer,
  ) {
    return this.enrollmentService.findAll(
      true,
      true,
      true,
      true,
      false,
      undefined,
      courseOnSemesterId,
      lecturer.id,
    );
  }

  @Patch('grade/:enrollmentId')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  async updateStudentGrade(
    @Param('enrollmentId') enrollmentId: string,
    @Body() data: UpdateGradeDto,
    @GetUser() lecturer: Lecturer,
  ) {
    return await this.enrollmentService.updateGradeByLecturer(
      enrollmentId,
      lecturer.id,
      data,
    );
  }
}
