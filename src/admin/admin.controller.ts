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
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';
import { CreateAdminDto, UpdateAdminDto } from './dto/admin.dto';
import { SeedService } from './seed/seed.service';

@UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.ADMIN]))
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly seedService: SeedService,
  ) {}

  @Post('seed')
  async seed() {
    return this.seedService.seed();
  }

  @Get('all')
  async findAll() {
    return this.adminService.findAll();
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return this.adminService.findById(id);
  }

  @Post('create')
  async create(@Body() data: CreateAdminDto) {
    return this.adminService.create(data);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateAdminDto) {
    return this.adminService.update(id, data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return this.adminService.delete(id);
  }
}
