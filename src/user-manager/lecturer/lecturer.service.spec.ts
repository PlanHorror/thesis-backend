import { Test, TestingModule } from '@nestjs/testing';
import { LecturerService } from './lecturer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('LecturerService', () => {
  let service: LecturerService;
  let prismaService: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockLecturer = {
    id: 'lecturer-1',
    lecturerId: 'LEC-001',
    username: 'lecturer1',
    email: 'lecturer@test.com',
    password: 'hashedpassword',
    active: true,
    phone: '0123456789',
    departmentId: 'dept-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      lecturer: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturerService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<LecturerService>(LecturerService);
    prismaService = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all lecturers', async () => {
      prismaService.lecturer.findMany.mockResolvedValue([mockLecturer] as any);
      const result = await service.findAll();
      expect(result).toEqual([mockLecturer]);
      expect(prismaService.lecturer.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return lecturer by id', async () => {
      prismaService.lecturer.findUnique.mockResolvedValue(mockLecturer as any);
      const result = await service.findById('lecturer-1');
      expect(result).toEqual(mockLecturer);
    });

    it('should throw NotFoundException if lecturer not found', async () => {
      prismaService.lecturer.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return lecturer by email', async () => {
      prismaService.lecturer.findUnique.mockResolvedValue(mockLecturer as any);
      const result = await service.findByEmail('lecturer@test.com');
      expect(result).toEqual(mockLecturer);
    });

    it('should throw NotFoundException if not found', async () => {
      prismaService.lecturer.findUnique.mockResolvedValue(null);
      await expect(service.findByEmail('notfound@test.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return lecturer by username', async () => {
      prismaService.lecturer.findUnique.mockResolvedValue(mockLecturer as any);
      const result = await service.findByUsername('lecturer1');
      expect(result).toEqual(mockLecturer);
    });

    it('should throw NotFoundException if not found', async () => {
      prismaService.lecturer.findUnique.mockResolvedValue(null);
      await expect(service.findByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByLecturerId', () => {
    it('should return lecturer by lecturerId', async () => {
      prismaService.lecturer.findUnique.mockResolvedValue(mockLecturer as any);
      const result = await service.findByLecturerId('LEC-001');
      expect(result).toEqual(mockLecturer);
    });

    it('should throw NotFoundException if not found', async () => {
      prismaService.lecturer.findUnique.mockResolvedValue(null);
      await expect(service.findByLecturerId('LEC-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a lecturer and emit event', async () => {
      prismaService.lecturer.create.mockResolvedValue(mockLecturer as any);
      const result = await service.create(mockLecturer as any);
      expect(result).toEqual(mockLecturer);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'lecturer.created',
        mockLecturer,
      );
    });

    it('should throw ConflictException for duplicate fields', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.create.mockRejectedValue(prismaError);
      await expect(service.create(mockLecturer as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for P2002 with non-array target', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: 'email' }, // string, not array
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.create.mockRejectedValue(prismaError);
      await expect(service.create(mockLecturer as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for P2002 with undefined target', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: {}, // no target
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.create.mockRejectedValue(prismaError);
      await expect(service.create(mockLecturer as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for P2002 with no meta', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: undefined,
      });
      prismaService.lecturer.create.mockRejectedValue(prismaError);
      await expect(service.create(mockLecturer as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.lecturer.create.mockRejectedValue(new Error('DB Error'));
      await expect(service.create(mockLecturer as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createMultipleLecturers', () => {
    it('should create multiple lecturers', async () => {
      prismaService.lecturer.createMany.mockResolvedValue({ count: 2 });
      const result = await service.createMultipleLecturers([
        mockLecturer as any,
        mockLecturer as any,
      ]);
      expect(result).toEqual({ message: 'Lecturers created successfully' });
    });
  });

  describe('update', () => {
    it('should update a lecturer', async () => {
      prismaService.lecturer.update.mockResolvedValue({
        ...mockLecturer,
        email: 'new@test.com',
      } as any);
      const result = await service.update('lecturer-1', {
        email: 'new@test.com',
      });
      expect(result.email).toEqual('new@test.com');
    });

    it('should throw NotFoundException if lecturer not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.update.mockRejectedValue(prismaError);
      await expect(
        service.update('nonexistent', { email: 'new@test.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate fields', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.update.mockRejectedValue(prismaError);
      await expect(
        service.update('lecturer-1', { email: 'duplicate@test.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for P2002 with non-array target', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: 'email' }, // string, not array
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.update.mockRejectedValue(prismaError);
      await expect(
        service.update('lecturer-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for P2002 with undefined target', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: {}, // no target
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.update.mockRejectedValue(prismaError);
      await expect(
        service.update('lecturer-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for P2002 with no meta', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: undefined,
      });
      prismaService.lecturer.update.mockRejectedValue(prismaError);
      await expect(
        service.update('lecturer-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for other update errors', async () => {
      prismaService.lecturer.update.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.update('lecturer-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a lecturer', async () => {
      prismaService.lecturer.delete.mockResolvedValue(mockLecturer as any);
      const result = await service.delete('lecturer-1');
      expect(result).toEqual(mockLecturer);
    });

    it('should throw NotFoundException if lecturer not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.delete.mockRejectedValue(prismaError);
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.lecturer.delete.mockRejectedValue(new Error('DB Error'));
      await expect(service.delete('lecturer-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for Prisma errors other than P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2003', // Foreign key constraint failed
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.delete.mockRejectedValue(prismaError);
      await expect(service.delete('lecturer-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple lecturers', async () => {
      prismaService.lecturer.deleteMany.mockResolvedValue({ count: 2 });
      const result = await service.deleteMany(['lecturer-1', 'lecturer-2']);
      expect(result).toEqual({ message: 'Lecturers deleted successfully' });
    });

    it('should throw NotFoundException if lecturers not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.deleteMany.mockRejectedValue(prismaError);
      await expect(service.deleteMany(['nonexistent'])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.lecturer.deleteMany.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.deleteMany(['lecturer-1'])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for Prisma errors other than P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2003', // Foreign key constraint failed
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.lecturer.deleteMany.mockRejectedValue(prismaError);
      await expect(service.deleteMany(['lecturer-1'])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('lecturerUpdateAccount', () => {
    const bcrypt = require('bcrypt');

    it('should update lecturer account without password', async () => {
      prismaService.lecturer.update.mockResolvedValue({
        ...mockLecturer,
        email: 'updated@test.com',
      } as any);
      const result = await service.lecturerUpdateAccount(
        { email: 'updated@test.com' } as any,
        mockLecturer as any,
      );
      expect(result.email).toEqual('updated@test.com');
    });

    it('should update lecturer account with password', async () => {
      const hashedPassword = '$2b$10$validhashedpassword';
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const lecturerWithPassword = {
        ...mockLecturer,
        password: hashedPassword,
      };
      prismaService.lecturer.update.mockResolvedValue(
        lecturerWithPassword as any,
      );

      const result = await service.lecturerUpdateAccount(
        { password: 'newpassword', oldPassword: 'correctoldpassword' } as any,
        mockLecturer as any,
      );
      expect(result).toEqual(lecturerWithPassword);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'lecturer.password_changed',
        lecturerWithPassword,
      );
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(
        service.lecturerUpdateAccount(
          { password: 'newpassword', oldPassword: 'wrongoldpassword' } as any,
          mockLecturer as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if old password is not provided', async () => {
      await expect(
        service.lecturerUpdateAccount(
          { password: 'newpassword' } as any,
          mockLecturer as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on error', async () => {
      prismaService.lecturer.update.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.lecturerUpdateAccount({} as any, mockLecturer as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update edge cases', () => {
    it('should throw BadRequestException for other database errors', async () => {
      prismaService.lecturer.update.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.update('lecturer-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
