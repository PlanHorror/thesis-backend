import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { isBoolean } from 'class-validator';
import { AdminService } from '../admin.service';
import { CreateSemesterDto, UpdateSemesterDto } from '../dto/semester.dto';

@Controller('admin/semester')
export class SemesterController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async findAll(
    @Query('includeCourses') includeCourses?: boolean,
    @Query('includeDocuments') includeDocuments?: boolean,
    @Query('includeCourse') includeCourse?: boolean,
  ) {
    return await this.adminService.getAllSemestersService(
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeDocuments) ? includeDocuments : false,
      isBoolean(includeCourse) ? includeCourse : false,
    );
  }

  @Get('find/:id')
  async findById(
    @Param('id') id: string,
    @Query('includeCourses') includeCourses?: boolean,
    @Query('includeDocuments') includeDocuments?: boolean,
    @Query('includeCourse') includeCourse?: boolean,
  ) {
    return await this.adminService.getSemesterByIdService(
      id,
      isBoolean(includeCourses) ? includeCourses : false,
      isBoolean(includeDocuments) ? includeDocuments : false,
      isBoolean(includeCourse) ? includeCourse : false,
    );
  }

  @Post('create')
  async create(@Body() data: CreateSemesterDto) {
    return await this.adminService.createSemesterService(data);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateSemesterDto) {
    return await this.adminService.updateSemesterService(id, data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.adminService.deleteSemesterService(id);
  }

  @Delete('delete')
  async deleteMany(@Query('ids') ids: string) {
    return await this.adminService.deleteManySemestersService(ids.split(','));
  }
}
