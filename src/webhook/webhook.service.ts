import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Notification, Prisma, Webhook, WebhookLog } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import {
  generateWebhookSecret,
  generateWebhookSignature,
} from 'common/utils/webhook.util';

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
      // Auto-generate secret if not provided
      const secret = generateWebhookSecret();

      return await this.prisma.webhook.create({
        data: {
          ...data,
          secret,
        },
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

  async triggerWebhooksForNotifications(
    notifications: Notification[],
  ): Promise<WebhookLog[]> {
    const logs: WebhookLog[] = [];

    for (const notification of notifications) {
      const userId = notification.studentId || notification.lecturerId;
      if (!userId) {
        this.logger.warn(
          `Notification ${notification.id} has no associated user`,
        );
        continue;
      }

      try {
        // Get all active webhooks for this user
        const webhooks = await this.prisma.webhook.findMany({
          where: {
            isActive: true,
            OR: [
              ...(notification.studentId
                ? [{ studentId: notification.studentId }]
                : []),
              ...(notification.lecturerId
                ? [{ lecturerId: notification.lecturerId }]
                : []),
            ],
          },
        });

        // Trigger each webhook
        for (const webhook of webhooks) {
          const log = await this.sendWebhook(
            webhook,
            'notification',
            notification,
          );
          logs.push(log);
        }
      } catch (error) {
        this.logger.error(
          `Failed to trigger webhooks for notification ${notification.id}`,
          error,
        );
      }
    }

    return logs;
  }

  private async sendWebhook(
    webhook: Webhook,
    event: string,
    payload: object,
  ): Promise<WebhookLog> {
    const startTime = Date.now();
    let statusCode: number | null = null;
    let responseBody: string | null = null;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add signature if secret is configured
      if (webhook.secret) {
        const signature = generateWebhookSignature(webhook.secret, payload);
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await firstValueFrom(
        this.httpService.post(webhook.url, payload, { headers }),
      );

      statusCode = response.status;
      responseBody = JSON.stringify(response.data);
    } catch (error) {
      statusCode = error.response?.status || 500;
      responseBody = error.message;
      this.logger.error(
        `Webhook ${webhook.id} trigger failed: ${error.message}`,
      );
    }

    const duration = Date.now() - startTime;

    // Log the webhook call
    return await this.prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: payload as Prisma.InputJsonValue,
        statusCode,
        responseBody,
        duration,
      },
    });
  }
}
