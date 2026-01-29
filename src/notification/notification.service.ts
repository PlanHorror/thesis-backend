import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppGateway } from 'src/gateway/gateway.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateway: AppGateway,
  ) {}

  async findAll(): Promise<Notification[]> {
    return await this.prisma.notification.findMany({
      include: {
        student: true,
        lecturer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        student: true,
        lecturer: true,
      },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async findByUser(
    lecturerId?: string,
    studentId?: string,
  ): Promise<Notification[]> {
    if (!lecturerId && !studentId) {
      throw new BadRequestException(
        'Either lecturerId or studentId must be provided',
      );
    }
    const whereClause: Prisma.NotificationWhereInput = {};

    if (lecturerId) {
      whereClause.lecturerId = lecturerId;
    }
    if (studentId) {
      whereClause.studentId = studentId;
    }

    return await this.prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.create({
        data,
      });
      this.appGateway.sendNotificationToUser(notification);
      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw new BadRequestException('Failed to create notification');
    }
  }

  async update(
    id: string,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification> {
    try {
      return await this.prisma.notification.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Notification not found');
      }
      this.logger.error('Failed to update notification', error);
      throw new BadRequestException('Failed to update notification');
    }
  }

  async markAllAsRead(
    lecturerId?: string,
    studentId?: string,
  ): Promise<{ count: number }> {
    if (!lecturerId && !studentId) {
      throw new BadRequestException(
        'Either lecturerId or studentId must be provided',
      );
    }
    const whereClause: Prisma.NotificationWhereInput = {
      isRead: false,
    };

    if (lecturerId) {
      whereClause.lecturerId = lecturerId;
    }
    if (studentId) {
      whereClause.studentId = studentId;
    }

    return await this.prisma.notification.updateMany({
      where: whereClause,
      data: {
        isRead: true,
      },
    });
  }

  async markAsReadById(
    id: string,
    lecturerId?: string,
    studentId?: string,
  ): Promise<Notification> {
    try {
      // Use updateMany with where condition to ensure notification belongs to user
      const result = await this.prisma.notification.updateMany({
        where: {
          id,
          ...(lecturerId && { lecturerId }),
          ...(studentId && { studentId }),
        },
        data: {
          isRead: true,
        },
      });

      if (result.count === 0) {
        throw new NotFoundException(
          'Notification not found or you are not authorized',
        );
      }

      return await this.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to mark notification as read', error);
      throw new BadRequestException('Failed to mark notification as read');
    }
  }

  async delete(id: string): Promise<Notification> {
    try {
      return await this.prisma.notification.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Notification not found');
      }
      this.logger.error('Failed to delete notification', error);
      throw new BadRequestException('Failed to delete notification');
    }
  }

  async deleteForUser(
    id: string,
    lecturerId?: string,
    studentId?: string,
  ): Promise<{ count: number }> {
    try {
      const result = await this.prisma.notification.deleteMany({
        where: {
          id,
          ...(lecturerId && { lecturerId }),
          ...(studentId && { studentId }),
        },
      });

      if (result.count === 0) {
        throw new NotFoundException(
          'Notification not found or you are not authorized',
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete notification', error);
      throw new BadRequestException('Failed to delete notification');
    }
  }

  async findByIdForUser(
    id: string,
    lecturerId?: string,
    studentId?: string,
  ): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          id,
          ...(lecturerId && { lecturerId }),
          ...(studentId && { studentId }),
        },
        include: {
          student: true,
          lecturer: true,
        },
      });

      if (!notification) {
        throw new NotFoundException(
          'Notification not found or you are not authorized',
        );
      }

      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to find notification', error);
      throw new BadRequestException('Failed to find notification');
    }
  }

  async deleteAllForUser(
    lecturerId?: string,
    studentId?: string,
  ): Promise<{ count: number }> {
    try {
      if (!lecturerId && !studentId) {
        throw new BadRequestException(
          'Either lecturerId or studentId must be provided',
        );
      }

      const result = await this.prisma.notification.deleteMany({
        where: {
          ...(lecturerId && { lecturerId }),
          ...(studentId && { studentId }),
        },
      });

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Failed to delete all notifications', error);
      throw new BadRequestException('Failed to delete all notifications');
    }
  }
}
