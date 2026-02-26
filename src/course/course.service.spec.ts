import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CourseService', () => {
  let service: CourseService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockCourse = {
    id: 'course-1',
    name: 'Introduction to Programming',
    code: 'CS101',
    credits: 3,
    departmentId: 'dept-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDepartment = {
    id: 'dept-1',
    name: 'Computer Science',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      course: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      prismaService.course.findMany.mockResolvedValue([mockCourse] as any);
      const result = await service.findAll();
      expect(result).toEqual([mockCourse]);
      expect(prismaService.course.findMany).toHaveBeenCalled();
    });

    it('should return courses with department included', async () => {
      const courseWithDept = { ...mockCourse, department: mockDepartment };
      prismaService.course.findMany.mockResolvedValue([courseWithDept] as any);
      const result = await service.findAll(true);
      expect(result).toEqual([courseWithDept]);
      expect(prismaService.course.findMany).toHaveBeenCalledWith({
        include: {
          department: true,
        },
      });
    });

    it('should return courses with course on semesters included', async () => {
      prismaService.course.findMany.mockResolvedValue([mockCourse] as any);
      const result = await service.findAll(false, true);
      expect(prismaService.course.findMany).toHaveBeenCalledWith({
        include: {
          department: false,
          courseOnSemesters: { include: { semester: true } },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      prismaService.course.findUnique.mockResolvedValue(mockCourse as any);
      const result = await service.findOne('course-1');
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      prismaService.course.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException on database error', async () => {
      prismaService.course.findUnique.mockRejectedValue(new Error('DB Error'));
      await expect(service.findOne('course-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return course with department included', async () => {
      const courseWithDept = { ...mockCourse, department: mockDepartment };
      prismaService.course.findUnique.mockResolvedValue(courseWithDept as any);
      const result = await service.findOne('course-1', true);
      expect(result).toEqual(courseWithDept);
    });

    it('should return course with course on semesters included', async () => {
      prismaService.course.findUnique.mockResolvedValue(mockCourse as any);
      await service.findOne('course-1', false, true);
      expect(prismaService.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        include: {
          department: false,
          courseOnSemesters: { include: { semester: true } },
        },
      });
    });
  });

  describe('findByDepartmentId', () => {
    it('should return courses by department id', async () => {
      prismaService.course.findMany.mockResolvedValue([mockCourse] as any);
      const result = await service.findByDepartmentId('dept-1');
      expect(result).toEqual([mockCourse]);
    });

    it('should return courses with department included', async () => {
      const courseWithDept = { ...mockCourse, department: mockDepartment };
      prismaService.course.findMany.mockResolvedValue([courseWithDept] as any);
      const result = await service.findByDepartmentId('dept-1', true);
      expect(result).toEqual([courseWithDept]);
    });
  });

  describe('create', () => {
    it('should create a course', async () => {
      prismaService.course.create.mockResolvedValue(mockCourse as any);
      const result = await service.create({
        name: 'Introduction to Programming',
        code: 'CS101',
        credits: 3,
        department: { connect: { id: 'dept-1' } },
      });
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.course.create.mockRejectedValue(prismaError);
      await expect(
        service.create({
          name: 'Test Course',
          code: 'TEST101',
          credits: 3,
          department: { connect: { id: 'nonexistent' } },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.course.create.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.create({
          name: 'Test Course',
          code: 'TEST101',
          credits: 3,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createMany', () => {
    it('should create multiple courses', async () => {
      prismaService.course.createMany.mockResolvedValue({ count: 2 });
      const result = await service.createMany([
        { name: 'Course 1', code: 'C1', credits: 3, departmentId: 'dept-1' },
        { name: 'Course 2', code: 'C2', credits: 3, departmentId: 'dept-1' },
      ]);
      expect(result).toEqual({
        message: 'Courses created successfully',
        count: 2,
      });
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.course.createMany.mockRejectedValue(prismaError);
      await expect(
        service.createMany([
          { name: 'Course 1', code: 'C1', credits: 3, departmentId: 'invalid' },
        ]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.course.createMany.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.createMany([
          { name: 'Course 1', code: 'C1', credits: 3, departmentId: 'dept-1' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updatedCourse = { ...mockCourse, name: 'Updated Course' };
      prismaService.course.update.mockResolvedValue(updatedCourse as any);
      const result = await service.update('course-1', {
        name: 'Updated Course',
      });
      expect(result).toEqual(updatedCourse);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.course.update.mockRejectedValue(prismaError);
      await expect(
        service.update('nonexistent', { name: 'Updated Course' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.course.update.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.update('course-1', { name: 'Updated Course' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a course', async () => {
      prismaService.course.delete.mockResolvedValue(mockCourse as any);
      const result = await service.remove('course-1');
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.course.delete.mockRejectedValue(prismaError);
      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.course.delete.mockRejectedValue(new Error('DB Error'));
      await expect(service.remove('course-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeMany', () => {
    it('should delete multiple courses', async () => {
      prismaService.course.deleteMany.mockResolvedValue({ count: 2 });
      const result = await service.removeMany(['course-1', 'course-2']);
      expect(result).toEqual({ message: 'Courses deleted successfully' });
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.course.deleteMany.mockRejectedValue(prismaError);
      await expect(service.removeMany(['nonexistent'])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.course.deleteMany.mockRejectedValue(new Error('DB Error'));
      await expect(service.removeMany(['course-1'])).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
