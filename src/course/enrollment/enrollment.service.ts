import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseSemesterService } from 'src/semester/course-semester/course-semester.service';
import { SessionService } from './session/session.service';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseSemesterService: CourseSemesterService,
    private readonly sessionService: SessionService,
  ) {}

  async findAll(
    includeStudent = false,
    includeCourseOnSemester = false,
    includeCourse = false,
    includeSemester = false,
    includeLecturer = false,
    studentId?: string,
    courseOnSemesterId?: string,
    lecturerId?: string,
  ) {
    if (
      !includeCourseOnSemester &&
      (includeCourse || includeSemester || includeLecturer)
    ) {
      throw new BadRequestException(
        'includeCourseOnSemester must be true if includeCourse, includeSemester, or includeLecturer is true',
      );
    }

    // Validate lecturer assignment to course semester if lecturerId is provided
    if (lecturerId && courseOnSemesterId) {
      const courseOnSemester = await this.prisma.courseOnSemester.findUnique({
        where: { id: courseOnSemesterId },
        select: { lecturerId: true },
      });
      if (!courseOnSemester || courseOnSemester.lecturerId !== lecturerId) {
        throw new BadRequestException(
          'Lecturer is not assigned to this course semester',
        );
      }
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

  async findOne(
    id: string,
    includeStudent = false,
    includeCourseOnSemester = false,
    includeCourse = false,
    includeSemester = false,
    includeLecturer = false,
  ) {
    if (
      !includeCourseOnSemester &&
      (includeCourse || includeSemester || includeLecturer)
    ) {
      throw new BadRequestException(
        'includeCourseOnSemester must be true if includeCourse, includeSemester, or includeLecturer is true',
      );
    }
    try {
      const enrollment = await this.prisma.studentCourseEnrollment.findUnique({
        where: { id },
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
      });
      if (!enrollment) {
        throw new NotFoundException(`Enrollment with ID ${id} not found`);
      }
      return enrollment;
    } catch (error) {
      this.logger.error('Failed to retrieve enrollment', error.stack);
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
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

  async checkDuplicateEnrollment(
    studentId: string,
    courseOnSemesterId: string,
  ) {
    const courseOnSemester =
      await this.courseSemesterService.findOne(courseOnSemesterId);

    const enrollment = await this.prisma.studentCourseEnrollment.findFirst({
      where: {
        studentId,
        OR: [
          { courseOnSemesterId },
          ...(courseOnSemester.endTime !== null &&
          courseOnSemester.startTime !== null
            ? [
                {
                  courseOnSemester: {
                    startTime: {
                      not: null,
                      lt: courseOnSemester.endTime,
                    },
                    endTime: {
                      not: null,
                      gt: courseOnSemester.startTime,
                    },
                  },
                },
              ]
            : []),
        ],
      },
    });
    return enrollment !== null;
  }

  async enrollStudentInCourse(student: Student, courseOnSemesterId: string) {
    // Check if current time is valid for enrollment
    const courseOnSemester =
      await this.courseSemesterService.findOne(courseOnSemesterId);
    const isEnrollmentTimeValid =
      await this.sessionService.isEnrollmentTimeValid(
        courseOnSemester.semesterId,
      );
    if (!isEnrollmentTimeValid) {
      throw new BadRequestException(
        'Enrollment is not available at this time. Please try during the enrollment period.',
      );
    }

    if (await this.checkDuplicateEnrollment(student.id, courseOnSemesterId)) {
      throw new ConflictException(
        `Student with ID ${student.id} is already enrolled in the course or has a time conflict.`,
      );
    }
    return this.create({
      student: { connect: { id: student.id } },
      courseOnSemester: { connect: { id: courseOnSemesterId } },
    });
  }

  async unenrollStudentFromCourse(student: Student, enrollmentId: string) {
    // Check if current time is valid for unenrollment
    const enrollment = await this.findOne(enrollmentId, false, true);
    const isEnrollmentTimeValid =
      await this.sessionService.isEnrollmentTimeValid(
        enrollment.courseOnSemester.semesterId,
      );
    if (!isEnrollmentTimeValid) {
      throw new BadRequestException(
        'Unenrollment is not available at this time. Please try during the enrollment period.',
      );
    }

    const deleteResult = await this.prisma.studentCourseEnrollment.deleteMany({
      where: {
        id: enrollmentId,
        studentId: student.id,
      },
    });

    if (deleteResult.count === 0) {
      throw new NotFoundException(
        `Enrollment with ID ${enrollmentId} not found for student with ID ${student.id}`,
      );
    }

    return deleteResult;
  }
}
