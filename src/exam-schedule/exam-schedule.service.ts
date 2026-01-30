import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExamSchedule, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExamScheduleService {
  private readonly logger = new Logger(ExamScheduleService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(includeCourseOnSemester = false): Promise<ExamSchedule[]> {
    return await this.prisma.examSchedule.findMany({
      include: {
        courseOnSemester: includeCourseOnSemester
          ? {
              include: {
                course: true,
                semester: true,
                lecturer: true,
              },
            }
          : false,
      },
    });
  }

  async findById(
    id: string,
    includeCourseOnSemester = false,
  ): Promise<ExamSchedule> {
    const examSchedule = await this.prisma.examSchedule.findUnique({
      where: { id },
      include: {
        courseOnSemester: includeCourseOnSemester
          ? {
              include: {
                course: true,
                semester: true,
                lecturer: true,
              },
            }
          : false,
      },
    });
    if (!examSchedule) {
      throw new NotFoundException('Exam schedule not found');
    }
    return examSchedule;
  }

  async findByStudentId(
    studentId: string,
    semesterId?: string,
  ): Promise<ExamSchedule[]> {
    const whereClause: Prisma.ExamScheduleWhereInput = {
      courseOnSemester: {
        enrollments: {
          some: {
            studentId,
          },
        },
        ...(semesterId && { semesterId }),
      },
    };

    return await this.prisma.examSchedule.findMany({
      where: whereClause,
      include: {
        courseOnSemester: {
          include: {
            course: true,
            semester: true,
            lecturer: true,
          },
        },
      },
    });
  }

  async findByLecturerId(lecturerId: string): Promise<ExamSchedule[]> {
    return await this.prisma.examSchedule.findMany({
      where: {
        courseOnSemester: {
          lecturerId,
        },
      },
      include: {
        courseOnSemester: {
          include: {
            course: true,
            semester: true,
          },
        },
      },
    });
  }

  async findByCourseOnSemesterId(
    courseOnSemesterId: string,
    includeCourseOnSemester = false,
  ): Promise<ExamSchedule | null> {
    try {
      return await this.prisma.examSchedule.findUnique({
        where: { courseOnSemesterId },
        include: {
          courseOnSemester: includeCourseOnSemester,
        },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve exam schedule', error.stack);
      return null;
    }
  }

  async create(data: Prisma.ExamScheduleCreateInput): Promise<ExamSchedule> {
    try {
      const examSchedule = await this.prisma.examSchedule.create({
        data,
        include: {
          courseOnSemester: {
            include: {
              course: true,
              semester: true,
            },
          },
        },
      });

      this.eventEmitter.emit('exam_schedule.created', examSchedule);

      return examSchedule;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Course on semester not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Exam schedule already exists for this course semester',
        );
      }
      this.logger.error('Failed to create exam schedule', error);
      throw new BadRequestException('Failed to create exam schedule');
    }
  }

  async createByLecturer(
    lecturerId: string,
    courseOnSemesterId: string,
    data: {
      examDate?: string;
      startTime?: Date;
      endTime?: Date;
      location?: string;
      description?: string;
    },
  ): Promise<ExamSchedule> {
    try {
      // Create exam schedule only if lecturer owns the course (single query)
      const examSchedule = await this.prisma.examSchedule.create({
        data: {
          courseOnSemester: {
            connect: {
              id: courseOnSemesterId,
              lecturerId: lecturerId,
            },
          },
          examDate: data.examDate,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          description: data.description,
        },
        include: {
          courseOnSemester: {
            include: {
              course: true,
              semester: true,
            },
          },
        },
      });

      this.eventEmitter.emit('exam_schedule.created', examSchedule);

      return examSchedule;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Course on semester not found or you are not authorized',
        );
      }
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Exam schedule already exists for this course semester',
        );
      }
      this.logger.error('Failed to create exam schedule', error);
      throw new BadRequestException('Failed to create exam schedule');
    }
  }

  async updateByLecturer(
    lecturerId: string,
    id: string,
    data: {
      examDate?: string;
      startTime?: Date;
      endTime?: Date;
      location?: string;
      description?: string;
    },
  ): Promise<ExamSchedule> {
    try {
      // Update exam schedule only if lecturer owns the course (single query)
      const result = await this.prisma.examSchedule.updateMany({
        where: {
          id,
          courseOnSemester: {
            lecturerId,
          },
        },
        data: {
          examDate: data.examDate,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          description: data.description,
        },
      });

      if (result.count === 0) {
        throw new NotFoundException('Exam schedule not found');
      }

      const updatedExamSchedule = await this.findById(id, true);

      // Emit event for exam schedule updated
      const courseName =
        (updatedExamSchedule as any).courseOnSemester?.course?.name ||
        'Unknown Course';
      this.eventEmitter.emit(
        'exam_schedule.updated',
        updatedExamSchedule,
        courseName,
      );

      return updatedExamSchedule;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to update exam schedule', error);
      throw new BadRequestException('Failed to update exam schedule');
    }
  }

  async deleteByLecturer(
    lecturerId: string,
    id: string,
  ): Promise<{ count: number }> {
    try {
      // Get exam schedule with course info before deleting for event emission
      const examSchedule = await this.prisma.examSchedule.findFirst({
        where: {
          id,
          courseOnSemester: {
            lecturerId,
          },
        },
        include: {
          courseOnSemester: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!examSchedule) {
        throw new NotFoundException(
          'Exam schedule not found or you are not authorized',
        );
      }

      const courseName =
        examSchedule.courseOnSemester?.course?.name || 'Unknown Course';
      const courseOnSemesterId = examSchedule.courseOnSemesterId;

      // Delete exam schedule only if lecturer owns the course (single query)
      const result = await this.prisma.examSchedule.deleteMany({
        where: {
          id,
          courseOnSemester: {
            lecturerId,
          },
        },
      });

      // Emit event for exam schedule deleted
      this.eventEmitter.emit(
        'exam_schedule.deleted',
        courseOnSemesterId,
        courseName,
      );

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete exam schedule', error);
      throw new BadRequestException('Failed to delete exam schedule');
    }
  }

  async createMany(
    data: Prisma.ExamScheduleCreateManyInput[],
  ): Promise<{ count: number }> {
    try {
      const result = await this.prisma.examSchedule.createMany({
        data,
      });
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Course on semester not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'One or more exam schedules already exist for their course semesters',
        );
      }
      this.logger.error('Failed to create exam schedules', error);
      throw new BadRequestException('Failed to create exam schedules');
    }
  }

  async update(
    id: string,
    data: Prisma.ExamScheduleUpdateInput,
  ): Promise<ExamSchedule> {
    try {
      const updatedExamSchedule = await this.prisma.examSchedule.update({
        where: { id },
        data,
        include: {
          courseOnSemester: {
            include: {
              course: true,
            },
          },
        },
      });

      // Emit event for exam schedule updated
      const courseName =
        (updatedExamSchedule as any).courseOnSemester?.course?.name ||
        'Unknown Course';
      this.eventEmitter.emit(
        'exam_schedule.updated',
        updatedExamSchedule,
        courseName,
      );

      return updatedExamSchedule;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Exam schedule not found');
      }
      this.logger.error('Failed to update exam schedule', error);
      throw new BadRequestException('Failed to update exam schedule');
    }
  }

  async delete(id: string): Promise<ExamSchedule> {
    try {
      // Get exam schedule with course info before deleting
      const examSchedule = await this.prisma.examSchedule.findUnique({
        where: { id },
        include: {
          courseOnSemester: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!examSchedule) {
        throw new NotFoundException('Exam schedule not found');
      }

      const courseName =
        examSchedule.courseOnSemester?.course?.name || 'Unknown Course';
      const courseOnSemesterId = examSchedule.courseOnSemesterId;

      const deletedExamSchedule = await this.prisma.examSchedule.delete({
        where: { id },
      });

      // Emit event for exam schedule deleted
      this.eventEmitter.emit(
        'exam_schedule.deleted',
        courseOnSemesterId,
        courseName,
      );

      return deletedExamSchedule;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Exam schedule not found');
      }
      this.logger.error('Failed to delete exam schedule', error);
      throw new BadRequestException('Failed to delete exam schedule');
    }
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    try {
      const result = await this.prisma.examSchedule.deleteMany({
        where: { id: { in: ids } },
      });
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('One or more exam schedules not found');
      }
      this.logger.error('Failed to delete exam schedules', error);
      throw new BadRequestException('Failed to delete exam schedules');
    }
  }
}
