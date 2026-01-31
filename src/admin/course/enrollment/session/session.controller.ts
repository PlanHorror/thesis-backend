import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';
import {
  CreateEnrollmentSessionDto,
  CreateMultipleEnrollmentSessionsDto,
  UpdateEnrollmentSessionDto,
} from 'src/admin/dto/enrollment-session.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Enrollment Sessions')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/enrollment/session')
export class SessionController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all enrollment sessions' })
  @ApiResponse({
    status: 200,
    description: 'List of all enrollment sessions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllEnrollmentSessions() {
    return this.adminService.getAllEnrollmentSessionsService();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment session by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment session ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Enrollment session retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Enrollment session not found' })
  async getEnrollmentSessionById(@Param('id') id: string) {
    return this.adminService.getEnrollmentSessionByIdService(id);
  }

  @Get('semester/:semesterId')
  @ApiOperation({ summary: 'Get enrollment sessions by semester ID' })
  @ApiParam({ name: 'semesterId', description: 'Semester ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Enrollment sessions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async getEnrollmentSessionsBySemesterId(
    @Param('semesterId') semesterId: string,
  ) {
    return this.adminService.getEnrollmentSessionsBySemesterIdService(
      semesterId,
    );
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new enrollment session' })
  @ApiBody({ type: CreateEnrollmentSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Enrollment session created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Session already exists',
  })
  async createEnrollmentSession(@Body() data: CreateEnrollmentSessionDto) {
    return this.adminService.createEnrollmentSessionService(data);
  }

  @Post('create-multiple')
  @ApiOperation({ summary: 'Create multiple enrollment sessions' })
  @ApiBody({ type: CreateMultipleEnrollmentSessionsDto })
  @ApiResponse({
    status: 201,
    description: 'Enrollment sessions created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createMultipleEnrollmentSessions(
    @Body() data: CreateMultipleEnrollmentSessionsDto,
  ) {
    return this.adminService.createMultipleEnrollmentSessionsService(data);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update an enrollment session' })
  @ApiParam({ name: 'id', description: 'Enrollment session ID', type: String })
  @ApiBody({ type: UpdateEnrollmentSessionDto })
  @ApiResponse({
    status: 200,
    description: 'Enrollment session updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Enrollment session not found' })
  async updateEnrollmentSession(
    @Param('id') id: string,
    @Body() data: UpdateEnrollmentSessionDto,
  ) {
    return this.adminService.updateEnrollmentSessionService(id, data);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete an enrollment session' })
  @ApiParam({ name: 'id', description: 'Enrollment session ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Enrollment session deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Enrollment session not found' })
  async deleteEnrollmentSession(@Param('id') id: string) {
    return this.adminService.deleteEnrollmentSessionService(id);
  }

  @Delete('delete-multiple')
  @ApiOperation({ summary: 'Delete multiple enrollment sessions' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ids: { type: 'array', items: { type: 'string' } } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment sessions deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteMultipleEnrollmentSessions(@Body() data: { ids: string[] }) {
    return this.adminService.deleteMultipleEnrollmentSessionsService(data.ids);
  }
}
