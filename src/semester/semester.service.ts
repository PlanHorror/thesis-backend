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

  async getAll(includeCourses = false, includeDocuments = false) {
    if (includeDocuments && !includeCourses) {
      throw new BadRequestException(
        'Cannot include documents without including courses',
      );
    }
    return await this.prisma.semester.findMany({
      include: {
        courseOnSemesters: includeCourses
          ? {
              include: {
                course: includeDocuments
                  ? {
                      include: {
                        documents: true,
                      },
                    }
                  : true,
              },
            }
          : false,
      },
    });
  }

  async getById(id: string, includeCourses = false, includeDocuments = false) {
    if (includeDocuments && !includeCourses) {
      throw new BadRequestException(
        'Cannot include documents without including courses',
      );
    }
    try {
      return await this.prisma.semester.findUnique({
        where: { id },
        include: {
          courseOnSemesters: includeCourses
            ? {
                include: {
                  course: includeDocuments
                    ? {
                        include: {
                          documents: true,
                        },
                      }
                    : true,
                },
              }
            : false,
        },
      });
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
}
