import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Webhook } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Webhook[]> {
    try {
      return await this.prisma.webhook.findMany({
        include: {
          student: true,
          lecturer: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error('Failed to get all webhooks', error);
      throw new BadRequestException('Failed to get all webhooks');
    }
  }

  async findById(id: string): Promise<Webhook> {
    try {
      const webhook = await this.prisma.webhook.findUnique({
        where: { id },
        include: {
          student: true,
          lecturer: true,
        },
      });
      if (!webhook) {
        throw new NotFoundException('Webhook not found');
      }
      return webhook;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to get webhook by id', error);
      throw new BadRequestException('Failed to get webhook by id');
    }
  }

  async findByUser(
    lecturerId?: string,
    studentId?: string,
  ): Promise<Webhook[]> {
    try {
      if (!lecturerId && !studentId) {
        throw new BadRequestException(
          'Either lecturerId or studentId must be provided',
        );
      }

      return await this.prisma.webhook.findMany({
        where: {
          ...(lecturerId && { lecturerId }),
          ...(studentId && { studentId }),
        },
        include: {
          student: true,
          lecturer: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Failed to get webhooks by user', error);
      throw new BadRequestException('Failed to get webhooks by user');
    }
  }

  async create(data: Prisma.WebhookCreateInput): Promise<Webhook> {
    try {
      return await this.prisma.webhook.create({
        data,
        include: {
          student: true,
          lecturer: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create webhook', error);
      throw new BadRequestException('Failed to create webhook');
    }
  }

  async update(id: string, data: Prisma.WebhookUpdateInput): Promise<Webhook> {
    try {
      return await this.prisma.webhook.update({
        where: { id },
        data,
        include: {
          student: true,
          lecturer: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Webhook not found');
      }
      this.logger.error('Failed to update webhook', error);
      throw new BadRequestException('Failed to update webhook');
    }
  }

  async delete(id: string): Promise<Webhook> {
    try {
      return await this.prisma.webhook.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Webhook not found');
      }
      this.logger.error('Failed to delete webhook', error);
      throw new BadRequestException('Failed to delete webhook');
    }
  }

  async toggleActive(id: string): Promise<Webhook> {
    const webhook = await this.findById(id);
    return await this.update(id, { isActive: !webhook.isActive });
  }

  async findByIdForUser(
    id: string,
    lecturerId?: string,
    studentId?: string,
  ): Promise<Webhook> {
    try {
      const webhook = await this.prisma.webhook.findFirst({
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

      if (!webhook) {
        throw new NotFoundException(
          'Webhook not found or you are not authorized',
        );
      }

      return webhook;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to get webhook', error);
      throw new BadRequestException('Failed to get webhook');
    }
  }

  async updateForUser(
    id: string,
    data: Prisma.WebhookUpdateInput,
    lecturerId?: string,
    studentId?: string,
  ): Promise<Webhook> {
    try {
      // Verify ownership first
      await this.findByIdForUser(id, lecturerId, studentId);

      return await this.prisma.webhook.update({
        where: { id },
        data,
        include: {
          student: true,
          lecturer: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Webhook not found');
      }
      this.logger.error('Failed to update webhook', error);
      throw new BadRequestException('Failed to update webhook');
    }
  }

  async deleteForUser(
    id: string,
    lecturerId?: string,
    studentId?: string,
  ): Promise<Webhook> {
    try {
      // Verify ownership first
      const webhook = await this.findByIdForUser(id, lecturerId, studentId);

      return await this.prisma.webhook.delete({
        where: { id: webhook.id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Webhook not found');
      }
      this.logger.error('Failed to delete webhook', error);
      throw new BadRequestException('Failed to delete webhook');
    }
  }

  async toggleActiveForUser(
    id: string,
    lecturerId?: string,
    studentId?: string,
  ): Promise<Webhook> {
    const webhook = await this.findByIdForUser(id, lecturerId, studentId);
    return await this.updateForUser(
      id,
      { isActive: !webhook.isActive },
      lecturerId,
      studentId,
    );
  }
}
