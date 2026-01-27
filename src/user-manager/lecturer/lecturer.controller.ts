import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LecturerService } from './lecturer.service';
import {
  LecturerUpdateAccountDto,
  UpdateLecturerDto,
} from 'src/admin/dto/lecturer.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role, RoleGuard } from 'common';
import { GetUser } from 'common/decorator';
import type { Lecturer } from '@prisma/client';

@Controller('lecturer')
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Get('all')
  async getAllLecturers() {
    return this.lecturerService.findAll();
  }

  @Get('/:id')
  async getLecturerById(@Query('id') id: string) {
    return this.lecturerService.findById(id);
  }

  @Patch('update')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  async updateLecturer(
    @Body() data: LecturerUpdateAccountDto,
    @GetUser() lecturer: Lecturer,
  ) {
    return this.lecturerService.lecturerUpdateAccount(data, lecturer);
  }
}
