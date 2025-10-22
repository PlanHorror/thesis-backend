import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { isBoolean } from 'class-validator';
import { CourseService } from 'src/course/course.service';
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto';
import { AdminService } from '../admin.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('admin/course')
export class CourseController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all')
  async getAllCourses() {
    return this.adminService.getAllCoursesService(true, true);
  }

  @Get('find/:id')
  async getCourseById(
    @Param('id') id: string,
    @Query('includeAttachments') includeAttachments: boolean,
    @Query('includeDepartment') includeDepartment: boolean,
  ) {
    return this.adminService.getCourseByIdService(
      id,
      isBoolean(includeAttachments) ? includeAttachments : false,
      isBoolean(includeDepartment) ? includeDepartment : false,
    );
  }

  @Get('department/:departmentId')
  async getCoursesByDepartmentId(
    @Param('departmentId') departmentId: string,
    @Query('includeAttachments') includeAttachments: boolean,
    @Query('includeDepartment') includeDepartment: boolean,
  ) {
    return this.adminService.getAllCoursesByDepartmentIdService(
      departmentId,
      isBoolean(includeAttachments) ? includeAttachments : false,
      isBoolean(includeDepartment) ? includeDepartment : false,
    );
  }

  @Post('create')
  @UseInterceptors(AnyFilesInterceptor())
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.adminService.createCourseService(createCourseDto, files);
  }

  @Patch('update/:id')
  @UseInterceptors(AnyFilesInterceptor())
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.adminService.updateCourseService(id, updateCourseDto, files);
  }

  @Delete('delete/:id')
  async deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourseService(id);
  }

  @Delete('delete/')
  async deleteManyCourses(@Query('ids') ids: string) {
    return this.adminService.deleteManyCoursesService(ids.split(','));
  }
}
