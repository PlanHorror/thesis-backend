import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Admin, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentService } from 'src/user-manager/student/student.service';
import { LecturerService } from 'src/user-manager/lecturer/lecturer.service';
import { CreateStudentDto } from './dto/student.dto';
import { DepartmentService } from 'src/department/department.service';
import * as bcrypt from 'bcrypt';
import {
  CreateDepartmentDto,
  CreateMultipleDepartmentsDto,
  UpdateDepartmentDto,
} from './dto/department.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentService: StudentService,
    private readonly lecturerService: LecturerService,
    private readonly departmentService: DepartmentService,
  ) {}

  async findAll(): Promise<Admin[]> {
    return this.prisma.admin.findMany();
  }

  async findOne(id: string): Promise<Admin> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id },
      });
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
      return admin;
    } catch (error) {
      this.logger.error('Failed to retrieve admin', error.stack);
      throw new NotFoundException('Admin not found');
    }
  }

  async findByUsername(username: string): Promise<Admin> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { username },
      });
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
      return admin;
    } catch (error) {
      this.logger.error('Failed to retrieve admin', error.stack);
      throw new NotFoundException('Admin not found');
    }
  }

  async create(data: Prisma.AdminCreateInput): Promise<Admin> {
    try {
      return await this.prisma.admin.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(`Username ${data.username} already exists`);
          throw new ConflictException('Username already exists');
        }
      }
      this.logger.error('Failed to create admin', error.stack);
      throw new BadRequestException('Failed to create admin');
    }
  }

  async update(id: string, data: Prisma.AdminUpdateInput): Promise<Admin> {
    try {
      return await this.prisma.admin.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Admin with ID ${id} not found`);
          throw new NotFoundException('Admin not found');
        }
        if (error.code === 'P2002') {
          this.logger.warn(
            `Username ${typeof data.username === 'string' ? data.username : ''} already exists`,
          );
          throw new ConflictException('Username already exists');
        }
      }
      this.logger.error('Failed to update admin', error.stack);
      throw new BadRequestException('Failed to update admin');
    }
  }

  async delete(id: string): Promise<Admin> {
    try {
      return await this.prisma.admin.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Admin with ID ${id} not found`);
          throw new NotFoundException('Admin not found');
        }
      }
      this.logger.error('Failed to delete admin', error.stack);
      throw new BadRequestException('Failed to delete admin');
    }
  }

  /*
   * Admin services methods for managing departments
   */

  async getAllDepartmentsService() {
    return this.departmentService.findAll();
  }

  async getDepartmentByIdService(id: string) {
    return this.departmentService.findOne(id);
  }

  async createDepartmentService(data: CreateDepartmentDto) {
    return this.departmentService.create(data);
  }

  async createMultipleDepartmentsService(data: CreateMultipleDepartmentsDto) {
    return this.departmentService.createMany(data.departments);
  }

  async updateDepartmentService(id: string, data: UpdateDepartmentDto) {
    return this.departmentService.update(id, data);
  }

  async deleteDepartmentService(id: string) {
    return this.departmentService.remove(id);
  }

  async deleteMultipleDepartmentsService(ids: string[]) {
    return this.departmentService.removeMany(ids);
  }

  /*
   * Admin services methods for managing students
   */
}
