import { Controller, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'common/guard/role.guard';
import { Role } from 'common';

@UseGuards(AuthGuard('admin-jwt'), new RoleGuard([Role.ADMIN]))
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
}
