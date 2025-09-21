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
export class LecturerService {
  private logger = new Logger(LecturerService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.lecturer.findMany();
  }

  async findOne(id: string) {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { id },
      });
      if (!lecturer) {
        throw new NotFoundException('Lecturer not found');
      }
      return lecturer;
    } catch (error) {
      this.logger.error('Failed to retrieve lecturer', error.stack);
      throw new NotFoundException('Lecturer not found');
    }
  }

  async findByEmail(email: string) {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { email },
      });
      if (!lecturer) {
        throw new NotFoundException('Lecturer not found');
      }
      return lecturer;
    } catch (error) {
      this.logger.error('Failed to retrieve lecturer', error.stack);
      throw new NotFoundException('Lecturer not found');
    }
  }

  async findByUsername(username: string) {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { username },
      });
      if (!lecturer) {
        throw new NotFoundException('Lecturer not found');
      }
      return lecturer;
    } catch (error) {
      this.logger.error('Failed to retrieve lecturer', error.stack);
      throw new NotFoundException('Lecturer not found');
    }
  }

  async create(data: Prisma.LecturerCreateInput) {
    try {
      return await this.prisma.lecturer.create({
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
      this.logger.error('Failed to create ', error.stack);
      throw new BadRequestException('Failed to create ');
    }
  }

  async update(id: string, data: Prisma.LecturerUpdateInput) {
    try {
      return await this.prisma.lecturer.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(` with ID ${id} not found`);
          throw new NotFoundException(' not found');
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
      this.logger.error('Failed to update ', error.stack);
      throw new BadRequestException('Failed to update ');
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.lecturer.delete({
        where: { id },
      });
      return { message: 'Lecturer deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Lecturer with ID ${id} not found`);
          throw new NotFoundException('Lecturer not found');
        }
      }
      this.logger.error('Failed to delete lecturer', error.stack);
      throw new BadRequestException('Failed to delete lecturer');
    }
  }
}
