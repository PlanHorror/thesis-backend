import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from './enrollment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseSemesterService } from 'src/semester/course-semester/course-semester.service';
import { SessionService } from './session/session.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let prismaService: jest.Mocked<PrismaService>;
  let courseSemesterService: jest.Mocked<CourseSemesterService>;
  let sessionService: jest.Mocked<SessionService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockStudent = {
    id: 'student-1',
    studentId: 'STU-001',
    fullName: 'Test Student',
    email: 'student@test.com',
  };

  const mockEnrollment = {
    id: 'enrollment-1',
    studentId: 'student-1',
    courseOnSemesterId: 'cos-1',
    gradeType1: null,
    gradeType2: null,
    gradeType3: null,
    finalGrade: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCourseOnSemester = {
    id: 'cos-1',
    courseId: 'course-1',
    semesterId: 'semester-1',
    lecturerId: 'lecturer-1',
    startTime: new Date(),
    endTime: new Date(),
    course: { id: 'course-1', name: 'Test Course' },
    semester: { id: 'semester-1', name: 'Fall 2024' },
    lecturer: { id: 'lecturer-1', fullName: 'Test Lecturer' },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      studentCourseEnrollment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      courseOnSemester: {
        findUnique: jest.fn(),
      },
    };

    const mockCourseSemesterService = {
      findOne: jest.fn(),
    };

    const mockSessionService = {
      isEnrollmentTimeValid: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CourseSemesterService, useValue: mockCourseSemesterService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
    prismaService = module.get(PrismaService);
    courseSemesterService = module.get(CourseSemesterService);
    sessionService = module.get(SessionService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all enrollments', async () => {
      prismaService.studentCourseEnrollment.findMany.mockResolvedValue([
        mockEnrollment,
      ] as any);
      const result = await service.findAll();
      expect(result).toEqual([mockEnrollment]);
    });

    it('should return enrollments with student included', async () => {
      const enrollmentWithStudent = { ...mockEnrollment, student: mockStudent };
      prismaService.studentCourseEnrollment.findMany.mockResolvedValue([
        enrollmentWithStudent,
      ] as any);
      const result = await service.findAll(true);
      expect(result).toEqual([enrollmentWithStudent]);
    });

    it('should throw BadRequestException if includeCourse is true but includeCourseOnSemester is false', async () => {
      await expect(
        service.findAll(false, false, true, false, false),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if includeSemester is true but includeCourseOnSemester is false', async () => {
      await expect(
        service.findAll(false, false, false, true, false),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if includeLecturer is true but includeCourseOnSemester is false', async () => {
      await expect(
        service.findAll(false, false, false, false, true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should filter by studentId', async () => {
      prismaService.studentCourseEnrollment.findMany.mockResolvedValue([
        mockEnrollment,
      ] as any);
      const result = await service.findAll(
        false,
        false,
        false,
        false,
        false,
        'student-1',
      );
      expect(result).toEqual([mockEnrollment]);
    });

    it('should filter by courseOnSemesterId', async () => {
      prismaService.studentCourseEnrollment.findMany.mockResolvedValue([
        mockEnrollment,
      ] as any);
      const result = await service.findAll(
        false,
        false,
        false,
        false,
        false,
        undefined,
        'cos-1',
      );
      expect(result).toEqual([mockEnrollment]);
    });

    it('should throw BadRequestException if lecturer not assigned to course semester', async () => {
      prismaService.courseOnSemester.findUnique.mockResolvedValue({
        lecturerId: 'other-lecturer',
      } as any);
      await expect(
        service.findAll(
          false,
          false,
          false,
          false,
          false,
          undefined,
          'cos-1',
          'lecturer-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow lecturer to filter if assigned to course', async () => {
      prismaService.courseOnSemester.findUnique.mockResolvedValue({
        lecturerId: 'lecturer-1',
      } as any);
      prismaService.studentCourseEnrollment.findMany.mockResolvedValue([
        mockEnrollment,
      ] as any);
      const result = await service.findAll(
        false,
        false,
        false,
        false,
        false,
        undefined,
        'cos-1',
        'lecturer-1',
      );
      expect(result).toEqual([mockEnrollment]);
    });
  });

  describe('findOne', () => {
    it('should return an enrollment by id', async () => {
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        mockEnrollment as any,
      );
      const result = await service.findOne('enrollment-1');
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw NotFoundException if enrollment not found', async () => {
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid include params', async () => {
      await expect(
        service.findOne('enrollment-1', false, false, true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException on database error', async () => {
      prismaService.studentCourseEnrollment.findUnique.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.findOne('enrollment-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create an enrollment', async () => {
      prismaService.studentCourseEnrollment.create.mockResolvedValue(
        mockEnrollment as any,
      );
      const result = await service.create({
        student: { connect: { id: 'student-1' } },
        courseOnSemester: { connect: { id: 'cos-1' } },
      });
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw ConflictException for P2002 error', async () => {
      const prismaError = { code: 'P2002' };
      prismaService.studentCourseEnrollment.create.mockRejectedValue(
        prismaError,
      );
      await expect(
        service.create({
          student: { connect: { id: 'student-1' } },
          courseOnSemester: { connect: { id: 'cos-1' } },
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.studentCourseEnrollment.create.mockRejectedValue(
        prismaError,
      );
      await expect(
        service.create({
          student: { connect: { id: 'nonexistent' } },
          courseOnSemester: { connect: { id: 'cos-1' } },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.studentCourseEnrollment.create.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(
        service.create({
          student: { connect: { id: 'student-1' } },
          courseOnSemester: { connect: { id: 'cos-1' } },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update an enrollment', async () => {
      const updatedEnrollment = { ...mockEnrollment, gradeType1: 85 };
      prismaService.studentCourseEnrollment.update.mockResolvedValue(
        updatedEnrollment as any,
      );
      const result = await service.update('enrollment-1', { gradeType1: 85 });
      expect(result).toEqual(updatedEnrollment);
    });

    it('should throw ConflictException for P2002 error', async () => {
      const prismaError = { code: 'P2002' };
      prismaService.studentCourseEnrollment.update.mockRejectedValue(
        prismaError,
      );
      await expect(
        service.update('enrollment-1', { gradeType1: 85 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.studentCourseEnrollment.update.mockRejectedValue(
        prismaError,
      );
      await expect(
        service.update('nonexistent', { gradeType1: 85 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.studentCourseEnrollment.update.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(
        service.update('enrollment-1', { gradeType1: 85 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete an enrollment and emit event', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        courseOnSemester: {
          course: { name: 'Test Course' },
        },
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithCourse as any,
      );
      prismaService.studentCourseEnrollment.delete.mockResolvedValue(
        mockEnrollment as any,
      );
      const result = await service.delete('enrollment-1');
      expect(result).toEqual(mockEnrollment);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.deleted_by_admin',
        enrollmentWithCourse,
        'Test Course',
      );
    });

    it('should throw NotFoundException if enrollment not found', async () => {
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(null);
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for P2025 error during delete', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        courseOnSemester: {
          course: { name: 'Test Course' },
        },
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithCourse as any,
      );
      const prismaError = { code: 'P2025' };
      prismaService.studentCourseEnrollment.delete.mockRejectedValue(
        prismaError,
      );
      await expect(service.delete('enrollment-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        courseOnSemester: {
          course: { name: 'Test Course' },
        },
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithCourse as any,
      );
      prismaService.studentCourseEnrollment.delete.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.delete('enrollment-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should use Unknown Course when course name is missing', async () => {
      const enrollmentWithoutCourseName = {
        ...mockEnrollment,
        courseOnSemester: null,
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithoutCourseName as any,
      );
      prismaService.studentCourseEnrollment.delete.mockResolvedValue(
        mockEnrollment as any,
      );
      await service.delete('enrollment-1');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.deleted_by_admin',
        enrollmentWithoutCourseName,
        'Unknown Course',
      );
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple enrollments', async () => {
      prismaService.studentCourseEnrollment.deleteMany.mockResolvedValue({
        count: 2,
      });
      const result = await service.deleteMany(['enrollment-1', 'enrollment-2']);
      expect(result).toEqual({ count: 2 });
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const prismaError = { code: 'P2025' };
      prismaService.studentCourseEnrollment.deleteMany.mockRejectedValue(
        prismaError,
      );
      await expect(service.deleteMany(['nonexistent'])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      prismaService.studentCourseEnrollment.deleteMany.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.deleteMany(['enrollment-1'])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkDuplicateEnrollment', () => {
    it('should return true if duplicate enrollment exists', async () => {
      courseSemesterService.findOne.mockResolvedValue(
        mockCourseOnSemester as any,
      );
      prismaService.studentCourseEnrollment.findFirst.mockResolvedValue(
        mockEnrollment as any,
      );
      const result = await service.checkDuplicateEnrollment(
        'student-1',
        'cos-1',
      );
      expect(result).toBe(true);
    });

    it('should return false if no duplicate enrollment exists', async () => {
      courseSemesterService.findOne.mockResolvedValue(
        mockCourseOnSemester as any,
      );
      prismaService.studentCourseEnrollment.findFirst.mockResolvedValue(null);
      const result = await service.checkDuplicateEnrollment(
        'student-1',
        'cos-1',
      );
      expect(result).toBe(false);
    });

    it('should handle course with null start/end time', async () => {
      const courseWithNullTimes = {
        ...mockCourseOnSemester,
        startTime: null,
        endTime: null,
      };
      courseSemesterService.findOne.mockResolvedValue(
        courseWithNullTimes as any,
      );
      prismaService.studentCourseEnrollment.findFirst.mockResolvedValue(null);
      const result = await service.checkDuplicateEnrollment(
        'student-1',
        'cos-1',
      );
      expect(result).toBe(false);
    });
  });

  describe('enrollStudentInCourse', () => {
    it('should enroll student in course and emit event', async () => {
      sessionService.isEnrollmentTimeValid.mockResolvedValue(true);
      courseSemesterService.findOne.mockResolvedValue(
        mockCourseOnSemester as any,
      );
      prismaService.studentCourseEnrollment.findFirst.mockResolvedValue(null);
      prismaService.studentCourseEnrollment.create.mockResolvedValue(
        mockEnrollment as any,
      );
      const result = await service.enrollStudentInCourse(
        mockStudent as any,
        'cos-1',
      );
      expect(result).toEqual(mockEnrollment);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.created',
        mockEnrollment,
        'Test Course',
      );
    });

    it('should throw BadRequestException if enrollment time is invalid', async () => {
      sessionService.isEnrollmentTimeValid.mockResolvedValue(false);
      courseSemesterService.findOne.mockResolvedValue(
        mockCourseOnSemester as any,
      );
      await expect(
        service.enrollStudentInCourse(mockStudent as any, 'cos-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if duplicate enrollment exists', async () => {
      sessionService.isEnrollmentTimeValid.mockResolvedValue(true);
      courseSemesterService.findOne.mockResolvedValue(
        mockCourseOnSemester as any,
      );
      prismaService.studentCourseEnrollment.findFirst.mockResolvedValue(
        mockEnrollment as any,
      );
      await expect(
        service.enrollStudentInCourse(mockStudent as any, 'cos-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('unenrollStudentFromCourse', () => {
    it('should unenroll student from course and emit event', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        courseOnSemester: {
          semesterId: 'semester-1',
          course: { name: 'Test Course' },
        },
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithCourse as any,
      );
      sessionService.isEnrollmentTimeValid.mockResolvedValue(true);
      prismaService.studentCourseEnrollment.deleteMany.mockResolvedValue({
        count: 1,
      });
      const result = await service.unenrollStudentFromCourse(
        mockStudent as any,
        'enrollment-1',
      );
      expect(result).toEqual({ count: 1 });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.deleted',
        enrollmentWithCourse,
        'Test Course',
      );
    });

    it('should throw BadRequestException if unenrollment time is invalid', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        courseOnSemester: {
          semesterId: 'semester-1',
          course: { name: 'Test Course' },
        },
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithCourse as any,
      );
      sessionService.isEnrollmentTimeValid.mockResolvedValue(false);
      await expect(
        service.unenrollStudentFromCourse(mockStudent as any, 'enrollment-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if enrollment not found for student', async () => {
      const enrollmentWithCourse = {
        ...mockEnrollment,
        courseOnSemester: {
          semesterId: 'semester-1',
          course: { name: 'Test Course' },
        },
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithCourse as any,
      );
      sessionService.isEnrollmentTimeValid.mockResolvedValue(true);
      prismaService.studentCourseEnrollment.deleteMany.mockResolvedValue({
        count: 0,
      });
      await expect(
        service.unenrollStudentFromCourse(mockStudent as any, 'enrollment-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateGradeByLecturer', () => {
    it('should update grades and calculate final grade', async () => {
      const enrollmentWithLecturer = {
        ...mockEnrollment,
        courseOnSemester: { lecturerId: 'lecturer-1' },
        student: mockStudent,
        gradeType1: 80,
        gradeType2: 85,
        gradeType3: 90,
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithLecturer as any,
      );
      prismaService.studentCourseEnrollment.update.mockResolvedValue({
        ...enrollmentWithLecturer,
        finalGrade: 87.5,
      } as any);
      const result = await service.updateGradeByLecturer(
        'enrollment-1',
        'lecturer-1',
        { gradeType1: 80, gradeType2: 85, gradeType3: 90 },
      );
      expect(result.gradeType1).toBe(80);
    });

    it('should throw NotFoundException if enrollment not found', async () => {
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(null);
      await expect(
        service.updateGradeByLecturer('nonexistent', 'lecturer-1', {
          gradeType1: 80,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if lecturer is not assigned', async () => {
      const enrollmentWithOtherLecturer = {
        ...mockEnrollment,
        courseOnSemester: { lecturerId: 'other-lecturer' },
        student: mockStudent,
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithOtherLecturer as any,
      );
      await expect(
        service.updateGradeByLecturer('enrollment-1', 'lecturer-1', {
          gradeType1: 80,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not calculate final grade if not all grades provided', async () => {
      const enrollmentWithLecturer = {
        ...mockEnrollment,
        courseOnSemester: { lecturerId: 'lecturer-1' },
        student: mockStudent,
        gradeType1: null,
        gradeType2: null,
        gradeType3: null,
      };
      prismaService.studentCourseEnrollment.findUnique.mockResolvedValue(
        enrollmentWithLecturer as any,
      );
      prismaService.studentCourseEnrollment.update.mockResolvedValue({
        ...enrollmentWithLecturer,
        gradeType1: 80,
        finalGrade: null,
      } as any);
      const result = await service.updateGradeByLecturer(
        'enrollment-1',
        'lecturer-1',
        { gradeType1: 80 },
      );
      expect(result.finalGrade).toBeNull();
    });
  });
});
