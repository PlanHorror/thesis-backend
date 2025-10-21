import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Course, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Course[]> {
    return this.prisma.course.findMany();
  }

  async findOne(id: string): Promise<Course> {
    try {
      const course = await this.prisma.course.findUnique({ where: { id } });
      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      return course;
    } catch (error) {
      this.logger.error('Failed to retrieve course', error.stack);
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  async create(data: Prisma.CourseCreateInput): Promise<Course> {
    try {
      return await this.prisma.course.create({ data });
    } catch (error) {
      this.logger.error('Failed to create course', error.stack);
      throw new BadRequestException('Error creating course');
    }
  }

  async createMany(
    courses: Prisma.CourseCreateManyInput[],
  ): Promise<{ message: string }> {
    try {
      await this.prisma.course.createMany({ data: courses });
      return { message: 'Courses created successfully' };
    } catch (error) {
      this.logger.error('Failed to create courses', error.stack);
      throw new BadRequestException('Error creating courses');
    }
  }

  async update(id: string, data: Prisma.CourseUpdateInput): Promise<Course> {
    try {
      return await this.prisma.course.update({ where: { id }, data });
    } catch (error) {
      this.logger.error('Failed to update course', error.stack);
      throw new BadRequestException('Error updating course');
    }
  }

  async remove(id: string): Promise<Course> {
    try {
      return await this.prisma.course.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to delete course', error.stack);
      throw new BadRequestException('Error deleting course');
    }
  }

  async removeMany(ids: string[]): Promise<{ message: string }> {
    try {
      await this.prisma.course.deleteMany({
        where: { id: { in: ids } },
      });
      return { message: 'Courses deleted successfully' };
    } catch (error) {
      this.logger.error('Failed to delete courses', error.stack);
      throw new BadRequestException('Error deleting courses');
    }
  }
}
