import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AdminService } from 'src/admin/admin.service';
import { StudentService } from 'src/user-manager/student/student.service';
import { LecturerService } from 'src/user-manager/lecturer/lecturer.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from 'common';

describe('AuthService', () => {
  let service: AuthService;
  let adminService: jest.Mocked<AdminService>;
  let studentService: jest.Mocked<StudentService>;
  let lecturerService: jest.Mocked<LecturerService>;

  const mockAdmin = {
    id: 'admin-1',
    username: 'admin',
    password: '$2b$10$hashedpassword',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStudent = {
    id: 'student-1',
    studentId: 'STU-001',
    username: 'student1',
    email: 'student@test.com',
    password: '$2b$10$hashedpassword',
    active: true,
  };

  const mockLecturer = {
    id: 'lecturer-1',
    lecturerId: 'LEC-001',
    username: 'lecturer1',
    email: 'lecturer@test.com',
    password: '$2b$10$hashedpassword',
    active: true,
  };

  beforeEach(async () => {
    const mockAdminService = {
      create: jest.fn(),
      findByUsername: jest.fn(),
    };

    const mockStudentService = {
      findByStudentId: jest.fn(),
      findByUsername: jest.fn(),
    };

    const mockLecturerService = {
      findByLecturerId: jest.fn(),
      findByUsername: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AdminService, useValue: mockAdminService },
        { provide: StudentService, useValue: mockStudentService },
        { provide: LecturerService, useValue: mockLecturerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    adminService = module.get(AdminService);
    studentService = module.get(StudentService);
    lecturerService = module.get(LecturerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token with default secret', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET; // Force use of default secret

      const payload = { id: 'test-id', role: Role.ADMIN };
      const token = service.generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      process.env.JWT_SECRET = originalSecret;
    });

    it('should generate a valid JWT token with custom secret from env', () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'custom-test-secret';

      const payload = { id: 'test-id', role: Role.ADMIN };
      const token = service.generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('adminSignup', () => {
    it('should create admin with hashed password', async () => {
      const dto = {
        username: 'newadmin',
        password: 'password123',
        confirmPassword: 'password123',
      };
      adminService.create.mockResolvedValue(mockAdmin as any);

      const result = await service.adminSignup(dto);

      expect(adminService.create).toHaveBeenCalled();
      expect(result).toEqual(mockAdmin);
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      const dto = {
        username: 'newadmin',
        password: 'password123',
        confirmPassword: 'differentpassword',
      };

      await expect(service.adminSignup(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('adminSignin', () => {
    it('should return access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      adminService.findByUsername.mockResolvedValue({
        ...mockAdmin,
        password: hashedPassword,
      } as any);

      const result = await service.adminSignin({
        username: 'admin',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      adminService.findByUsername.mockResolvedValue({
        ...mockAdmin,
        password: hashedPassword,
      } as any);

      await expect(
        service.adminSignin({ username: 'admin', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      adminService.findByUsername.mockResolvedValue({
        ...mockAdmin,
        password: hashedPassword,
        active: false,
      } as any);

      await expect(
        service.adminSignin({ username: 'admin', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      adminService.findByUsername.mockRejectedValue(new Error('Not found'));

      await expect(
        service.adminSignin({ username: 'nonexistent', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('studentSignin', () => {
    it('should return access token for valid studentId login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      studentService.findByStudentId.mockResolvedValue({
        ...mockStudent,
        password: hashedPassword,
      } as any);

      const result = await service.studentSignin({
        studentId: 'STU-001',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
    });

    it('should return access token for valid username login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      studentService.findByUsername.mockResolvedValue({
        ...mockStudent,
        password: hashedPassword,
      } as any);

      const result = await service.studentSignin({
        username: 'student1',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException if no studentId or username provided', async () => {
      await expect(
        service.studentSignin({ password: 'password123' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      studentService.findByStudentId.mockResolvedValue({
        ...mockStudent,
        password: hashedPassword,
      } as any);

      await expect(
        service.studentSignin({ studentId: 'STU-001', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive student', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      studentService.findByStudentId.mockResolvedValue({
        ...mockStudent,
        password: hashedPassword,
        active: false,
      } as any);

      await expect(
        service.studentSignin({
          studentId: 'STU-001',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('lecturerSignin', () => {
    it('should return access token for valid lecturerId login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      lecturerService.findByLecturerId.mockResolvedValue({
        ...mockLecturer,
        password: hashedPassword,
      } as any);

      const result = await service.lecturerSignin({
        lecturerId: 'LEC-001',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
    });

    it('should return access token for valid username login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      lecturerService.findByUsername.mockResolvedValue({
        ...mockLecturer,
        password: hashedPassword,
      } as any);

      const result = await service.lecturerSignin({
        username: 'lecturer1',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException if no lecturerId or username provided', async () => {
      await expect(
        service.lecturerSignin({ password: 'password123' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      lecturerService.findByLecturerId.mockResolvedValue({
        ...mockLecturer,
        password: hashedPassword,
      } as any);

      await expect(
        service.lecturerSignin({ lecturerId: 'LEC-001', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive lecturer', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      lecturerService.findByLecturerId.mockResolvedValue({
        ...mockLecturer,
        password: hashedPassword,
        active: false,
      } as any);

      await expect(
        service.lecturerSignin({
          lecturerId: 'LEC-001',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent lecturer', async () => {
      lecturerService.findByLecturerId.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        service.lecturerSignin({
          lecturerId: 'NONEXISTENT',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
