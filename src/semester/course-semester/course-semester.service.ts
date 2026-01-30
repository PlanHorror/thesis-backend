import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseSemesterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async findAll(
    includeCourses = false,
    includeSemesters = false,
    courseId?: string,
    semesterId?: string,
  ) {
    return await this.prisma.courseOnSemester.findMany({
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

  async findOne(id: string, includeCourses = false, includeSemesters = false) {
    try {
      const courseOnSemester = await this.prisma.courseOnSemester.findUnique({
        where: { id },
        include: {
          course: includeCourses,
          semester: includeSemesters,
        },
      });
      if (!courseOnSemester) {
        throw new NotFoundException(`CourseSemester with ID ${id} not found`);
      }
      return courseOnSemester;
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
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course or Semester not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'This course is already assigned to this semester',
        );
      }
      throw new BadRequestException(
        `Error creating course on semester: ${error.message}`,
      );
    }
  }

  async createMany(
    courseSemesters: Prisma.CourseOnSemesterCreateManyInput[],
  ): Promise<{ message: string }> {
    try {
      await this.prisma.courseOnSemester.createMany({
        data: courseSemesters,
        skipDuplicates: true,
      });
      return { message: 'CourseSemesters created successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course or Semester not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'One or more course-semester assignments already exist',
        );
      }
      throw new BadRequestException(
        `Error creating multiple course on semester: ${error.message}`,
      );
    }
  }

  async update(id: string, data: Prisma.CourseOnSemesterUpdateInput) {
    try {
      const updatedCourseSemester = await this.prisma.courseOnSemester.update({
        where: { id },
        data,
        include: {
          course: true,
        },
      });

      // Emit event for course semester updated
      const courseName =
        (updatedCourseSemester as any).course?.name || 'Unknown Course';
      this.eventEmitter.emit(
        'course_semester.updated',
        updatedCourseSemester,
        courseName,
      );

      return updatedCourseSemester;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`CourseSemester with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'This course is already assigned to this semester',
        );
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

  async deleteByCourseId(courseId: string) {
    try {
      return await this.prisma.courseOnSemester.deleteMany({
        where: { courseId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `No course-semester assignments found for courseId: ${courseId}`,
        );
      }
      throw new BadRequestException(
        `Error deleting course on semester by courseId: ${error.message}`,
      );
    }
  }

  async deleteBySemesterId(semesterId: string) {
    try {
      return await this.prisma.courseOnSemester.deleteMany({
        where: { semesterId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `No course-semester assignments found for semesterId: ${semesterId}`,
        );
      }
      throw new BadRequestException(
        `Error deleting course on semester by semesterId: ${error.message}`,
      );
    }
  }

  async deleteMany(ids: string[]) {
    try {
      return await this.prisma.courseOnSemester.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`No course-semester assignments found`);
      }
      throw new BadRequestException(
        `Error deleting multiple course on semester: ${error.message}`,
      );
    }
  }
}
