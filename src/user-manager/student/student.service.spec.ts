import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('StudentService', () => {
  let service: StudentService;
  let prismaService: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockStudent = {
    id: 'student-1',
    studentId: 'STU-001',
    username: 'student1',
    email: 'student@test.com',
    password: 'hashedpassword',
    active: true,
    phone: '0123456789',
    citizenId: '123456789',
    departmentId: 'dept-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      student: {
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
        StudentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    prismaService = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      prismaService.student.findMany.mockResolvedValue([mockStudent] as any);
      const result = await service.findAll();
      expect(result).toEqual([mockStudent]);
      expect(prismaService.student.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return student by id', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const result = await service.findById('student-1');
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if student not found', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCondition', () => {
    it('should return student by email', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const result = await service.findByCondition('student@test.com');
      expect(result).toEqual(mockStudent);
    });

    it('should throw BadRequestException if no condition provided', async () => {
      await expect(service.findByCondition()).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if student not found', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      await expect(
        service.findByCondition('notfound@test.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('filterByDepartment', () => {
    it('should return students by department', async () => {
      prismaService.student.findMany.mockResolvedValue([mockStudent] as any);
      const result = await service.filterByDepartment('dept-1');
      expect(result).toEqual([mockStudent]);
    });

    it('should throw BadRequestException on error', async () => {
      prismaService.student.findMany.mockRejectedValue(new Error('DB Error'));
      await expect(service.filterByDepartment('dept-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return student by username', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const result = await service.findByUsername('student1');
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if not found', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      await expect(service.findByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByStudentId', () => {
    it('should return student by studentId', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const result = await service.findByStudentId('STU-001');
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if not found', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      await expect(service.findByStudentId('STU-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a student and emit event', async () => {
      prismaService.student.create.mockResolvedValue(mockStudent as any);
      const result = await service.create(mockStudent as any);
      expect(result).toEqual(mockStudent);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'student.created',
        mockStudent,
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.create.mockRejectedValue(prismaError);
      await expect(service.create(mockStudent as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException for duplicate username', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['username'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.create.mockRejectedValue(prismaError);
      await expect(service.create(mockStudent as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException for duplicate email and username', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['email', 'username'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.create.mockRejectedValue(prismaError);
      await expect(service.create(mockStudent as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for generic errors', async () => {
      prismaService.student.create.mockRejectedValue(new Error('DB Error'));
      await expect(service.create(mockStudent as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for P2002 with non-array target', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: 'email' }, // string, not array
        clientVersion: '5.0.0',
      });
      prismaService.student.create.mockRejectedValue(prismaError);
      await expect(service.create(mockStudent as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for P2002 with no meta', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: undefined,
      });
      prismaService.student.create.mockRejectedValue(prismaError);
      await expect(service.create(mockStudent as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for other Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2003', // Foreign key constraint error
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.student.create.mockRejectedValue(prismaError);
      await expect(service.create(mockStudent as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createMultipleStudents', () => {
    it('should create multiple students', async () => {
      prismaService.student.createMany.mockResolvedValue({ count: 2 });
      const result = await service.createMultipleStudents([
        mockStudent as any,
        mockStudent as any,
      ]);
      expect(result).toEqual({ message: 'Students created successfully' });
    });

    it('should throw BadRequestException on error', async () => {
      prismaService.student.createMany.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.createMultipleStudents([mockStudent as any]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaService.student.update.mockResolvedValue({
        ...mockStudent,
        email: 'new@test.com',
      } as any);
      const result = await service.update('student-1', {
        email: 'new@test.com',
      });
      expect(result.email).toEqual('new@test.com');
    });

    it('should throw NotFoundException if student not found', async () => {
      prismaService.student.findUnique.mockResolvedValue(null);
      await expect(
        service.update('nonexistent', { email: 'new@test.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException on P2025 error during update', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      await expect(
        service.update('student-1', { email: 'new@test.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      await expect(
        service.update('student-1', { email: 'duplicate@test.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate username', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['username'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      await expect(
        service.update('student-1', { username: 'duplicateuser' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate email and username', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['email', 'username'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      await expect(
        service.update('student-1', {
          email: 'dup@test.com',
          username: 'dupuser',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle duplicate email and username with non-string values', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['email', 'username'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      // Test with undefined email and username (non-string values)
      await expect(service.update('student-1', {} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle duplicate email with non-string email value', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      // Test with undefined email (non-string value)
      await expect(service.update('student-1', {} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle duplicate username with non-string username value', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: ['username'] },
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      // Test with undefined username (non-string value)
      await expect(service.update('student-1', {} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for other database errors', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaService.student.update.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.update('student-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for P2002 with non-array target', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: { target: 'email' }, // string, not array
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      await expect(
        service.update('student-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for P2002 with undefined target', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        meta: {}, // no target
        clientVersion: '5.0.0',
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      await expect(
        service.update('student-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for P2002 with no meta', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: undefined,
      });
      prismaService.student.update.mockRejectedValue(prismaError);
      await expect(
        service.update('student-1', { email: 'new@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should skip unchanged fields during update', async () => {
      prismaService.student.findUnique.mockResolvedValue(mockStudent as any);
      prismaService.student.update.mockResolvedValue(mockStudent as any);
      await service.update('student-1', {
        email: mockStudent.email,
        username: mockStudent.username,
        studentId: mockStudent.studentId,
        citizenId: mockStudent.citizenId,
        phone: mockStudent.phone,
      });
      expect(prismaService.student.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a student', async () => {
      prismaService.student.delete.mockResolvedValue(mockStudent as any);
      const result = await service.delete('student-1');
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundException if student not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.student.delete.mockRejectedValue(prismaError);
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.student.delete.mockRejectedValue(new Error('DB Error'));
      await expect(service.delete('student-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for Prisma errors other than P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2003', // Foreign key constraint failed
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.student.delete.mockRejectedValue(prismaError);
      await expect(service.delete('student-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple students', async () => {
      prismaService.student.deleteMany.mockResolvedValue({ count: 2 });
      const result = await service.deleteMany(['student-1', 'student-2']);
      expect(result).toEqual({ message: 'Accounts deleted successfully' });
    });

    it('should throw NotFoundException if students not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.student.deleteMany.mockRejectedValue(prismaError);
      await expect(service.deleteMany(['nonexistent'])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.student.deleteMany.mockRejectedValue(new Error('DB Error'));
      await expect(service.deleteMany(['student-1'])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for Prisma errors other than P2025', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2003', // Foreign key constraint failed
        meta: {},
        clientVersion: '5.0.0',
      });
      prismaService.student.deleteMany.mockRejectedValue(prismaError);
      await expect(service.deleteMany(['student-1'])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('studentUpdateAccount', () => {
    const bcrypt = require('bcrypt');

    it('should update student account without password', async () => {
      prismaService.student.update.mockResolvedValue({
        ...mockStudent,
        email: 'updated@test.com',
      } as any);
      const result = await service.studentUpdateAccount(
        { email: 'updated@test.com' } as any,
        mockStudent as any,
      );
      expect(result.email).toEqual('updated@test.com');
    });

    it('should update student account with password', async () => {
      const hashedPassword = '$2b$10$validhashedpassword';
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const studentWithPassword = {
        ...mockStudent,
        password: hashedPassword,
      };
      prismaService.student.update.mockResolvedValue(
        studentWithPassword as any,
      );

      const result = await service.studentUpdateAccount(
        { password: 'newpassword', oldPassword: 'correctoldpassword' } as any,
        mockStudent as any,
      );
      expect(result).toEqual(studentWithPassword);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'student.password_changed',
        studentWithPassword,
      );
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(
        service.studentUpdateAccount(
          { password: 'newpassword', oldPassword: 'wrongoldpassword' } as any,
          mockStudent as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if old password is not provided', async () => {
      await expect(
        service.studentUpdateAccount(
          { password: 'newpassword' } as any,
          mockStudent as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on error', async () => {
      prismaService.student.update.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.studentUpdateAccount({} as any, mockStudent as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
