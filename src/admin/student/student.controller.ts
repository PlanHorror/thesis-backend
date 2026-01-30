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
import { AdminService } from '../admin.service';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common/enum/role.enum';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateMultipleStudentsDto,
  CreateStudentDto,
  UpdateStudentDto,
} from '../dto/student.dto';

@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/student')
export class StudentController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async findAll() {
    return this.adminService.getAllStudentAccountsService();
  }

  @Get('/find/:id')
  async findOne(@Param('id') id: string) {
    return this.adminService.getStudentAccountByIdService(id);
  }

  @Get('/find')
  async findByEmail(
    @Query('email') email?: string,
    @Query('studentId') studentId?: string,
    @Query('username') username?: string,
    @Query('citizenId') citizenId?: string,
    @Query('phone') phone?: string,
  ) {
    return this.adminService.getStudentAccountByConditionService(
      email,
      studentId,
      username,
      citizenId,
      phone,
    );
  }

  @Post('create')
  async create(@Body() data: CreateStudentDto) {
    return this.adminService.createStudentAccountService(data);
  }

  @Post('create/multiple')
  async createMultiple(@Body() data: CreateMultipleStudentsDto) {
    return this.adminService.createMultipleStudentAccountsService(data);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateStudentDto) {
    return this.adminService.updateStudentAccountService(id, data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return this.adminService.deleteStudentAccountService(id);
  }

  @Delete('delete')
  async deleteMultiple(@Body('ids') ids: string[]) {
    return this.adminService.deleteMultipleStudentAccountsService(ids);
  }
}
