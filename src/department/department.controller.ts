import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('accessToken'))
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('all')
  async getAllDepartments() {
    return await this.departmentService.findAll();
  }

  @Get('find/:id')
  async getDepartmentById(@Param('id') id: string) {
    return await this.departmentService.findById(id);
  }
}
