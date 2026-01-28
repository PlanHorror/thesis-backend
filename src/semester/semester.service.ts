import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SemesterService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    includeCoursesOnSemester = false,
    includeDocuments = false,
    includeCourse = false,
  ) {
    if (
      (includeDocuments && !includeCoursesOnSemester) ||
      (includeCourse && !includeCoursesOnSemester)
    ) {
      throw new BadRequestException(
        'Cannot include documents without including courses on semester',
      );
    }
    return await this.prisma.semester.findMany({
      include: {
        courseOnSemesters: includeCoursesOnSemester
          ? {
              include: {
                course: includeCourse,
                documents: includeDocuments,
              },
            }
          : false,
      },
    });
  }

  async findById(
    id: string,
    includeCoursesOnSemester = false,
    includeDocuments = false,
    includeCourse = false,
  ) {
    if (
      (includeDocuments && !includeCoursesOnSemester) ||
      (includeCourse && !includeCoursesOnSemester)
    ) {
      throw new BadRequestException(
        'Cannot include documents without including courses on semester',
      );
    }
    try {
      const semester = await this.prisma.semester.findUnique({
        where: { id },
        include: {
          courseOnSemesters: includeCoursesOnSemester
            ? {
                include: {
                  course: includeCourse,
                  documents: includeDocuments,
                },
              }
            : false,
        },
      });
      if (!semester) {
        throw new NotFoundException(`Semester with ID ${id} not found`);
      }
      return semester;
    } catch (error) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }
  }

  async create(data: Prisma.SemesterCreateInput) {
    try {
      return await this.prisma.semester.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Semester with the same name already exists',
        );
      }
      throw new BadRequestException('Failed to create semester');
    }
  }

  async update(id: string, data: Prisma.SemesterUpdateInput) {
    try {
      return await this.prisma.semester.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Semester with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to update semester');
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.semester.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Semester with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to delete semester');
    }
  }

  async deleteMany(ids: string[]) {
    try {
      await this.prisma.semester.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      return { message: 'Semesters deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`One or more semesters not found`);
      }
      throw new BadRequestException('Failed to delete semesters');
    }
  }
}
