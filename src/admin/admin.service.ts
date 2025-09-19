import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Admin, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(private readonly prisma: PrismaService) {}

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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Admin with ID ${id} not found`);
          throw new NotFoundException('Admin not found');
        }
      }
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
      throw new NotFoundException('Failed to create admin');
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
      throw new NotFoundException('Failed to update admin');
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
      throw new NotFoundException('Failed to delete admin');
    }
  }
}
