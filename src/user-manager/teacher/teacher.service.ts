import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeacherService {
  private logger = new Logger(TeacherService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.teacher.findMany();
  }

  async findOne(id: string) {
    try {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id },
      });
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
      return teacher;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Teacher with ID ${id} not found`);
          throw new NotFoundException('Teacher not found');
        }
      }
      this.logger.error('Failed to retrieve teacher', error.stack);
      throw new NotFoundException('Teacher not found');
    }
  }

  async create(data: Prisma.TeacherCreateInput) {
    try {
      return await this.prisma.teacher.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          if (Array.isArray(error.meta?.target)) {
            if (
              error.meta.target.includes('email') &&
              error.meta.target.includes('username')
            ) {
              this.logger.warn(
                `Email ${data.email} and Username ${data.username} already exist`,
              );
              throw new ConflictException('Email and username already exist');
            }
            if (error.meta.target.includes('email')) {
              this.logger.warn(`Email ${data.email} already exists`);
              throw new ConflictException('Email already exists');
            }
            if (error.meta.target.includes('username')) {
              this.logger.warn(`Username ${data.username} already exists`);
              throw new ConflictException('Username already exists');
            }
          }
        }
      }
      this.logger.error('Failed to create teacher', error.stack);
      throw new BadRequestException('Failed to create teacher');
    }
  }

  async update(id: string, data: Prisma.TeacherUpdateInput) {
    try {
      return await this.prisma.teacher.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Teacher with ID ${id} not found`);
          throw new NotFoundException('Teacher not found');
        }
        if (error.code === 'P2002') {
          if (Array.isArray(error.meta?.target)) {
            if (
              error.meta.target.includes('email') &&
              error.meta.target.includes('username')
            ) {
              this.logger.warn(
                `Email ${typeof data.email === 'string' ? data.email : ''} and Username ${typeof data.username === 'string' ? data.username : ''} already exist`,
              );
              throw new ConflictException('Email and username already exist');
            }
            if (error.meta.target.includes('email')) {
              this.logger.warn(
                `Email ${typeof data.email === 'string' ? data.email : ''} already exists`,
              );
              throw new ConflictException('Email already exists');
            }
            if (error.meta.target.includes('username')) {
              this.logger.warn(
                `Username ${typeof data.username === 'string' ? data.username : ''} already exists`,
              );
              throw new ConflictException('Username already exists');
            }
          }
        }
      }
      this.logger.error('Failed to update teacher', error.stack);
      throw new BadRequestException('Failed to update teacher');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.teacher.delete({
        where: { id },
      });
      return { message: 'Teacher deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Teacher with ID ${id} not found`);
          throw new NotFoundException('Teacher not found');
        }
      }
      this.logger.error('Failed to delete teacher', error.stack);
      throw new BadRequestException('Failed to delete teacher');
    }
  }
}
