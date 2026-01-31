import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Departments')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'))
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({
    status: 200,
    description: 'List of all departments returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllDepartments() {
    return await this.departmentService.findAll();
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentById(@Param('id') id: string) {
    return await this.departmentService.findById(id);
  }
}
