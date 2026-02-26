import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Lecturer, Student } from "@prisma/client";
import { GetUser, Role, RoleGuard } from "common";
import { UpdateGradeDto } from "./dto/update-grade.dto";
import { EnrollmentService } from "./enrollment.service";

@ApiTags("Enrollments")
@Controller("enrollment")
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // Student endpoints
  @Get("my-progress")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({
    summary: "Get student academic progress (semester-by-semester)",
  })
  @ApiResponse({
    status: 200,
    description: "Progress data returned successfully",
  })
  async getMyProgress(@GetUser() student: Student) {
    return this.enrollmentService.getStudentProgress(student.id);
  }

  @Get("my-enrollments")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Get current student enrollments" })
  @ApiResponse({
    status: 200,
    description: "Student enrollments returned successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  async getMyEnrollments(@GetUser() student: Student) {
    return this.enrollmentService.findAll(
      false, // includeStudent - not needed for own enrollments
      true, // includeCourseOnSemester - needed for course info
      true, // includeCourse - needed for course name, credits
      true, // includeSemester - needed for semester name
      true, // includeLecturer - needed for lecturer info
      student.id,
    );
  }

  @Get("my-enrollments/:id")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Get student enrollment by ID" })
  @ApiParam({ name: "id", description: "Enrollment ID" })
  @ApiResponse({ status: 200, description: "Enrollment found successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  @ApiResponse({ status: 404, description: "Enrollment not found" })
  async getMyEnrollmentById(
    @Param("id") id: string,
    @GetUser() student: Student,
  ) {
    const enrollment = await this.enrollmentService.findOne(
      id,
      false,
      true,
      true,
      true,
      true,
    );
    if (enrollment.studentId !== student.id) {
      throw new Error("Unauthorized");
    }
    return enrollment;
  }

  @Post("enroll")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Enroll in a course" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { courseOnSemesterId: { type: "string" } },
      required: ["courseOnSemesterId"],
    },
  })
  @ApiResponse({ status: 201, description: "Enrolled in course successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Already enrolled or invalid course",
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

  @Delete("unenroll/:id")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.STUDENT]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Unenroll from a course" })
  @ApiParam({ name: "id", description: "Enrollment ID" })
  @ApiResponse({
    status: 200,
    description: "Unenrolled from course successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Student role required",
  })
  @ApiResponse({ status: 404, description: "Enrollment not found" })
  async unenrollFromCourse(
    @Param("id") id: string,
    @GetUser() student: Student,
  ) {
    return this.enrollmentService.unenrollStudentFromCourse(student, id);
  }

  // Lecturer endpoints
  @Get("course-semester/:courseOnSemesterId/analytics")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Get course analytics (avg grade, at-risk count)" })
  @ApiParam({
    name: "courseOnSemesterId",
    description: "Course on Semester ID",
  })
  @ApiResponse({
    status: 200,
    description: "Analytics returned successfully",
  })
  async getCourseAnalytics(
    @Param("courseOnSemesterId") courseOnSemesterId: string,
    @GetUser() lecturer: Lecturer,
  ) {
    return this.enrollmentService.getCourseAnalytics(
      courseOnSemesterId,
      lecturer.id,
    );
  }

  @Get("course-semester/:courseOnSemesterId")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Get enrollments by course semester" })
  @ApiParam({
    name: "courseOnSemesterId",
    description: "Course on Semester ID",
  })
  @ApiResponse({
    status: 200,
    description: "Enrollments returned successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Lecturer role required",
  })
  async getEnrollmentsByCourseOnSemester(
    @Param("courseOnSemesterId") courseOnSemesterId: string,
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

  @Patch("grade/:enrollmentId")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Update student grade" })
  @ApiParam({ name: "enrollmentId", description: "Enrollment ID" })
  @ApiBody({ type: UpdateGradeDto })
  @ApiResponse({ status: 200, description: "Grade updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Lecturer role required",
  })
  @ApiResponse({ status: 404, description: "Enrollment not found" })
  async updateStudentGrade(
    @Param("enrollmentId") enrollmentId: string,
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
