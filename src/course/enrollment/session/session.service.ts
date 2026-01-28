import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentSession, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  constructor(private readonly prisma: PrismaService) {}

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
      return await this.prisma.enrollmentSession.create({
        data,
      });
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
}
