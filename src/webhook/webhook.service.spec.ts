import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('WebhookService', () => {
  let service: WebhookService;
  let prismaService: jest.Mocked<PrismaService>;
  let httpService: jest.Mocked<HttpService>;

  const mockWebhook = {
    id: 'webhook-1',
    url: 'https://example.com/webhook',
    secret: 'test-secret',
    isActive: true,
    studentId: 'student-1',
    lecturerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNotification = {
    id: 'notification-1',
    title: 'Test Notification',
    message: 'Test message',
    studentId: 'student-1',
    lecturerId: null,
  };

  const mockWebhookLog = {
    id: 'log-1',
    webhookId: 'webhook-1',
    event: 'notification',
    payload: mockNotification,
    statusCode: 200,
    responseBody: '{"status":"ok"}',
    duration: 100,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      webhook: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      webhookLog: {
        create: jest.fn(),
      },
    };

    const mockHttpService = {
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    prismaService = module.get(PrismaService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all webhooks', async () => {
      prismaService.webhook.findMany.mockResolvedValue([mockWebhook] as any);
      const result = await service.findAll();
      expect(result).toEqual([mockWebhook]);
    });

    it('should throw BadRequestException on error', async () => {
      prismaService.webhook.findMany.mockRejectedValue(new Error('DB Error'));
      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a webhook by id', async () => {
      prismaService.webhook.findUnique.mockResolvedValue(mockWebhook as any);
      const result = await service.findById('webhook-1');
      expect(result).toEqual(mockWebhook);
    });

    it('should throw NotFoundException if webhook not found', async () => {
      prismaService.webhook.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on other errors', async () => {
      prismaService.webhook.findUnique.mockRejectedValue(new Error('DB Error'));
      await expect(service.findById('webhook-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return webhooks for student', async () => {
      prismaService.webhook.findMany.mockResolvedValue([mockWebhook] as any);
      const result = await service.findByUser(undefined, 'student-1');
      expect(result).toEqual([mockWebhook]);
    });

    it('should return webhooks for lecturer', async () => {
      const lecturerWebhook = {
        ...mockWebhook,
        lecturerId: 'lecturer-1',
        studentId: null,
      };
      prismaService.webhook.findMany.mockResolvedValue([
        lecturerWebhook,
      ] as any);
      const result = await service.findByUser('lecturer-1');
      expect(result).toEqual([lecturerWebhook]);
    });

    it('should throw BadRequestException if no user id provided', async () => {
      await expect(service.findByUser()).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on other errors', async () => {
      prismaService.webhook.findMany.mockRejectedValue(new Error('DB Error'));
      await expect(service.findByUser(undefined, 'student-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('should create a webhook with auto-generated secret', async () => {
      prismaService.webhook.create.mockResolvedValue(mockWebhook as any);
      const result = await service.create({
        url: 'https://example.com/webhook',
        student: { connect: { id: 'student-1' } },
      });
      expect(result).toEqual(mockWebhook);
    });

    it('should throw BadRequestException on error', async () => {
      prismaService.webhook.create.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.create({
          url: 'https://example.com/webhook',
          student: { connect: { id: 'student-1' } },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      const updatedWebhook = {
        ...mockWebhook,
        url: 'https://example.com/new-webhook',
      };
      prismaService.webhook.update.mockResolvedValue(updatedWebhook as any);
      const result = await service.update('webhook-1', {
        url: 'https://example.com/new-webhook',
      });
      expect(result).toEqual(updatedWebhook);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.webhook.update.mockRejectedValue(prismaError);
      await expect(
        service.update('nonexistent', { url: 'https://example.com/new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.webhook.update.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.update('webhook-1', { url: 'https://example.com/new' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a webhook', async () => {
      prismaService.webhook.delete.mockResolvedValue(mockWebhook as any);
      const result = await service.delete('webhook-1');
      expect(result).toEqual(mockWebhook);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.webhook.delete.mockRejectedValue(prismaError);
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.webhook.delete.mockRejectedValue(new Error('DB Error'));
      await expect(service.delete('webhook-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle webhook active status from true to false', async () => {
      prismaService.webhook.findUnique.mockResolvedValue(mockWebhook as any);
      prismaService.webhook.update.mockResolvedValue({
        ...mockWebhook,
        isActive: false,
      } as any);
      const result = await service.toggleActive('webhook-1');
      expect(result.isActive).toBe(false);
    });

    it('should toggle webhook active status from false to true', async () => {
      const inactiveWebhook = { ...mockWebhook, isActive: false };
      prismaService.webhook.findUnique.mockResolvedValue(
        inactiveWebhook as any,
      );
      prismaService.webhook.update.mockResolvedValue({
        ...mockWebhook,
        isActive: true,
      } as any);
      const result = await service.toggleActive('webhook-1');
      expect(result.isActive).toBe(true);
    });
  });

  describe('findByIdForUser', () => {
    it('should find webhook for user', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(mockWebhook as any);
      const result = await service.findByIdForUser(
        'webhook-1',
        undefined,
        'student-1',
      );
      expect(result).toEqual(mockWebhook);
    });

    it('should throw NotFoundException if webhook not found or unauthorized', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(null);
      await expect(
        service.findByIdForUser('nonexistent', undefined, 'student-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      prismaService.webhook.findFirst.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.findByIdForUser('webhook-1', undefined, 'student-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateForUser', () => {
    it('should update webhook for user', async () => {
      const updatedWebhook = {
        ...mockWebhook,
        url: 'https://example.com/new-webhook',
      };
      prismaService.webhook.findFirst.mockResolvedValue(mockWebhook as any);
      prismaService.webhook.update.mockResolvedValue(updatedWebhook as any);
      const result = await service.updateForUser(
        'webhook-1',
        { url: 'https://example.com/new-webhook' },
        undefined,
        'student-1',
      );
      expect(result).toEqual(updatedWebhook);
    });

    it('should throw NotFoundException if webhook not found or unauthorized', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(null);
      await expect(
        service.updateForUser(
          'nonexistent',
          { url: 'https://example.com/new' },
          undefined,
          'student-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for P2025 error during update', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(mockWebhook as any);
      const prismaError = { code: 'P2025' };
      prismaService.webhook.update.mockRejectedValue(prismaError);
      await expect(
        service.updateForUser(
          'webhook-1',
          { url: 'https://example.com/new' },
          undefined,
          'student-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(mockWebhook as any);
      prismaService.webhook.update.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.updateForUser(
          'webhook-1',
          { url: 'https://example.com/new' },
          undefined,
          'student-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteForUser', () => {
    it('should delete webhook for user', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(mockWebhook as any);
      prismaService.webhook.delete.mockResolvedValue(mockWebhook as any);
      const result = await service.deleteForUser(
        'webhook-1',
        undefined,
        'student-1',
      );
      expect(result).toEqual(mockWebhook);
    });

    it('should throw NotFoundException if webhook not found or unauthorized', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(null);
      await expect(
        service.deleteForUser('nonexistent', undefined, 'student-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for P2025 error during delete', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(mockWebhook as any);
      const prismaError = { code: 'P2025' };
      prismaService.webhook.delete.mockRejectedValue(prismaError);
      await expect(
        service.deleteForUser('webhook-1', undefined, 'student-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(mockWebhook as any);
      prismaService.webhook.delete.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.deleteForUser('webhook-1', undefined, 'student-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleActiveForUser', () => {
    it('should toggle active status for user webhook', async () => {
      prismaService.webhook.findFirst.mockResolvedValue(mockWebhook as any);
      prismaService.webhook.update.mockResolvedValue({
        ...mockWebhook,
        isActive: false,
      } as any);
      const result = await service.toggleActiveForUser(
        'webhook-1',
        undefined,
        'student-1',
      );
      expect(result.isActive).toBe(false);
    });
  });

  describe('triggerWebhooksForNotifications', () => {
    it('should trigger webhooks for notifications', async () => {
      prismaService.webhook.findMany.mockResolvedValue([mockWebhook] as any);
      httpService.post.mockReturnValue(
        of({ status: 200, data: { status: 'ok' } }) as any,
      );
      prismaService.webhookLog.create.mockResolvedValue(mockWebhookLog as any);

      const result = await service.triggerWebhooksForNotifications([
        mockNotification as any,
      ]);
      expect(result.length).toBe(1);
    });

    it('should skip notifications without associated user', async () => {
      const notificationWithoutUser = {
        ...mockNotification,
        studentId: null,
        lecturerId: null,
      };
      const result = await service.triggerWebhooksForNotifications([
        notificationWithoutUser as any,
      ]);
      expect(result.length).toBe(0);
    });

    it('should log failed webhook calls', async () => {
      prismaService.webhook.findMany.mockResolvedValue([mockWebhook] as any);
      httpService.post.mockReturnValue(
        throwError(() => ({
          response: { status: 500 },
          message: 'Server Error',
        })) as any,
      );
      prismaService.webhookLog.create.mockResolvedValue({
        ...mockWebhookLog,
        statusCode: 500,
        responseBody: 'Server Error',
      } as any);

      const result = await service.triggerWebhooksForNotifications([
        mockNotification as any,
      ]);
      expect(result.length).toBe(1);
      expect(result[0].statusCode).toBe(500);
    });

    it('should handle webhook without secret', async () => {
      const webhookWithoutSecret = { ...mockWebhook, secret: null };
      prismaService.webhook.findMany.mockResolvedValue([
        webhookWithoutSecret,
      ] as any);
      httpService.post.mockReturnValue(
        of({ status: 200, data: { status: 'ok' } }) as any,
      );
      prismaService.webhookLog.create.mockResolvedValue(mockWebhookLog as any);

      const result = await service.triggerWebhooksForNotifications([
        mockNotification as any,
      ]);
      expect(result.length).toBe(1);
    });

    it('should continue processing other notifications on error', async () => {
      prismaService.webhook.findMany.mockRejectedValue(new Error('DB Error'));
      const result = await service.triggerWebhooksForNotifications([
        mockNotification as any,
      ]);
      expect(result.length).toBe(0);
    });

    it('should trigger webhooks for lecturer notifications', async () => {
      const lecturerNotification = {
        ...mockNotification,
        studentId: null,
        lecturerId: 'lecturer-1',
      };
      const lecturerWebhook = {
        ...mockWebhook,
        studentId: null,
        lecturerId: 'lecturer-1',
      };
      prismaService.webhook.findMany.mockResolvedValue([
        lecturerWebhook,
      ] as any);
      httpService.post.mockReturnValue(
        of({ status: 200, data: { status: 'ok' } }) as any,
      );
      prismaService.webhookLog.create.mockResolvedValue(mockWebhookLog as any);

      const result = await service.triggerWebhooksForNotifications([
        lecturerNotification as any,
      ]);
      expect(result.length).toBe(1);
    });
  });
});
