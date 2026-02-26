import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockNotification = {
    id: 'notification-1',
    title: 'Test Notification',
    message: 'Test message',
    isRead: false,
    url: null,
    studentId: 'student-1',
    lecturerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStudent = {
    id: 'student-1',
    fullName: 'Test Student',
  };

  const mockLecturer = {
    id: 'lecturer-1',
    fullName: 'Test Lecturer',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      notification: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all notifications', async () => {
      prismaService.notification.findMany.mockResolvedValue([
        mockNotification,
      ] as any);
      const result = await service.findAll();
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('findById', () => {
    it('should return a notification by id', async () => {
      prismaService.notification.findUnique.mockResolvedValue(
        mockNotification as any,
      );
      const result = await service.findById('notification-1');
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException if notification not found', async () => {
      prismaService.notification.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return notifications for student', async () => {
      prismaService.notification.findMany.mockResolvedValue([
        mockNotification,
      ] as any);
      const result = await service.findByUser(undefined, 'student-1');
      expect(result).toEqual([mockNotification]);
    });

    it('should return notifications for lecturer', async () => {
      const lecturerNotification = {
        ...mockNotification,
        lecturerId: 'lecturer-1',
        studentId: null,
      };
      prismaService.notification.findMany.mockResolvedValue([
        lecturerNotification,
      ] as any);
      const result = await service.findByUser('lecturer-1');
      expect(result).toEqual([lecturerNotification]);
    });

    it('should throw BadRequestException if no user id provided', async () => {
      await expect(service.findByUser()).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      prismaService.notification.create.mockResolvedValue(
        mockNotification as any,
      );
      const result = await service.create({
        title: 'Test Notification',
        message: 'Test message',
        student: { connect: { id: 'student-1' } },
      });
      expect(result).toEqual(mockNotification);
    });

    it('should throw BadRequestException on error', async () => {
      prismaService.notification.create.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(
        service.create({
          title: 'Test Notification',
          message: 'Test message',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a notification', async () => {
      const updatedNotification = { ...mockNotification, isRead: true };
      prismaService.notification.update.mockResolvedValue(
        updatedNotification as any,
      );
      const result = await service.update('notification-1', { isRead: true });
      expect(result).toEqual(updatedNotification);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.notification.update.mockRejectedValue(prismaError);
      await expect(
        service.update('nonexistent', { isRead: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.notification.update.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(
        service.update('notification-1', { isRead: true }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for student', async () => {
      prismaService.notification.updateMany.mockResolvedValue({ count: 5 });
      const result = await service.markAllAsRead(undefined, 'student-1');
      expect(result).toEqual({ count: 5 });
    });

    it('should mark all notifications as read for lecturer', async () => {
      prismaService.notification.updateMany.mockResolvedValue({ count: 3 });
      const result = await service.markAllAsRead('lecturer-1');
      expect(result).toEqual({ count: 3 });
    });

    it('should throw BadRequestException if no user id provided', async () => {
      await expect(service.markAllAsRead()).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markAsReadById', () => {
    it('should mark a specific notification as read', async () => {
      prismaService.notification.updateMany.mockResolvedValue({ count: 1 });
      prismaService.notification.findUnique.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      } as any);
      const result = await service.markAsReadById(
        'notification-1',
        undefined,
        'student-1',
      );
      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if notification not found or unauthorized', async () => {
      prismaService.notification.updateMany.mockResolvedValue({ count: 0 });
      await expect(
        service.markAsReadById('nonexistent', undefined, 'student-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      prismaService.notification.updateMany.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(
        service.markAsReadById('notification-1', undefined, 'student-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      prismaService.notification.delete.mockResolvedValue(
        mockNotification as any,
      );
      const result = await service.delete('notification-1');
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.notification.delete.mockRejectedValue(prismaError);
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.notification.delete.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.delete('notification-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteForUser', () => {
    it('should delete notification for user', async () => {
      prismaService.notification.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.deleteForUser(
        'notification-1',
        undefined,
        'student-1',
      );
      expect(result).toEqual({ count: 1 });
    });

    it('should throw NotFoundException if notification not found or unauthorized', async () => {
      prismaService.notification.deleteMany.mockResolvedValue({ count: 0 });
      await expect(
        service.deleteForUser('nonexistent', undefined, 'student-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      prismaService.notification.deleteMany.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(
        service.deleteForUser('notification-1', undefined, 'student-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByIdForUser', () => {
    it('should find notification for user', async () => {
      prismaService.notification.findFirst.mockResolvedValue(
        mockNotification as any,
      );
      const result = await service.findByIdForUser(
        'notification-1',
        undefined,
        'student-1',
      );
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException if notification not found or unauthorized', async () => {
      prismaService.notification.findFirst.mockResolvedValue(null);
      await expect(
        service.findByIdForUser('nonexistent', undefined, 'student-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on other errors', async () => {
      prismaService.notification.findFirst.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(
        service.findByIdForUser('notification-1', undefined, 'student-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAllForUser', () => {
    it('should delete all notifications for student', async () => {
      prismaService.notification.deleteMany.mockResolvedValue({ count: 10 });
      const result = await service.deleteAllForUser(undefined, 'student-1');
      expect(result).toEqual({ count: 10 });
    });

    it('should delete all notifications for lecturer', async () => {
      prismaService.notification.deleteMany.mockResolvedValue({ count: 5 });
      const result = await service.deleteAllForUser('lecturer-1');
      expect(result).toEqual({ count: 5 });
    });

    it('should throw BadRequestException if no user id provided', async () => {
      await expect(service.deleteAllForUser()).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on other errors', async () => {
      prismaService.notification.deleteMany.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(
        service.deleteAllForUser(undefined, 'student-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
