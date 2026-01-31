import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import {
  CreateDepartmentDto,
  CreateMultipleDepartmentsDto,
  UpdateDepartmentDto,
} from '../dto/department.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Departments')
@Controller('admin/department')
export class DepartmentController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({
    status: 200,
    description: 'List of all departments retrieved successfully',
  })
  async findAll() {
    return this.adminService.getAllDepartmentsService();
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id') id: string) {
    return this.adminService.getDepartmentByIdService(id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Department already exists',
  })
  async create(@Body() data: CreateDepartmentDto) {
    return this.adminService.createDepartmentService(data);
  }

  @Post('create/multiple')
  @ApiOperation({ summary: 'Create multiple departments' })
  @ApiBody({ type: CreateMultipleDepartmentsDto })
  @ApiResponse({ status: 201, description: 'Departments created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async createMultiple(@Body() data: CreateMultipleDepartmentsDto) {
    return this.adminService.createMultipleDepartmentsService(data);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiParam({ name: 'id', description: 'Department ID', type: String })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async update(@Param('id') id: string, @Body() data: UpdateDepartmentDto) {
    return this.adminService.updateDepartmentService(id, data);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiParam({ name: 'id', description: 'Department ID', type: String })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async delete(@Param('id') id: string) {
    return this.adminService.deleteDepartmentService(id);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete multiple departments' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ids: { type: 'array', items: { type: 'string' } } },
    },
  })
  @ApiResponse({ status: 200, description: 'Departments deleted successfully' })
  async deleteMultiple(@Body('ids') ids: string[]) {
    return this.adminService.deleteMultipleDepartmentsService(ids);
  }
}
