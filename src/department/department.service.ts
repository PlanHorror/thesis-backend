import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany();
  }

  async findOne(id: string) {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
      });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
      return department;
    } catch (error) {
      this.logger.error('Failed to retrieve department', error.stack);
      throw new NotFoundException('Department not found');
    }
  }

  async create(data: Prisma.DepartmentCreateInput) {
    try {
      return await this.prisma.department.create({
        data,
      });
    } catch (error) {
      this.logger.error('Failed to create department', error.stack);
      throw new BadRequestException('Failed to create department');
    }
  }

  async createMany(departments: Prisma.DepartmentCreateManyInput[]) {
    try {
      return await this.prisma.department.createMany({
        data: departments,
        skipDuplicates: true,
      });
    } catch (error) {
      this.logger.error('Failed to create departments', error.stack);
      throw new BadRequestException('Failed to create departments');
    }
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    try {
      await this.findOne(id);
      return await this.prisma.department.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error('Failed to update department', error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Department not found');
        }
      }
      throw new BadRequestException('Failed to update department');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return await this.prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Department not found');
        }
      }
      this.logger.error('Failed to delete department', error.stack);
      throw new BadRequestException('Failed to delete department');
    }
  }

  async removeMany(ids: string[]) {
    try {
      return await this.prisma.department.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('One or more departments not found');
        }
      }
      this.logger.error('Failed to delete departments', error.stack);
      throw new BadRequestException('Failed to delete departments');
    }
  }
}
