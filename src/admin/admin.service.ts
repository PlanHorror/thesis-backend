import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Admin, Department, Lecturer, Prisma, Student } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { CourseService } from "src/course/course.service";
import { DocumentService } from "src/course/document/document.service";
import { EnrollmentService } from "src/course/enrollment/enrollment.service";
import { SessionService } from "src/course/enrollment/session/session.service";
import { DepartmentService } from "src/department/department.service";
import { ExamScheduleService } from "src/exam-schedule/exam-schedule.service";
import { NotificationService } from "src/notification/notification.service";
import { PostService } from "src/post/post.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CourseSemesterService } from "src/semester/course-semester/course-semester.service";
import { SemesterService } from "src/semester/semester.service";
import { LecturerService } from "src/user-manager/lecturer/lecturer.service";
import { StudentService } from "src/user-manager/student/student.service";
import { WebhookService } from "src/webhook/webhook.service";
import {
  CreateCourseEnrollmentDto,
  UpdateCourseEnrollmentDto,
} from "./dto/course-enrollment.dto";
import {
  CreateCourseDto,
  CreateMultipleCoursesDto,
  UpdateCourseDto,
} from "./dto/course.dto";
import {
  CreateDepartmentDto,
  CreateMultipleDepartmentsDto,
  UpdateDepartmentDto,
} from "./dto/department.dto";
import {
  CreateEnrollmentSessionDto,
  CreateMultipleEnrollmentSessionsDto,
  UpdateEnrollmentSessionDto,
} from "./dto/enrollment-session.dto";
import {
  CreateExamScheduleDto,
  CreateMultipleExamSchedulesDto,
  UpdateExamScheduleDto,
} from "./dto/exam-schedule.dto";
import {
  CreateLecturerDto,
  CreateMultipleLecturersDto,
  UpdateLecturerDto,
} from "./dto/lecturer.dto";
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from "./dto/notification.dto";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import {
  CourseOnSemesterDto,
  CreateSemesterDto,
  UpdateSemesterDto,
} from "./dto/semester.dto";
import {
  CreateMultipleStudentsDto,
  CreateStudentDto,
  UpdateStudentDto,
} from "./dto/student.dto";
import { CreateWebhookDto, UpdateWebhookDto } from "./dto/webhook.dto";

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
    private readonly enrollmentService: EnrollmentService,
    private readonly sessionService: SessionService,
    private readonly examScheduleService: ExamScheduleService,
    private readonly notificationService: NotificationService,
    private readonly webhookService: WebhookService,
    private readonly postService: PostService,
    private readonly eventEmitter: EventEmitter2,
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
        throw new NotFoundException("Admin not found");
      }
      return admin;
    } catch (error) {
      this.logger.error("Failed to retrieve admin", error.stack);
      throw new NotFoundException("Admin not found");
    }
  }

  async findByUsername(username: string): Promise<Admin> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { username },
      });
      if (!admin) {
        throw new NotFoundException("Admin not found");
      }
      return admin;
    } catch (error) {
      this.logger.error("Failed to retrieve admin", error.stack);
      throw new NotFoundException("Admin not found");
    }
  }

  async create(data: Prisma.AdminCreateInput): Promise<Admin> {
    try {
      return await this.prisma.admin.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          this.logger.warn(`Username ${data.username} already exists`);
          throw new ConflictException("Username already exists");
        }
      }
      this.logger.error("Failed to create admin", error.stack);
      throw new BadRequestException("Failed to create admin");
    }
  }

  async update(id: string, data: Prisma.AdminUpdateInput): Promise<Admin> {
    try {
      return await this.prisma.admin.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          this.logger.warn(`Admin with ID ${id} not found`);
          throw new NotFoundException("Admin not found");
        }
        if (error.code === "P2002") {
          this.logger.warn(
            `Username ${typeof data.username === "string" ? data.username : ""} already exists`,
          );
          throw new ConflictException("Username already exists");
        }
      }
      this.logger.error("Failed to update admin", error.stack);
      throw new BadRequestException("Failed to update admin");
    }
  }

  async delete(id: string): Promise<Admin> {
    try {
      return await this.prisma.admin.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          this.logger.warn(`Admin with ID ${id} not found`);
          throw new NotFoundException("Admin not found");
        }
      }
      this.logger.error("Failed to delete admin", error.stack);
      throw new BadRequestException("Failed to delete admin");
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
    const department = await this.departmentService.create(data);
    this.eventEmitter.emit("department.created", department);
    return department;
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
    return this.prisma.student.findMany({
      include: { department: { select: { id: true, name: true } } },
    }) as Promise<Student[]>;
  }

  async getStudentAccountByIdService(id: string): Promise<Student> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { department: { select: { id: true, name: true } } },
    });
    if (!student) {
      throw new NotFoundException("Account not found");
    }
    return student as unknown as Student;
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
    const { departmentId, newPassword, confirmPassword, ...studentData } = data;
    let password: string | undefined = undefined;
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        throw new BadRequestException(
          "New password and confirm password do not match",
        );
      }
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(newPassword, salt);
    }
    const current = await this.prisma.student.findUnique({
      where: { id },
    });
    if (!current) {
      throw new NotFoundException("Account not found");
    }
    const same = (a: unknown, b: unknown) =>
      String(a ?? "").trim() === String(b ?? "").trim();
    const payload: Record<string, unknown> = { ...studentData };
    if (same(payload.email, current.email)) delete payload.email;
    if (same(payload.username, current.username)) delete payload.username;
    if (same(payload.studentId, current.studentId)) delete payload.studentId;
    if (same(payload.citizenId, current.citizenId)) delete payload.citizenId;
    if (same(payload.phone, current.phone)) delete payload.phone;
    return await this.studentService.update(id, {
      ...payload,
      ...(password && { password }),
      ...(departmentId && { department: { connect: { id: departmentId } } }),
    } as Prisma.StudentUpdateInput);
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
    return await this.prisma.lecturer.findMany({
      include: { departmentHead: true },
    });
  }

  async getLecturerAccountByIdService(id: string): Promise<Lecturer> {
    return await this.prisma.lecturer.findUniqueOrThrow({
      where: { id },
      include: { departmentHead: true },
    });
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
    const { newPassword, confirmPassword, departmentHeadId, ...lecturerData } =
      data;
    let password: string | undefined;
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        throw new BadRequestException(
          "New password and confirm password do not match",
        );
      }
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(newPassword, salt);
    }
    // Assign lecturer as department head: update Department.headId (FK on Department)
    if (departmentHeadId !== undefined) {
      await this.prisma.department.updateMany({
        where: { headId: id },
        data: { headId: null },
      });
      if (departmentHeadId) {
        await this.prisma.department.update({
          where: { id: departmentHeadId },
          data: { headId: id },
        });
      }
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
    includeCourseOnSemesters = false,
  ) {
    return await this.courseService.findAll(
      includeDepartment,
      includeCourseOnSemesters,
    );
  }

  async getAllCoursesByDepartmentIdService(
    departmentId: string,
    includeDepartment = false,
  ) {
    return await this.courseService.findByDepartmentId(
      departmentId,
      includeDepartment,
    );
  }

  async getCourseByIdService(
    id: string,
    includeDepartment = false,
    includeCourseOnSemesters = false,
  ) {
    return await this.courseService.findOne(
      id,
      includeDepartment,
      includeCourseOnSemesters,
    );
  }

  async createCourseService(data: CreateCourseDto) {
    const { departmentId, semesterId, recommendedSemester, ...courseData } =
      data;
    const createdCourse = await this.courseService.create({
      ...courseData,
      ...(recommendedSemester?.trim() && {
        recommendedSemester: recommendedSemester.trim(),
      }),
      ...(departmentId && {
        department: { connect: { id: departmentId } },
      }),
    });
    if (semesterId) {
      await this.courseOnSemesterService.create({
        course: { connect: { id: createdCourse.id } },
        semester: { connect: { id: semesterId } },
      });
    }
    this.eventEmitter.emit("course.created", createdCourse);
    return {
      message: "Course created successfully",
    };
  }

  async createMultipleCoursesService(data: CreateMultipleCoursesDto) {
    const courses = data.courses.map((c) => ({
      name: c.name,
      credits: c.credits,
      ...(c.departmentId && { departmentId: c.departmentId }),
      ...(c.recommendedSemester?.trim() && {
        recommendedSemester: c.recommendedSemester.trim(),
      }),
      ...(c.description?.trim() && { description: c.description.trim() }),
    }));
    const result = await this.courseService.createMany(courses);
    return { message: result.message, created: result.count };
  }

  async updateCourseService(id: string, data: UpdateCourseDto) {
    const { departmentId, recommendedSemester, ...courseData } = data;
    await this.courseService.update(id, {
      ...courseData,
      ...(recommendedSemester !== undefined && {
        recommendedSemester: recommendedSemester?.trim() || null,
      }),
      ...(departmentId && {
        department: { connect: { id: departmentId } },
      }),
    });
    return {
      message: "Course updated successfully",
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
    includeCoursesOnSemester = false,
    includeDocuments = false,
    includeCourse = false,
  ) {
    return await this.semesterService.findAll(
      includeCoursesOnSemester,
      includeDocuments,
      includeCourse,
    );
  }

  async getSemesterByIdService(
    id: string,
    includeCoursesOnSemester = false,
    includeDocuments = false,
    includeCourse = false,
  ) {
    return await this.semesterService.findById(
      id,
      includeCoursesOnSemester,
      includeDocuments,
      includeCourse,
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
    includeLecturer = false,
    includeEnrollmentCount = false,
    courseId?: string,
    semesterId?: string,
  ) {
    return await this.courseOnSemesterService.findAll(
      includeCourses,
      includeSemesters,
      includeLecturer,
      includeEnrollmentCount,
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

  async createCourseToSemesterService(
    data: CourseOnSemesterDto,
    files: Express.Multer.File[],
  ) {
    const {
      semesterId,
      courseId,
      lecturerId,
      dayOfWeek,
      startTime,
      endTime,
      courseDocuments,
      createDocuments,
      updateDocuments,
      deleteDocumentIds,
      ...rest
    } = data;

    const hasSchedule =
      lecturerId != null &&
      dayOfWeek != null &&
      startTime != null &&
      endTime != null;
    if (hasSchedule) {
      const conflict = await this.prisma.courseOnSemester.findFirst({
        where: {
          lecturerId,
          dayOfWeek,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });
      if (conflict) {
        throw new BadRequestException(
          `Lecturer with ID ${lecturerId} has a scheduling conflict on day ${dayOfWeek} between ${startTime} and ${endTime}`,
        );
      }
    }

    const createdCourseOnSemester = await this.courseOnSemesterService.create({
      ...rest,
      ...(dayOfWeek != null && { dayOfWeek }),
      ...(startTime != null && { startTime }),
      ...(endTime != null && { endTime }),
      semester: { connect: { id: semesterId } },
      course: { connect: { id: courseId } },
      ...(lecturerId && { lecturer: { connect: { id: lecturerId } } }),
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
          courseOnSemesterId: createdCourseOnSemester.id,
          file,
        };
      });
      await this.documentService.createMany(documentsData);
    }

    return createdCourseOnSemester;
  }

  async updateCourseOnSemesterService(
    id: string,
    data: CourseOnSemesterDto,
    files: Express.Multer.File[],
  ) {
    const {
      semesterId,
      courseId,
      lecturerId,
      updateDocuments,
      createDocuments,
      deleteDocumentIds,
      ...courseOnSemesterData
    } = data;
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

    await Promise.all([
      this.courseOnSemesterService.update(id, {
        ...courseOnSemesterData,
        semester: { connect: { id: semesterId } },
        course: { connect: { id: courseId } },
        lecturer: { connect: { id: lecturerId } },
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
                  courseOnSemesterId: id,
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
      ...(deleteDocumentIds && deleteDocumentIds.length > 0
        ? [this.documentService.deleteMany(deleteDocumentIds)]
        : []),
    ]);

    return {
      message: "Course on semester updated successfully",
    };
  }

  async deleteCourseFromSemesterService(id: string) {
    return await this.courseOnSemesterService.delete(id);
  }

  async deleteManyCoursesFromSemestersService(ids: string[]) {
    return await this.courseOnSemesterService.deleteMany(ids);
  }

  /*
   * Admin services methods for managing enrollments
   */

  async getAllEnrollmentsService(
    includeStudent = false,
    includeCourseOnSemester = false,
    includeCourse = false,
    includeSemester = false,
    includeLecturer = false,
    studentId?: string,
    courseOnSemesterId?: string,
  ) {
    return await this.enrollmentService.findAll(
      includeStudent,
      includeCourseOnSemester,
      includeCourse,
      includeSemester,
      includeLecturer,
      studentId,
      courseOnSemesterId,
    );
  }

  async getEnrollmentByIdService(
    id: string,
    includeStudent = false,
    includeCourseOnSemester = false,
    includeCourse = false,
    includeSemester = false,
    includeLecturer = false,
  ) {
    return await this.enrollmentService.findOne(
      id,
      includeStudent,
      includeCourseOnSemester,
      includeCourse,
      includeSemester,
      includeLecturer,
    );
  }

  async createEnrollmentService(data: CreateCourseEnrollmentDto) {
    return await this.enrollmentService.create({
      student: { connect: { id: data.studentId } },
      courseOnSemester: { connect: { id: data.courseOnSemesterId } },
      gradeType1: data.gradeType1,
      gradeType2: data.gradeType2,
      gradeType3: data.gradeType3,
      finalGrade:
        data.gradeType1 && data.gradeType2 && data.gradeType3
          ? data.gradeType1 * 0.1 +
            data.gradeType2 * 0.3 +
            data.gradeType3 * 0.6
          : null,
    });
  }

  async updateEnrollmentService(id: string, data: UpdateCourseEnrollmentDto) {
    return await this.enrollmentService.update(id, {
      ...data,
      finalGrade:
        data.gradeType1 && data.gradeType2 && data.gradeType3
          ? data.gradeType1 * 0.1 +
            data.gradeType2 * 0.3 +
            data.gradeType3 * 0.6
          : null,
    });
  }

  async deleteEnrollmentService(id: string) {
    return await this.enrollmentService.delete(id);
  }

  async deleteManyEnrollmentsService(ids: string[]) {
    return await this.enrollmentService.deleteMany(ids);
  }

  // Enrollment Session Methods
  async getAllEnrollmentSessionsService() {
    try {
      return await this.sessionService.findAll(true);
    } catch (error) {
      this.logger.error("Failed to retrieve enrollment sessions", error);
      throw error;
    }
  }

  async getEnrollmentSessionByIdService(id: string) {
    try {
      return await this.sessionService.findById(id, true);
    } catch (error) {
      this.logger.error("Failed to retrieve enrollment session", error);
      throw error;
    }
  }

  async getEnrollmentSessionsBySemesterIdService(semesterId: string) {
    try {
      return await this.sessionService.findBySemesterId(semesterId, true);
    } catch (error) {
      this.logger.error("Failed to retrieve enrollment sessions", error);
      throw error;
    }
  }

  async createEnrollmentSessionService(data: CreateEnrollmentSessionDto) {
    try {
      return await this.sessionService.create({
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
        semester: { connect: { id: data.semesterId } },
      });
    } catch (error) {
      this.logger.error("Failed to create enrollment session", error);
      throw error;
    }
  }

  async createMultipleEnrollmentSessionsService(
    data: CreateMultipleEnrollmentSessionsDto,
  ) {
    try {
      const formattedSessions = data.sessions.map((session) => ({
        name: session.name,
        startDate: new Date(session.startDate),
        endDate: new Date(session.endDate),
        isActive: session.isActive ?? true,
        semesterId: session.semesterId,
      }));
      return await this.sessionService.createMany(formattedSessions);
    } catch (error) {
      this.logger.error("Failed to create enrollment sessions", error);
      throw error;
    }
  }

  async updateEnrollmentSessionService(
    id: string,
    data: UpdateEnrollmentSessionDto,
  ) {
    try {
      const updateData: Prisma.EnrollmentSessionUpdateInput = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.startDate !== undefined)
        updateData.startDate = new Date(data.startDate);
      if (data.endDate !== undefined)
        updateData.endDate = new Date(data.endDate);
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.semesterId !== undefined)
        updateData.semester = { connect: { id: data.semesterId } };

      return await this.sessionService.update(id, updateData);
    } catch (error) {
      this.logger.error("Failed to update enrollment session", error);
      throw error;
    }
  }

  async deleteEnrollmentSessionService(id: string) {
    try {
      return await this.sessionService.delete(id);
    } catch (error) {
      this.logger.error("Failed to delete enrollment session", error);
      throw error;
    }
  }

  async deleteMultipleEnrollmentSessionsService(ids: string[]) {
    try {
      return await this.sessionService.deleteMany(ids);
    } catch (error) {
      this.logger.error("Failed to delete enrollment sessions", error);
      throw error;
    }
  }

  // ==================== Exam Schedule Methods ====================

  async getAllExamSchedulesService(includeCourseOnSemester = false) {
    try {
      return await this.examScheduleService.findAll(includeCourseOnSemester);
    } catch (error) {
      this.logger.error("Failed to retrieve exam schedules", error);
      throw error;
    }
  }

  async getExamScheduleByIdService(
    id: string,
    includeCourseOnSemester = false,
  ) {
    try {
      return await this.examScheduleService.findById(
        id,
        includeCourseOnSemester,
      );
    } catch (error) {
      this.logger.error("Failed to retrieve exam schedule", error);
      throw error;
    }
  }

  async createExamScheduleService(data: CreateExamScheduleDto) {
    try {
      const examScheduleData: Prisma.ExamScheduleCreateInput = {
        courseOnSemester: { connect: { id: data.courseOnSemesterId } },
        examDate: data.examDate,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        location: data.location,
        description: data.description,
      };
      return await this.examScheduleService.create(examScheduleData);
    } catch (error) {
      this.logger.error("Failed to create exam schedule", error);
      throw error;
    }
  }

  async createMultipleExamSchedulesService(
    data: CreateMultipleExamSchedulesDto,
  ) {
    try {
      const examSchedules = data.examSchedules.map((schedule) => ({
        courseOnSemesterId: schedule.courseOnSemesterId,
        examDate: schedule.examDate,
        startTime: schedule.startTime
          ? new Date(schedule.startTime)
          : undefined,
        endTime: schedule.endTime ? new Date(schedule.endTime) : undefined,
        location: schedule.location,
        description: schedule.description,
      }));
      return await this.examScheduleService.createMany(examSchedules);
    } catch (error) {
      this.logger.error("Failed to create exam schedules", error);
      throw error;
    }
  }

  async updateExamScheduleService(id: string, data: UpdateExamScheduleDto) {
    try {
      const updateData: Prisma.ExamScheduleUpdateInput = {};
      if (data.courseOnSemesterId !== undefined) {
        updateData.courseOnSemester = {
          connect: { id: data.courseOnSemesterId },
        };
      }
      if (data.examDate !== undefined) updateData.examDate = data.examDate;
      if (data.startTime !== undefined)
        updateData.startTime = new Date(data.startTime);
      if (data.endTime !== undefined)
        updateData.endTime = new Date(data.endTime);
      if (data.location !== undefined) updateData.location = data.location;
      if (data.description !== undefined)
        updateData.description = data.description;

      return await this.examScheduleService.update(id, updateData);
    } catch (error) {
      this.logger.error("Failed to update exam schedule", error);
      throw error;
    }
  }

  async deleteExamScheduleService(id: string) {
    try {
      return await this.examScheduleService.delete(id);
    } catch (error) {
      this.logger.error("Failed to delete exam schedule", error);
      throw error;
    }
  }

  async deleteMultipleExamSchedulesService(ids: string[]) {
    try {
      return await this.examScheduleService.deleteMany(ids);
    } catch (error) {
      this.logger.error("Failed to delete exam schedules", error);
      throw error;
    }
  }

  // ==================== Notification Methods ====================

  async getAllNotificationsService() {
    try {
      return await this.notificationService.findAll();
    } catch (error) {
      this.logger.error("Failed to retrieve notifications", error);
      throw error;
    }
  }

  async getNotificationByIdService(id: string) {
    try {
      return await this.notificationService.findById(id);
    } catch (error) {
      this.logger.error("Failed to retrieve notification", error);
      throw error;
    }
  }

  async getNotificationsByUserService(lecturerId?: string, studentId?: string) {
    try {
      return await this.notificationService.findByUser(lecturerId, studentId);
    } catch (error) {
      this.logger.error("Failed to retrieve notifications", error);
      throw error;
    }
  }

  async createNotificationService(data: CreateNotificationDto) {
    try {
      const notificationData: Prisma.NotificationCreateInput = {
        title: data.title,
        message: data.message,
        type: data.type,
        ...(data.studentId && { student: { connect: { id: data.studentId } } }),
        ...(data.lecturerId && {
          lecturer: { connect: { id: data.lecturerId } },
        }),
      };
      return await this.notificationService.create(notificationData);
    } catch (error) {
      this.logger.error("Failed to create notification", error);
      throw error;
    }
  }

  async updateNotificationService(id: string, data: UpdateNotificationDto) {
    try {
      const updateData: Prisma.NotificationUpdateInput = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.message !== undefined) updateData.message = data.message;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.isRead !== undefined) updateData.isRead = data.isRead;
      if (data.studentId !== undefined) {
        updateData.student = { connect: { id: data.studentId } };
      }
      if (data.lecturerId !== undefined) {
        updateData.lecturer = { connect: { id: data.lecturerId } };
      }

      return await this.notificationService.update(id, updateData);
    } catch (error) {
      this.logger.error("Failed to update notification", error);
      throw error;
    }
  }

  async deleteNotificationService(id: string) {
    try {
      return await this.notificationService.delete(id);
    } catch (error) {
      this.logger.error("Failed to delete notification", error);
      throw error;
    }
  }

  // Webhook methods
  async getAllWebhooksService() {
    try {
      return await this.webhookService.findAll();
    } catch (error) {
      this.logger.error("Failed to get all webhooks", error);
      throw error;
    }
  }

  async getWebhookByIdService(id: string) {
    try {
      return await this.webhookService.findById(id);
    } catch (error) {
      this.logger.error("Failed to get webhook by id", error);
      throw error;
    }
  }

  async getWebhooksByUserService(lecturerId?: string, studentId?: string) {
    try {
      return await this.webhookService.findByUser(lecturerId, studentId);
    } catch (error) {
      this.logger.error("Failed to get webhooks by user", error);
      throw error;
    }
  }

  async createWebhookService(data: CreateWebhookDto) {
    try {
      const webhookData: any = {
        url: data.url,
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.studentId && { student: { connect: { id: data.studentId } } }),
        ...(data.lecturerId && {
          lecturer: { connect: { id: data.lecturerId } },
        }),
      };
      return await this.webhookService.create(webhookData);
    } catch (error) {
      this.logger.error("Failed to create webhook", error);
      throw error;
    }
  }

  async updateWebhookService(id: string, data: UpdateWebhookDto) {
    try {
      const updateData: any = {};
      if (data.url !== undefined) updateData.url = data.url;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.studentId !== undefined) {
        updateData.student = { connect: { id: data.studentId } };
      }
      if (data.lecturerId !== undefined) {
        updateData.lecturer = { connect: { id: data.lecturerId } };
      }

      return await this.webhookService.update(id, updateData);
    } catch (error) {
      this.logger.error("Failed to update webhook", error);
      throw error;
    }
  }

  async deleteWebhookService(id: string) {
    try {
      return await this.webhookService.delete(id);
    } catch (error) {
      this.logger.error("Failed to delete webhook", error);
      throw error;
    }
  }

  async toggleWebhookActiveService(id: string) {
    try {
      return await this.webhookService.toggleActive(id);
    } catch (error) {
      this.logger.error("Failed to toggle webhook active", error);
      throw error;
    }
  }

  // Post Methods
  async getAllPostsService(includeAdmin = false, includeDepartment = false) {
    try {
      return await this.postService.findAll(includeAdmin, includeDepartment);
    } catch (error) {
      this.logger.error("Failed to retrieve posts", error);
      throw error;
    }
  }

  async getPostByIdService(
    id: string,
    includeAdmin = false,
    includeDepartment = false,
  ) {
    try {
      return await this.postService.findById(
        id,
        includeAdmin,
        includeDepartment,
      );
    } catch (error) {
      this.logger.error("Failed to retrieve post", error);
      throw error;
    }
  }

  async getPostsByDepartmentIdService(
    departmentId: string | null,
    includeAdmin = false,
    includeDepartment = false,
  ) {
    try {
      return await this.postService.findByDepartmentId(
        departmentId,
        includeAdmin,
        includeDepartment,
      );
    } catch (error) {
      this.logger.error("Failed to retrieve posts by department", error);
      throw error;
    }
  }

  async getGlobalPostsService(includeAdmin = false, includeDepartment = false) {
    try {
      return await this.postService.findGlobalPosts(
        includeAdmin,
        includeDepartment,
      );
    } catch (error) {
      this.logger.error("Failed to retrieve global posts", error);
      throw error;
    }
  }

  async createPostService(data: CreatePostDto, adminId: string) {
    try {
      return await this.postService.create({
        title: data.title,
        content: data.content,
        type: data.type,
        thumbnail: data.thumbnail,
        admin: { connect: { id: adminId } },
        ...(data.departmentId && {
          department: { connect: { id: data.departmentId } },
        }),
      });
    } catch (error) {
      this.logger.error("Failed to create post", error);
      throw error;
    }
  }

  async updatePostService(id: string, data: UpdatePostDto) {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
      if (data.departmentId !== undefined) {
        if (data.departmentId === null) {
          updateData.department = { disconnect: true };
        } else {
          updateData.department = { connect: { id: data.departmentId } };
        }
      }

      return await this.postService.update(id, updateData);
    } catch (error) {
      this.logger.error("Failed to update post", error);
      throw error;
    }
  }

  async deletePostService(id: string) {
    try {
      return await this.postService.delete(id);
    } catch (error) {
      this.logger.error("Failed to delete post", error);
      throw error;
    }
  }

  async deleteManyPostsService(ids: string[]) {
    try {
      return await this.postService.deleteMany(ids);
    } catch (error) {
      this.logger.error("Failed to delete posts", error);
      throw error;
    }
  }
}
