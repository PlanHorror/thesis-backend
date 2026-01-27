import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { AuthGuard } from '@nestjs/passport';
import { Role, RoleGuard } from 'common';
import { GetUser } from 'common/decorator';
import type { Student } from '@prisma/client';
import { StudentUpdateAccountDto } from 'src/admin/dto/student.dto';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('all')
  async getAllStudents() {
    return this.studentService.findAll();
  }

  @Get('/:id')
  async getStudentById(@Query('id') id: string) {
    return this.studentService.findById(id);
  }

  @Patch('update')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  async updateStudent(
    @Body() data: StudentUpdateAccountDto,
    @GetUser() student: Student,
  ) {
    return this.studentService.studentUpdateAccount(data, student);
  }
}
