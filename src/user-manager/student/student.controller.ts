import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import { AuthGuard } from '@nestjs/passport';
import { Role, RoleGuard } from 'common';
import { GetUser } from 'common/decorator';
import type { Student } from '@prisma/client';
import { StudentUpdateAccountDto } from 'src/admin/dto/student.dto';

@ApiTags('Students')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({
    status: 200,
    description: 'List of all students returned successfully',
  })
  async getAllStudents() {
    return this.studentService.findAll();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiQuery({ name: 'id', description: 'Student ID', required: true })
  @ApiResponse({ status: 200, description: 'Student found successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentById(@Query('id') id: string) {
    return this.studentService.findById(id);
  }

  @Patch('update')
  @UseGuards(AuthGuard('accessToken'), new RoleGuard([Role.STUDENT]))
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Update student account' })
  @ApiBody({ type: StudentUpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Student account updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  async updateStudent(
    @Body() data: StudentUpdateAccountDto,
    @GetUser() student: Student,
  ) {
    return this.studentService.studentUpdateAccount(data, student);
  }
}
