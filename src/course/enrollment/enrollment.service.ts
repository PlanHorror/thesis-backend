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
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    includeStudent = false,
    includeCourseOnSemester = false,
    includeCourse = false,
    includeSemester = false,
    includeLecturer = false,
    studentId?: string,
    courseOnSemesterId?: string,
  ) {
    if (
      !includeCourseOnSemester &&
      (includeCourse || includeSemester || includeLecturer)
    ) {
      throw new BadRequestException(
        'includeCourseOnSemester must be true if includeCourse, includeSemester, or includeLecturer is true',
      );
    }
    return await this.prisma.studentCourseEnrollment.findMany({
      include: {
        student: includeStudent,
        courseOnSemester: includeCourseOnSemester
          ? {
              include: {
                course: includeCourse,
                semester: includeSemester,
                lecturer: includeLecturer,
              },
            }
          : false,
      },
      where: {
        ...(studentId && { studentId }),
        ...(courseOnSemesterId && { courseOnSemesterId }),
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.studentCourseEnrollment.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.StudentCourseEnrollmentCreateInput) {
    try {
      return await this.prisma.studentCourseEnrollment.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'The student is already enrolled in this course for the specified semester.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Either the student or the course on semester does not exist.',
        );
      }
      this.logger.error('Failed to create enrollment', error);
      throw new BadRequestException('Failed to create enrollment.');
    }
  }

  async update(id: string, data: Prisma.StudentCourseEnrollmentUpdateInput) {
    try {
      return await this.prisma.studentCourseEnrollment.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'The student is already enrolled in this course for the specified semester.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Enrollment not found.');
      }
      this.logger.error('Failed to update enrollment', error);
      throw new BadRequestException('Failed to update enrollment.');
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.studentCourseEnrollment.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Enrollment not found.');
      }
      this.logger.error('Failed to delete enrollment', error);
      throw new BadRequestException('Failed to delete enrollment.');
    }
  }

  async deleteMany(ids: string[]) {
    try {
      const deleteResult = await this.prisma.studentCourseEnrollment.deleteMany(
        {
          where: { id: { in: ids } },
        },
      );
      return deleteResult;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('One or more enrollments not found.');
      }
      this.logger.error('Failed to delete enrollments', error);
      throw new BadRequestException('Failed to delete enrollments.');
    }
  }
}
