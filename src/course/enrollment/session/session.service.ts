import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnrollmentSession, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(includeSemester = false): Promise<EnrollmentSession[]> {
    return await this.prisma.enrollmentSession.findMany({
      include: {
        semester: includeSemester,
      },
    });
  }

  async findById(
    id: string,
    includeSemester = false,
  ): Promise<EnrollmentSession> {
    try {
      const session = await this.prisma.enrollmentSession.findUnique({
        where: { id },
        include: {
          semester: includeSemester,
        },
      });
      if (!session) {
        throw new NotFoundException('Enrollment session not found');
      }
      return session;
    } catch (error) {
      this.logger.error('Failed to retrieve enrollment session', error.stack);
      throw new NotFoundException('Enrollment session not found');
    }
  }

  async findBySemesterId(
    semesterId: string,
    includeSemester = false,
  ): Promise<EnrollmentSession[]> {
    try {
      return await this.prisma.enrollmentSession.findMany({
        where: { semesterId },
        include: {
          semester: includeSemester,
        },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve enrollment sessions', error.stack);
      throw new NotFoundException('Enrollment sessions not found');
    }
  }

  async create(
    data: Prisma.EnrollmentSessionCreateInput,
  ): Promise<EnrollmentSession> {
    try {
      const session = await this.prisma.enrollmentSession.create({
        data,
        include: { semester: true },
      });

      // Emit event if session is active and within time range
      const now = new Date();
      if (
        session.isActive &&
        session.startDate <= now &&
        session.endDate >= now
      ) {
        this.eventEmitter.emit(
          'enrollment_session.opened',
          session,
          session.semester?.name || 'Unknown Semester',
        );
      }

      return session;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Semester not found');
      }
      this.logger.error('Failed to create enrollment session', error);
      throw new BadRequestException('Failed to create enrollment session');
    }
  }

  async createMany(
    sessions: Prisma.EnrollmentSessionCreateManyInput[],
  ): Promise<{ message: string }> {
    try {
      await this.prisma.enrollmentSession.createMany({
        data: sessions,
        skipDuplicates: true,
      });
      return { message: 'Enrollment sessions created successfully' };
    } catch (error) {
      this.logger.error('Failed to create enrollment sessions', error.stack);
      throw new BadRequestException('Failed to create enrollment sessions');
    }
  }

  async update(
    id: string,
    data: Prisma.EnrollmentSessionUpdateInput,
  ): Promise<EnrollmentSession> {
    try {
      return await this.prisma.enrollmentSession.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Enrollment session not found');
      }
      this.logger.error('Failed to update enrollment session', error);
      throw new BadRequestException('Failed to update enrollment session');
    }
  }

  async delete(id: string): Promise<EnrollmentSession> {
    try {
      return await this.prisma.enrollmentSession.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Enrollment session not found');
      }
      this.logger.error('Failed to delete enrollment session', error);
      throw new BadRequestException('Failed to delete enrollment session');
    }
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    try {
      const result = await this.prisma.enrollmentSession.deleteMany({
        where: { id: { in: ids } },
      });
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'One or more enrollment sessions not found',
        );
      }
      this.logger.error('Failed to delete enrollment sessions', error);
      throw new BadRequestException('Failed to delete enrollment sessions');
    }
  }

  // Public endpoints - for students and lecturers (only active sessions)
  async findAllActive(includeSemester = false): Promise<EnrollmentSession[]> {
    return await this.prisma.enrollmentSession.findMany({
      where: { isActive: true },
      include: {
        semester: includeSemester,
      },
    });
  }

  async findByIdActive(
    id: string,
    includeSemester = false,
  ): Promise<EnrollmentSession> {
    try {
      const session = await this.prisma.enrollmentSession.findUnique({
        where: { id },
        include: {
          semester: includeSemester,
        },
      });
      if (!session) {
        throw new NotFoundException('Enrollment session not found');
      }
      if (!session.isActive) {
        throw new NotFoundException('Enrollment session not found');
      }
      return session;
    } catch (error) {
      this.logger.error('Failed to retrieve enrollment session', error.stack);
      throw new NotFoundException('Enrollment session not found');
    }
  }

  async findBySemesterIdActive(
    semesterId: string,
    includeSemester = false,
  ): Promise<EnrollmentSession[]> {
    try {
      return await this.prisma.enrollmentSession.findMany({
        where: { semesterId, isActive: true },
        include: {
          semester: includeSemester,
        },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve enrollment sessions', error.stack);
      throw new NotFoundException('Enrollment sessions not found');
    }
  }

  // Check if current time is within an active enrollment session
  async isEnrollmentTimeValid(semesterId?: string): Promise<boolean> {
    try {
      const now = new Date();
      const where: any = {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      };

      if (semesterId) {
        where.semesterId = semesterId;
      }

      const validSession = await this.prisma.enrollmentSession.findFirst({
        where,
      });

      return validSession !== null;
    } catch (error) {
      this.logger.error(
        'Failed to check enrollment time validity',
        error.stack,
      );
      return false;
    }
  }
}
