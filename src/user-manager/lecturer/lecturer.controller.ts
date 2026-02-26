import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Lecturer } from "@prisma/client";
import { Role, RoleGuard } from "common";
import { GetUser } from "common/decorator";
import { LecturerUpdateAccountDto } from "src/admin/dto/lecturer.dto";
import { LecturerService } from "./lecturer.service";

@ApiTags("Lecturers")
@Controller("lecturer")
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Get("all")
  @ApiOperation({ summary: "Get all lecturers" })
  @ApiResponse({
    status: 200,
    description: "List of all lecturers returned successfully",
  })
  async getAllLecturers() {
    return this.lecturerService.findAll();
  }

  @Get("student/:studentId")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @ApiBearerAuth("accessToken")
  @ApiParam({ name: "studentId", description: "Student ID" })
  @ApiOperation({
    summary: "Get student profile (lecturer view)",
    description:
      "Returns student info and enrollments for courses the lecturer teaches. Access only if lecturer teaches this student.",
  })
  @ApiResponse({ status: 200, description: "Student profile returned" })
  @ApiResponse({
    status: 403,
    description: "Lecturer does not teach this student",
  })
  @ApiResponse({ status: 404, description: "Student not found" })
  async getStudentProfile(
    @Param("studentId") studentId: string,
    @GetUser() lecturer: Lecturer,
  ) {
    return this.lecturerService.getStudentProfileForLecturer(
      lecturer.id,
      studentId,
    );
  }

  @Get("/:id")
  @ApiOperation({ summary: "Get lecturer by ID" })
  @ApiQuery({ name: "id", description: "Lecturer ID", required: true })
  @ApiResponse({ status: 200, description: "Lecturer found successfully" })
  @ApiResponse({ status: 404, description: "Lecturer not found" })
  async getLecturerById(@Query("id") id: string) {
    return this.lecturerService.findById(id);
  }

  @Patch("update")
  @UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.LECTURER]))
  @ApiBearerAuth("accessToken")
  @ApiOperation({ summary: "Update lecturer account" })
  @ApiBody({ type: LecturerUpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: "Lecturer account updated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Lecturer role required",
  })
  async updateLecturer(
    @Body() data: LecturerUpdateAccountDto,
    @GetUser() lecturer: Lecturer,
  ) {
    return this.lecturerService.lecturerUpdateAccount(data, lecturer);
  }
}
