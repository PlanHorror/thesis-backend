import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { Role } from "common/enum/role.enum";
import { RoleGuard } from "common/guard/role.guard";
import { AdminService } from "../admin.service";
import {
  CreateMultipleStudentsDto,
  CreateStudentDto,
  UpdateStudentDto,
} from "../dto/student.dto";

@ApiTags("Admin - Students")
@ApiBearerAuth("accessToken")
@UseGuards(AuthGuard("accessToken"), new RoleGuard([Role.ADMIN]))
@Controller("admin/student")
export class StudentController {
  constructor(private readonly adminService: AdminService) {}

  @Get("all")
  @ApiOperation({ summary: "Get all student accounts" })
  @ApiResponse({
    status: 200,
    description: "List of all student accounts retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async findAll() {
    return this.adminService.getAllStudentAccountsService();
  }

  @Get("/find/:id")
  @ApiOperation({ summary: "Get student account by ID" })
  @ApiParam({ name: "id", description: "Student account ID", type: String })
  @ApiResponse({
    status: 200,
    description: "Student account retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Student not found" })
  async findOne(@Param("id") id: string) {
    return this.adminService.getStudentAccountByIdService(id);
  }

  @Get("/find")
  @ApiOperation({ summary: "Find student accounts by condition" })
  @ApiQuery({
    name: "email",
    required: false,
    description: "Filter by email address",
  })
  @ApiQuery({
    name: "studentId",
    required: false,
    description: "Filter by student ID",
  })
  @ApiQuery({
    name: "username",
    required: false,
    description: "Filter by username",
  })
  @ApiQuery({
    name: "citizenId",
    required: false,
    description: "Filter by citizen ID",
  })
  @ApiQuery({
    name: "phone",
    required: false,
    description: "Filter by phone number",
  })
  @ApiResponse({
    status: 200,
    description: "Student accounts matching criteria retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async findByEmail(
    @Query("email") email?: string,
    @Query("studentId") studentId?: string,
    @Query("username") username?: string,
    @Query("citizenId") citizenId?: string,
    @Query("phone") phone?: string,
  ) {
    return this.adminService.getStudentAccountByConditionService(
      email,
      studentId,
      username,
      citizenId,
      phone,
    );
  }

  @Post("create")
  @ApiOperation({ summary: "Create a new student account" })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({
    status: 201,
    description: "Student account created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({
    status: 409,
    description: "Conflict - Student already exists",
  })
  async create(@Body() data: CreateStudentDto) {
    return this.adminService.createStudentAccountService(data);
  }

  @Post("create/multiple")
  @ApiOperation({ summary: "Create multiple student accounts" })
  @ApiBody({ type: CreateMultipleStudentsDto })
  @ApiResponse({
    status: 201,
    description: "Student accounts created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async createMultiple(@Body() data: CreateMultipleStudentsDto) {
    return this.adminService.createMultipleStudentAccountsService(data);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "Update a student account" })
  @ApiParam({ name: "id", description: "Student account ID", type: String })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: "Student account updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Student not found" })
  async update(@Param("id") id: string, @Body() data: UpdateStudentDto) {
    return this.adminService.updateStudentAccountService(id, data);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "Delete a student account" })
  @ApiParam({ name: "id", description: "Student account ID", type: String })
  @ApiResponse({
    status: 200,
    description: "Student account deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Student not found" })
  async delete(@Param("id") id: string) {
    return this.adminService.deleteStudentAccountService(id);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete multiple student accounts" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { ids: { type: "array", items: { type: "string" } } },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Student accounts deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async deleteMultiple(@Body("ids") ids: string[]) {
    return this.adminService.deleteMultipleStudentAccountsService(ids);
  }
}
