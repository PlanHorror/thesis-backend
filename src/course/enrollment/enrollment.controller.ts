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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { AuthGuard } from '@nestjs/passport';
import { Role, RoleGuard, GetUser } from 'common';
import type { Student, Lecturer } from '@prisma/client';
import { UpdateGradeDto } from './dto/update-grade.dto';

@ApiTags('Enrollments')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // Student endpoints
  @Get('my-enrollments')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get current student enrollments' })
  @ApiResponse({
    status: 200,
    description: 'Student enrollments returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get student enrollment by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  @ApiResponse({ status: 200, description: 'Enrollment found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { courseOnSemesterId: { type: 'string' } },
      required: ['courseOnSemesterId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Enrolled in course successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Already enrolled or invalid course',
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Unenroll from a course' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  @ApiResponse({
    status: 200,
    description: 'Unenrolled from course successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async unenrollFromCourse(
    @Param('id') id: string,
    @GetUser() student: Student,
  ) {
    return this.enrollmentService.unenrollStudentFromCourse(student, id);
  }

  // Lecturer endpoint
  @Get('course-semester/:courseOnSemesterId')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get enrollments by course semester' })
  @ApiParam({
    name: 'courseOnSemesterId',
    description: 'Course on Semester ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollments returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
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
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Update student grade' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  @ApiBody({ type: UpdateGradeDto })
  @ApiResponse({ status: 200, description: 'Grade updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
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
