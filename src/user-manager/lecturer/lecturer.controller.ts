import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { LecturerService } from './lecturer.service';
import {
  LecturerUpdateAccountDto,
  UpdateLecturerDto,
} from 'src/admin/dto/lecturer.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role, RoleGuard } from 'common';
import { GetUser } from 'common/decorator';
import type { Lecturer } from '@prisma/client';

@ApiTags('Lecturers')
@Controller('lecturer')
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all lecturers' })
  @ApiResponse({
    status: 200,
    description: 'List of all lecturers returned successfully',
  })
  async getAllLecturers() {
    return this.lecturerService.findAll();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get lecturer by ID' })
  @ApiQuery({ name: 'id', description: 'Lecturer ID', required: true })
  @ApiResponse({ status: 200, description: 'Lecturer found successfully' })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async getLecturerById(@Query('id') id: string) {
    return this.lecturerService.findById(id);
  }

  @Patch('update')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.LECTURER]))
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Update lecturer account' })
  @ApiBody({ type: LecturerUpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Lecturer account updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Lecturer role required',
  })
  async updateLecturer(
    @Body() data: LecturerUpdateAccountDto,
    @GetUser() lecturer: Lecturer,
  ) {
    return this.lecturerService.lecturerUpdateAccount(data, lecturer);
  }
}
