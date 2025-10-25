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

@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin/lecturer')
export class LecturerController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async findAll() {
    return this.adminService.getAllLecturerAccountsService();
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return this.adminService.getLecturerAccountByIdService(id);
  }

  @Post('create')
  async create(@Body() data: CreateLecturerDto) {
    return this.adminService.createLecturerAccountService(data);
  }
  @Post('create/multiple')
  async createMultiple(@Body() data: CreateMultipleLecturersDto) {
    return this.adminService.createMultipleLecturerAccountsService(data);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateLecturerDto) {
    return this.adminService.updateLecturerAccountService(id, data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return this.adminService.deleteLecturerAccountService(id);
  }

  @Delete('delete')
  async deleteMultiple(@Query('ids') ids: string) {
    return this.adminService.deleteMultipleLecturerAccountsService(
      ids.split(','),
    );
  }
}
