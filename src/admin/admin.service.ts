import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Admin, Department, Lecturer, Prisma, Student } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentService } from 'src/user-manager/student/student.service';
import { LecturerService } from 'src/user-manager/lecturer/lecturer.service';
import {
  CreateMultipleStudentsDto,
  CreateStudentDto,
  UpdateStudentDto,
} from './dto/student.dto';
import { DepartmentService } from 'src/department/department.service';
import * as bcrypt from 'bcrypt';
import {
  CreateDepartmentDto,
  CreateMultipleDepartmentsDto,
  UpdateDepartmentDto,
} from './dto/department.dto';
import {
  CreateLecturerDto,
  CreateMultipleLecturersDto,
  UpdateLecturerDto,
} from './dto/lecturer.dto';
import { CourseService } from 'src/course/course.service';
import { DocumentService } from 'src/course/document/document.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { SemesterService } from 'src/semester/semester.service';
import {
  CourseOnSemesterDto,
  CreateSemesterDto,
  UpdateSemesterDto,
} from './dto/semester.dto';
import { CourseSemesterService } from 'src/semester/course-semester/course-semester.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentService: StudentService,
    private readonly lecturerService: LecturerService,
    private readonly departmentService: DepartmentService,
    private readonly courseService: CourseService,
    private readonly documentService: DocumentService,
    private readonly semesterService: SemesterService,
    private readonly courseOnSemesterService: CourseSemesterService,
  ) {}

  async findAll(): Promise<Admin[]> {
    return await this.prisma.admin.findMany();
  }

  async findById(id: string): Promise<Admin> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id },
      });
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
      return admin;
    } catch (error) {
      this.logger.error('Failed to retrieve admin', error.stack);
      throw new NotFoundException('Admin not found');
    }
  }

  async findByUsername(username: string): Promise<Admin> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { username },
      });
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
      return admin;
    } catch (error) {
      this.logger.error('Failed to retrieve admin', error.stack);
      throw new NotFoundException('Admin not found');
    }
  }

  async create(data: Prisma.AdminCreateInput): Promise<Admin> {
    try {
      return await this.prisma.admin.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(`Username ${data.username} already exists`);
          throw new ConflictException('Username already exists');
        }
      }
      this.logger.error('Failed to create admin', error.stack);
      throw new BadRequestException('Failed to create admin');
    }
  }

  async update(id: string, data: Prisma.AdminUpdateInput): Promise<Admin> {
    try {
      return await this.prisma.admin.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Admin with ID ${id} not found`);
          throw new NotFoundException('Admin not found');
        }
        if (error.code === 'P2002') {
          this.logger.warn(
            `Username ${typeof data.username === 'string' ? data.username : ''} already exists`,
          );
          throw new ConflictException('Username already exists');
        }
      }
      this.logger.error('Failed to update admin', error.stack);
      throw new BadRequestException('Failed to update admin');
    }
  }

  async delete(id: string): Promise<Admin> {
    try {
      return await this.prisma.admin.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(`Admin with ID ${id} not found`);
          throw new NotFoundException('Admin not found');
        }
      }
      this.logger.error('Failed to delete admin', error.stack);
      throw new BadRequestException('Failed to delete admin');
    }
  }

  /*
   * Admin services methods for managing departments
   */

  async getAllDepartmentsService(): Promise<Department[]> {
    return await this.departmentService.findAll();
  }

  async getDepartmentByIdService(id: string): Promise<Department> {
    return await this.departmentService.findById(id);
  }

  async createDepartmentService(
    data: CreateDepartmentDto,
  ): Promise<Department> {
    return await this.departmentService.create(data);
  }

  async createMultipleDepartmentsService(
    data: CreateMultipleDepartmentsDto,
  ): Promise<{ message: string }> {
    return await this.departmentService.createMany(data.departments);
  }

  async updateDepartmentService(
    id: string,
    data: UpdateDepartmentDto,
  ): Promise<Department> {
    return await this.departmentService.update(id, data);
  }

  async deleteDepartmentService(id: string): Promise<Department> {
    return await this.departmentService.delete(id);
  }

  async deleteMultipleDepartmentsService(
    ids: string[],
  ): Promise<{ message: string }> {
    return await this.departmentService.deleteMany(ids);
  }

  /*
   * Admin services methods for managing students
   */

  async getAllStudentAccountsService(): Promise<Student[]> {
    return await this.studentService.findAll();
  }

  async getStudentAccountByIdService(id: string): Promise<Student> {
    return await this.studentService.findById(id);
  }

  async getStudentAccountByConditionService(
    email?: string,
    studentId?: string,
    username?: string,
    citizenId?: string,
    phone?: string,
  ): Promise<Student> {
    return await this.studentService.findByCondition(
      email,
      studentId,
      username,
      citizenId,
      phone,
    );
  }

  async getStudentByDepartmentIdService(
    departmentId: string,
  ): Promise<Student[]> {
    return await this.studentService.filterByDepartment(departmentId);
  }

  async createStudentAccountService(data: CreateStudentDto): Promise<Student> {
    const { departmentId, ...studentData } = data;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(studentData.password, salt);
    studentData.password = hashedPassword;
    return await this.studentService.create({
      ...studentData,
      department: { connect: { id: departmentId } },
    });
  }

  async createMultipleStudentAccountsService(
    data: CreateMultipleStudentsDto,
  ): Promise<{ message: string }> {
    return await this.studentService.createMultipleStudents(
      data.students.map((student) => {
        const { password, ...studentData } = student;
        return {
          ...studentData,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
          department: { connect: { id: student.departmentId } },
        };
      }),
    );
  }

  async updateStudentAccountService(
    id: string,
    data: UpdateStudentDto,
  ): Promise<Student> {
    const {
      departmentId,

      newPassword,
      confirmPassword,
      ...studentData
    } = data;
    let password: string | undefined = undefined;
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        throw new BadRequestException(
          'New password and confirm password do not match',
        );
      }
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(newPassword, salt);
    }
    return await this.studentService.update(id, {
      ...studentData,
      ...(password && { password }),
      ...(departmentId && { department: { connect: { id: departmentId } } }),
    });
  }

  async deleteStudentAccountService(id: string): Promise<Student> {
    return await this.studentService.delete(id);
  }

  async deleteMultipleStudentAccountsService(
    ids: string[],
  ): Promise<{ message: string }> {
    return await this.studentService.deleteMany(ids);
  }

  /*
   * Admin services methods for managing lecturers
   */

  async getAllLecturerAccountsService(): Promise<Lecturer[]> {
    return await this.lecturerService.findAll();
  }

  async getLecturerAccountByIdService(id: string): Promise<Lecturer> {
    return await this.lecturerService.findById(id);
  }

  async createLecturerAccountService(
    data: CreateLecturerDto,
  ): Promise<Lecturer> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    data.password = hashedPassword;
    return await this.lecturerService.create(data);
  }

  async createMultipleLecturerAccountsService(
    data: CreateMultipleLecturersDto,
  ): Promise<{ message: string }> {
    return await this.lecturerService.createMultipleLecturers(
      data.lecturers.map((lecturer) => {
        const { password, ...lecturerData } = lecturer;
        return {
          ...lecturerData,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
        };
      }),
    );
  }

  async updateLecturerAccountService(
    id: string,
    data: UpdateLecturerDto,
  ): Promise<Lecturer> {
    const { newPassword, confirmPassword, ...lecturerData } = data;
    let password: string | undefined = undefined;
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        throw new BadRequestException(
          'New password and confirm password do not match',
        );
      }
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(newPassword, salt);
    }
    return await this.lecturerService.update(id, {
      ...lecturerData,
      ...(password && { password }),
    });
  }

  async deleteLecturerAccountService(id: string): Promise<Lecturer> {
    return await this.lecturerService.delete(id);
  }

  async deleteMultipleLecturerAccountsService(
    ids: string[],
  ): Promise<{ message: string }> {
    return await this.lecturerService.deleteMany(ids);
  }

  /*
   * Admin services methods for managing courses
   */

  async getAllCoursesService(
    includeDepartment = false,
    includeDocuments = false,
  ) {
    return await this.courseService.findAll(
      includeDepartment,
      includeDocuments,
    );
  }

  async getAllCoursesByDepartmentIdService(
    departmentId: string,
    includeDocuments = false,
    includeDepartment = false,
  ) {
    return await this.courseService.findByDepartmentId(
      departmentId,
      includeDocuments,
      includeDepartment,
    );
  }

  async getCourseByIdService(
    id: string,
    includeDocuments = false,
    includeDepartment = false,
  ) {
    return await this.courseService.findOne(
      id,
      includeDocuments,
      includeDepartment,
    );
  }

  async createCourseService(
    data: CreateCourseDto,
    files: Express.Multer.File[],
  ) {
    const { courseDocuments, ...courseData } = data;
    const createdCourse = await this.courseService.create({
      ...courseData,
      department: { connect: { id: data.departmentId } },
    });
    if (courseDocuments && courseDocuments.length > 0) {
      const documentsData = courseDocuments.map((doc) => {
        const file = files.find((file) => file.fieldname === doc.id.toString());
        if (!file) {
          throw new BadRequestException(
            `File for document ${doc.title} not found`,
          );
        }
        return {
          ...doc,
          courseId: createdCourse.id,
          file,
        };
      });
      await this.documentService.createMany(documentsData);
    }
    return {
      message: 'Course created successfully',
    };
  }

  async updateCourseService(
    id: string,
    data: UpdateCourseDto,
    files: Express.Multer.File[],
  ) {
    const { updateDocuments, createDocuments, departmentId, ...courseData } =
      data;
    await Promise.all([
      this.courseService.update(id, {
        ...courseData,
        ...(departmentId && {
          department: { connect: { id: departmentId } },
        }),
      }),
      ...(createDocuments && createDocuments.length > 0
        ? [
            this.documentService.createMany(
              createDocuments.map((doc) => {
                const file = files.find(
                  (file) => file.fieldname === doc.id.toString(),
                );
                if (!file) {
                  throw new BadRequestException(
                    `File for document ${doc.title} not found`,
                  );
                }
                return {
                  ...doc,
                  courseId: id,
                  file,
                };
              }),
            ),
          ]
        : []),
      ...(updateDocuments && updateDocuments.length > 0
        ? [
            this.documentService.updateMany(
              updateDocuments.map((doc) => ({
                id: doc.id,
                title: doc.title,
                file: files.find(
                  (file) => file.fieldname === doc.id.toString(),
                ),
              })),
            ),
          ]
        : []),
      ...(data.deleteDocumentIds && data.deleteDocumentIds.length > 0
        ? [this.documentService.deleteMany(data.deleteDocumentIds)]
        : []),
    ]);
    return {
      message: 'Course updated successfully',
    };
  }

  async deleteCourseService(id: string) {
    return await this.courseService.remove(id);
  }

  async deleteManyCoursesService(ids: string[]) {
    return await this.courseService.removeMany(ids);
  }

  /*
   * Admin services methods for managing semesters
   */

  async getAllSemestersService(
    includeCourses = false,
    includeSemesters = false,
  ) {
    return await this.semesterService.findAll(includeCourses, includeSemesters);
  }

  async getSemesterByIdService(
    id: string,
    includeCourses = false,
    includeSemesters = false,
  ) {
    return await this.courseService.findOne(
      id,
      includeCourses,
      includeSemesters,
    );
  }

  async createSemesterService(data: CreateSemesterDto) {
    return await this.semesterService.create(data);
  }

  async updateSemesterService(id: string, data: UpdateSemesterDto) {
    return await this.semesterService.update(id, data);
  }

  async deleteSemesterService(id: string) {
    return await this.semesterService.delete(id);
  }

  async deleteManySemestersService(ids: string[]) {
    return await this.semesterService.deleteMany(ids);
  }

  /*
   * Admin services methods for managing courses on semesters
   */

  async getAllCoursesOnSemestersService(
    includeCourses = false,
    includeSemesters = false,
    courseId?: string,
    semesterId?: string,
  ) {
    return await this.courseOnSemesterService.findAll(
      includeCourses,
      includeSemesters,
      courseId,
      semesterId,
    );
  }

  async getCourseOnSemesterByIdService(
    id: string,
    includeCourses = false,
    includeSemesters = false,
  ) {
    return await this.courseOnSemesterService.findOne(
      id,
      includeCourses,
      includeSemesters,
    );
  }

  async createCourseToSemesterService(data: CourseOnSemesterDto) {
    const { semesterId, courseId, lecturerId, ...courseOnSemesterData } = data;
    if (
      await this.prisma.courseOnSemester.findFirst({
        where: {
          lecturerId: lecturerId,
          dayOfWeek: courseOnSemesterData.dayOfWeek,
          startTime: { lt: courseOnSemesterData.endTime },
          endTime: { gt: courseOnSemesterData.startTime },
        },
      })
    ) {
      throw new BadRequestException(
        `Lecturer with ID ${lecturerId} has a scheduling conflict on day ${courseOnSemesterData.dayOfWeek} between ${courseOnSemesterData.startTime} and ${courseOnSemesterData.endTime}`,
      );
    }
    return await this.courseOnSemesterService.create({
      ...courseOnSemesterData,
      semester: { connect: { id: semesterId } },
      course: { connect: { id: courseId } },
      lecturer: { connect: { id: lecturerId } },
    });
  }

  async updateCourseOnSemesterService(id: string, data: CourseOnSemesterDto) {
    const { semesterId, courseId, lecturerId, ...courseOnSemesterData } = data;
    if (
      await this.prisma.courseOnSemester.findFirst({
        where: {
          lecturerId: lecturerId,
          dayOfWeek: courseOnSemesterData.dayOfWeek,
          startTime: { lt: courseOnSemesterData.endTime },
          endTime: { gt: courseOnSemesterData.startTime },
          NOT: { id: id },
        },
      })
    ) {
      throw new BadRequestException(
        `Lecturer with ID ${lecturerId} has a scheduling conflict on day ${courseOnSemesterData.dayOfWeek} between ${courseOnSemesterData.startTime} and ${courseOnSemesterData.endTime}`,
      );
    }
    return await this.courseOnSemesterService.update(id, {
      ...courseOnSemesterData,
      semester: { connect: { id: semesterId } },
      course: { connect: { id: courseId } },
      lecturer: { connect: { id: lecturerId } },
    });
  }

  async deleteCourseFromSemesterService(id: string) {
    return await this.courseOnSemesterService.delete(id);
  }

  async deleteManyCoursesFromSemestersService(ids: string[]) {
    return await this.courseOnSemesterService.deleteMany(ids);
  }
}
