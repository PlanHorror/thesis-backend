import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Lecturer } from "@prisma/client";
import { GetUser, Role, RoleGuard } from "common";
import { CourseSemesterService } from "./course-semester.service";

/** Query params come as strings; coerce to boolean so include* flags work. */
function parseIncludeFlag(value: unknown): boolean {
  return value === true || value === "true";
}

@ApiTags("Course Semesters")
@ApiBearerAuth("accessToken")
@UseGuards(AuthGuard("accessToken"))
@Controller("course-semester")
export class CourseSemesterController {
  constructor(private readonly courseSemesterService: CourseSemesterService) {}

  @Get("lecturer/my-courses")
  @UseGuards(new RoleGuard([Role.LECTURER]))
  @ApiOperation({
    summary: "Get course-semesters assigned to the current lecturer",
  })
  @ApiResponse({
    status: 200,
    description: "List of course-semesters taught by the current lecturer",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMyCourses(@GetUser() lecturer: Lecturer) {
    return await this.courseSemesterService.findByLecturerId(lecturer.id);
  }

  @Get("all")
  @ApiOperation({ summary: "Get all course semesters" })
  @ApiQuery({
    name: "includeCourses",
    description: "Include course information",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "includeSemesters",
    description: "Include semester information",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "includeLecturer",
    description: "Include lecturer information",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "includeEnrollmentCount",
    description: "Include enrollment count",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "courseId",
    description: "Filter by course ID",
    required: false,
  })
  @ApiQuery({
    name: "semesterId",
    description: "Filter by semester ID",
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "List of course semesters returned successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllCourseSemesters(
    @Query("includeCourses") includeCourses?: boolean,
    @Query("includeSemesters") includeSemesters?: boolean,
    @Query("includeLecturer") includeLecturer?: boolean,
    @Query("includeEnrollmentCount") includeEnrollmentCount?: boolean,
    @Query("courseId") courseId?: string,
    @Query("semesterId") semesterId?: string,
  ) {
    return await this.courseSemesterService.findAll(
      parseIncludeFlag(includeCourses),
      parseIncludeFlag(includeSemesters),
      parseIncludeFlag(includeLecturer),
      parseIncludeFlag(includeEnrollmentCount),
      courseId,
      semesterId,
    );
  }

  @Get("find/:id")
  @ApiOperation({ summary: "Get course semester by ID" })
  @ApiParam({ name: "id", description: "Course Semester ID" })
  @ApiQuery({
    name: "includeCourses",
    description: "Include course information",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "includeSemesters",
    description: "Include semester information",
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: "Course semester found successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Course semester not found" })
  async getCourseSemesterById(
    @Param("id") id: string,
    @Query("includeCourses") includeCourses?: boolean,
    @Query("includeSemesters") includeSemesters?: boolean,
  ) {
    return await this.courseSemesterService.findOne(
      id,
      parseIncludeFlag(includeCourses),
      parseIncludeFlag(includeSemesters),
    );
  }
}
