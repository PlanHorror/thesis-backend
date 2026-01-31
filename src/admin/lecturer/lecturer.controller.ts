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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'common/enum/role.enum';
import { RoleGuard } from 'common/guard/role.guard';
import { AdminService } from '../admin.service';
import {
  CreateLecturerDto,
  CreateMultipleLecturersDto,
  UpdateLecturerDto,
} from '../dto/lecturer.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Lecturers')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/lecturer')
export class LecturerController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all lecturer accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all lecturer accounts retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAll() {
    return this.adminService.getAllLecturerAccountsService();
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get lecturer account by ID' })
  @ApiParam({ name: 'id', description: 'Lecturer account ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lecturer account retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async findOne(@Param('id') id: string) {
    return this.adminService.getLecturerAccountByIdService(id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new lecturer account' })
  @ApiBody({ type: CreateLecturerDto })
  @ApiResponse({
    status: 201,
    description: 'Lecturer account created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Lecturer already exists',
  })
  async create(@Body() data: CreateLecturerDto) {
    return this.adminService.createLecturerAccountService(data);
  }

  @Post('create/multiple')
  @ApiOperation({ summary: 'Create multiple lecturer accounts' })
  @ApiBody({ type: CreateMultipleLecturersDto })
  @ApiResponse({
    status: 201,
    description: 'Lecturer accounts created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createMultiple(@Body() data: CreateMultipleLecturersDto) {
    return this.adminService.createMultipleLecturerAccountsService(data);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a lecturer account' })
  @ApiParam({ name: 'id', description: 'Lecturer account ID', type: String })
  @ApiBody({ type: UpdateLecturerDto })
  @ApiResponse({
    status: 200,
    description: 'Lecturer account updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async update(@Param('id') id: string, @Body() data: UpdateLecturerDto) {
    return this.adminService.updateLecturerAccountService(id, data);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a lecturer account' })
  @ApiParam({ name: 'id', description: 'Lecturer account ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lecturer account deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async delete(@Param('id') id: string) {
    return this.adminService.deleteLecturerAccountService(id);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete multiple lecturer accounts' })
  @ApiQuery({
    name: 'ids',
    description: 'Comma-separated list of lecturer IDs to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lecturer accounts deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteMultiple(@Query('ids') ids: string) {
    return this.adminService.deleteMultipleLecturerAccountsService(
      ids.split(','),
    );
  }
}
