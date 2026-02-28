import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Lecturer, Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { LecturerUpdateAccountDto } from "src/admin/dto/lecturer.dto";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class LecturerService {
  /* c8 ignore start */
  private logger = new Logger(LecturerService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  /* c8 ignore stop */

  async findAll(): Promise<Lecturer[]> {
    return this.prisma.lecturer.findMany();
  }

  async findById(id: string): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { id },
        include: { departmentHead: true },
      });
      if (!lecturer) {
        throw new NotFoundException("Lecturer not found");
      }
      return lecturer as unknown as Lecturer;
    } catch (error) {
      this.logger.error("Failed to retrieve lecturer", error.stack);
      throw new NotFoundException("Lecturer not found");
    }
  }

  async findByEmail(email: string): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { email },
      });
      if (!lecturer) {
        throw new NotFoundException("Lecturer not found");
      }
      return lecturer;
    } catch (error) {
      this.logger.error("Failed to retrieve lecturer", error.stack);
      throw new NotFoundException("Lecturer not found");
    }
  }

  async findByUsername(username: string): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { username },
      });
      if (!lecturer) {
        throw new NotFoundException("Lecturer not found");
      }
      return lecturer;
    } catch (error) {
      this.logger.error("Failed to retrieve lecturer", error.stack);
      throw new NotFoundException("Lecturer not found");
    }
  }

  async findByLecturerId(lecturerId: string): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { lecturerId },
      });
      if (!lecturer) {
        throw new NotFoundException("Lecturer not found");
      }
      return lecturer;
    } catch (error) {
      this.logger.error("Failed to retrieve lecturer", error.stack);
      throw new NotFoundException("Lecturer not found");
    }
  }

  async create(data: Prisma.LecturerCreateInput): Promise<Lecturer> {
    try {
      const lecturer = await this.prisma.lecturer.create({
        data,
      });

      // Emit event for lecturer created
      this.eventEmitter.emit("lecturer.created", lecturer);

      return lecturer;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          /* istanbul ignore next */
          const target = error.meta?.target;
          /* istanbul ignore else */
          if (Array.isArray(target)) {
            console.warn("Unique constraint failed on the fields: ", target);
            throw new ConflictException(`${target.join(", ")} already exists`);
          }
        }
      }
      this.logger.error("Failed to create ", error.stack);
      throw new BadRequestException("Failed to create ");
    }
  }

  async createMultipleLecturers(
    data: Prisma.LecturerCreateManyInput[],
  ): Promise<{ message: string }> {
    await this.prisma.lecturer.createMany({
      data,
      skipDuplicates: true,
    });
    return { message: "Lecturers created successfully" };
  }

  async update(
    id: string,
    data: Prisma.LecturerUpdateInput,
  ): Promise<Lecturer> {
    try {
      return await this.prisma.lecturer.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          this.logger.warn(`Lecturer with ID ${id} not found`);
          throw new NotFoundException("Lecturer not found");
        }
        if (error.code === "P2002") {
          /* istanbul ignore next */
          const target = error.meta?.target;
          /* istanbul ignore else */
          if (Array.isArray(target)) {
            console.warn("Unique constraint failed on the fields: ", target);
            throw new ConflictException(`${target.join(", ")} already exists`);
          }
        }
      }
      this.logger.error("Failed to update ", error.stack);
      throw new BadRequestException("Failed to update ");
    }
  }

  async delete(id: string): Promise<Lecturer> {
    try {
      return await this.prisma.lecturer.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          this.logger.warn(`Lecturer with ID ${id} not found`);
          throw new NotFoundException("Lecturer not found");
        }
      }
      this.logger.error("Failed to delete lecturer", error.stack);
      throw new BadRequestException("Failed to delete lecturer");
    }
  }

  async deleteMany(ids: string[]): Promise<{ message: string }> {
    try {
      await this.prisma.lecturer.deleteMany({
        where: { id: { in: ids } },
      });
      return { message: "Lecturers deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("One or more lecturers not found");
        }
      }
      this.logger.error("Failed to delete lecturers", error.stack);
      throw new BadRequestException("Failed to delete lecturers");
    }
  }

  private readonly PROFILE_CHANGE_COOLDOWN_DAYS = 30;

  async lecturerUpdateAccount(
    data: LecturerUpdateAccountDto,
    lecturer: Lecturer,
  ) {
    try {
      const { password, oldPassword, username, ...updateData } = data;
      const isChangingCreds =
        (username !== undefined && username !== lecturer.username) ||
        (password !== undefined && password !== "");

      if (isChangingCreds) {
        const current = await this.prisma.lecturer.findUnique({
          where: { id: lecturer.id },
          select: { lastProfileChangeAt: true },
        });
        if (current?.lastProfileChangeAt) {
          const until = new Date(current.lastProfileChangeAt);
          until.setDate(until.getDate() + this.PROFILE_CHANGE_COOLDOWN_DAYS);
          if (until > new Date()) {
            throw new BadRequestException(
              `Profile changes are limited to once every ${this.PROFILE_CHANGE_COOLDOWN_DAYS} days. You can update again after ${until.toISOString()}`,
            );
          }
        }
      }

      let hashedPassword: string | null = null;
      if (password) {
        if (
          !oldPassword ||
          bcrypt.compareSync(oldPassword, lecturer.password) === false
        ) {
          throw new BadRequestException("Old password is incorrect");
        }
        const salt = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(password, salt);
      }
      const updatePayload: Record<string, unknown> = {
        ...updateData,
        ...(username !== undefined && { username }),
        ...(hashedPassword && { password: hashedPassword }),
      };
      if (isChangingCreds) {
        (updatePayload as any).lastProfileChangeAt = new Date();
      }
      const updatedLecturer = await this.prisma.lecturer.update({
        where: { id: lecturer.id },
        data: updatePayload as any,
      });

      // Emit event for password changed if password was updated
      if (hashedPassword) {
        this.eventEmitter.emit("lecturer.password_changed", updatedLecturer);
      }

      return updatedLecturer;
    } catch (error) {
      this.logger.error("Failed to update lecturer account", error.stack);
      throw new BadRequestException("Failed to update lecturer account");
    }
  }

  /**
   * Get student profile for lecturer (only if lecturer teaches this student).
   */
  async getStudentProfileForLecturer(lecturerId: string, studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { department: { select: { id: true, name: true } } },
    });
    if (!student) throw new NotFoundException("Student not found");

    const enrollments = await this.prisma.studentCourseEnrollment.findMany({
      where: {
        studentId,
        courseOnSemester: { lecturerId },
      },
      include: {
        courseOnSemester: {
          include: {
            course: true,
            semester: true,
          },
        },
      },
    });

    if (enrollments.length === 0) {
      throw new BadRequestException(
        "You do not teach this student. Access denied.",
      );
    }

    return {
      student: {
        id: student.id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        department: student.department,
      },
      enrollments: enrollments.map((e) => ({
        courseName: e.courseOnSemester.course.name,
        semester: e.courseOnSemester.semester.name,
        credits: e.courseOnSemester.course.credits,
        grades: {
          gradeType1: e.gradeType1,
          gradeType2: e.gradeType2,
          gradeType3: e.gradeType3,
          finalGrade: e.finalGrade,
        },
        schedule: {
          dayOfWeek: e.courseOnSemester.dayOfWeek,
          startTime: e.courseOnSemester.startTime,
          endTime: e.courseOnSemester.endTime,
          location: e.courseOnSemester.location,
        },
      })),
    };
  }
}
