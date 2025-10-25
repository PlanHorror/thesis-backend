import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseSemesterService {
  constructor(private readonly prisma: PrismaService) {}
  async getAll(
    includeCourses = false,
    includeSemesters = false,
    courseId?: string,
    semesterId?: string,
  ) {
    return this.prisma.courseOnSemester.findMany({
      include: {
        course: includeCourses,
        semester: includeSemesters,
      },
      where: {
        ...(courseId && { courseId }),
        ...(semesterId && { semesterId }),
      },
    });
  }

  async getById(id: string, includeCourses = false, includeSemesters = false) {
    try {
      return this.prisma.courseOnSemester.findUnique({
        where: { id },
        include: {
          course: includeCourses,
          semester: includeSemesters,
        },
      });
    } catch (error) {
      throw new NotFoundException(`CourseSemester with ID ${id} not found`);
    }
  }

  async create(data: Prisma.CourseOnSemesterCreateInput) {
    try {
      return await this.prisma.courseOnSemester.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'This course is already assigned to this semester',
        );
      }
      throw new BadRequestException(
        `Error creating course on semester: ${error.message}`,
      );
    }
  }

  async update(id: string, data: Prisma.CourseOnSemesterUpdateInput) {
    try {
      return await this.prisma.courseOnSemester.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`CourseSemester with ID ${id} not found`);
      }
      throw new BadRequestException(
        `Error updating course on semester: ${error.message}`,
      );
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.courseOnSemester.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`CourseSemester with ID ${id} not found`);
      }
      throw new BadRequestException(
        `Error deleting course on semester: ${error.message}`,
      );
    }
  }
}
