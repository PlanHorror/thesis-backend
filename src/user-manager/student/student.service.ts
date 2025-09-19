import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Student[]> {
    return this.prismaService.student.findMany();
  }

  async findById(id: string): Promise<Student> {
    try {
      const student = await this.prismaService.student.findUnique({
        where: { id },
      });
      if (!student) {
        throw new NotFoundException('Account not found');
      }
      return student;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Account with ID ${id} not found`);
          throw new NotFoundException('Account not found');
        }
      }
      this.logger.error('Failed to retrieve account', error.stack);
      throw new NotFoundException('Account not found');
    }
  }

  async create(data: Prisma.StudentCreateInput): Promise<Student> {
    try {
      return await this.prismaService.student.create({
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
          } else {
            this.logger.error('Failed to create account', error.stack);
            throw new BadRequestException('Failed to create account');
          }
        } else {
          this.logger.error('Failed to create account', error.stack);
          throw new BadRequestException('Failed to create account');
        }
      }
      this.logger.error('Failed to create account', error.stack);
      throw new BadRequestException('Failed to create account');
    }
  }

  async update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    try {
      return await this.prismaService.student.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Account with ID ${id} not found`);
          throw new NotFoundException('Account not found');
        }
        if (error.code === 'P2002') {
          if (Array.isArray(error.meta?.target)) {
            if (
              error.meta.target.includes('email') &&
              error.meta.target.includes('username')
            ) {
              this.logger.warn(
                `Email ${
                  typeof data.email === 'string' ? data.email : ''
                } and Username ${typeof data.username === 'string' ? data.username : ''} already exist`,
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
      this.logger.error('Failed to update account', error.stack);
      throw new BadRequestException('Failed to update account');
    }
  }

  async delete(id: string) {
    try {
      return await this.prismaService.student.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Account with ID ${id} not found`);
          throw new NotFoundException('Account not found');
        }
      }
      this.logger.error('Failed to delete account', error.stack);
      throw new BadRequestException('Failed to delete account');
    }
  }
}
