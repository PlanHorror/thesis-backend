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

@Controller('admin/department')
export class DepartmentController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async findAll() {
    return this.adminService.getAllDepartmentsService();
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return this.adminService.getDepartmentByIdService(id);
  }

  @Post('create')
  async create(@Body() data: CreateDepartmentDto) {
    return this.adminService.createDepartmentService(data);
  }

  @Post('create/multiple')
  async createMultiple(@Body() data: CreateMultipleDepartmentsDto) {
    return this.adminService.createMultipleDepartmentsService(data);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateDepartmentDto) {
    return this.adminService.updateDepartmentService(id, data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return this.adminService.deleteDepartmentService(id);
  }

  @Delete('delete')
  async deleteMultiple(@Body('ids') ids: string[]) {
    return this.adminService.deleteMultipleDepartmentsService(ids);
  }
}
