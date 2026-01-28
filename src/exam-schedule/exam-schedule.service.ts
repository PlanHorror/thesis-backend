import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ExamSchedule, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExamScheduleService {
  private readonly logger = new Logger(ExamScheduleService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeCourseOnSemester = false): Promise<ExamSchedule[]> {
    return await this.prisma.examSchedule.findMany({
      include: {
        courseOnSemester: includeCourseOnSemester,
      },
    });
  }

  async findById(
    id: string,
    includeCourseOnSemester = false,
  ): Promise<ExamSchedule> {
    try {
      const examSchedule = await this.prisma.examSchedule.findUnique({
        where: { id },
        include: {
          courseOnSemester: includeCourseOnSemester,
        },
      });
      if (!examSchedule) {
        throw new NotFoundException('Exam schedule not found');
      }
      return examSchedule;
    } catch (error) {
      this.logger.error('Failed to retrieve exam schedule', error.stack);
      throw new NotFoundException('Exam schedule not found');
    }
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
      return await this.prisma.examSchedule.create({
        data,
      });
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
      return await this.prisma.examSchedule.update({
        where: { id },
        data,
      });
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
      return await this.prisma.examSchedule.delete({
        where: { id },
      });
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
