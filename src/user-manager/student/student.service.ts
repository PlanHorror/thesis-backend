import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Prisma, Student } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { StudentUpdateAccountDto } from "src/admin/dto/student.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.prismaService.student.findMany();
  }

  async findById(id: string): Promise<Student> {
    try {
      const student = await this.prismaService.student.findUnique({
        where: { id },
      });
      if (!student) {
        throw new NotFoundException("Account not found");
      }
      return student;
    } catch (error) {
      this.logger.error("Failed to retrieve account", error.stack);
      throw new NotFoundException("Account not found");
    }
  }

  async findByCondition(
    email?: string,
    studentId?: string,
    username?: string,
    citizenId?: string,
    phone?: string,
  ): Promise<Student> {
    if (!email && !studentId && !username && !citizenId && !phone) {
      throw new BadRequestException("At least one condition is required");
    }
    try {
      const student = await this.prismaService.student.findUnique({
        where: { email, studentId, username, citizenId, phone },
      });
      if (!student) {
        throw new NotFoundException("Account not found");
      }
      return student;
    } catch (error) {
      this.logger.error("Failed to retrieve account", error.stack);
      throw new NotFoundException("Account not found");
    }
  }

  async filterByDepartment(departmentId: string): Promise<Student[]> {
    try {
      return await this.prismaService.student.findMany({
        where: { departmentId },
      });
    } catch (error) {
      this.logger.error("Failed to filter accounts", error.stack);
      throw new BadRequestException("Failed to filter accounts");
    }
  }

  async findByUsername(username: string): Promise<Student> {
    try {
      const student = await this.prismaService.student.findUnique({
        where: { username },
      });
      if (!student) {
        throw new NotFoundException("Account not found");
      }
      return student;
    } catch (error) {
      this.logger.error("Failed to retrieve account", error.stack);
      throw new NotFoundException("Account not found");
    }
  }

  async findByStudentId(studentId: string): Promise<Student> {
    try {
      const student = await this.prismaService.student.findUnique({
        where: { studentId },
      });
      if (!student) {
        throw new NotFoundException("Account not found");
      }
      return student;
    } catch (error) {
      this.logger.error("Failed to retrieve account", error.stack);
      throw new NotFoundException("Account not found");
    }
  }

  async create(data: Prisma.StudentCreateInput): Promise<Student> {
    try {
      const student = await this.prismaService.student.create({
        data,
      });

      // Emit event for student created
      this.eventEmitter.emit("student.created", student);

      return student;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          if (Array.isArray(error.meta?.target)) {
            if (
              error.meta.target.includes("email") &&
              error.meta.target.includes("username")
            ) {
              this.logger.warn(
                `Email ${data.email} and Username ${data.username} already exist`,
              );
              throw new ConflictException("Email and username already exist");
            }
            if (error.meta.target.includes("email")) {
              this.logger.warn(`Email ${data.email} already exists`);
              throw new ConflictException("Email already exists");
            }
            if (error.meta.target.includes("username")) {
              this.logger.warn(`Username ${data.username} already exists`);
              throw new ConflictException("Username already exists");
            }
          }
        }
      }
      this.logger.error("Failed to create account", error.stack);
      throw new BadRequestException("Failed to create account");
    }
  }

  async createMultipleStudents(
    data: Prisma.StudentCreateManyInput[],
  ): Promise<{ message: string }> {
    try {
      await this.prismaService.student.createMany({
        data: data,
        skipDuplicates: true,
      });
      return { message: "Students created successfully" };
    } catch (error) {
      this.logger.error("Failed to create students", error.stack);
      throw new BadRequestException("Failed to create students");
    }
  }

  async update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    try {
      const current = await this.prismaService.student.findUnique({
        where: { id },
      });
      if (!current) {
        throw new NotFoundException("Account not found");
      }
      const updateData = { ...data } as Record<string, unknown>;
      if (updateData.email === current.email) delete updateData.email;
      if (updateData.username === current.username) delete updateData.username;
      if (updateData.studentId === current.studentId)
        delete updateData.studentId;
      if (updateData.citizenId === current.citizenId)
        delete updateData.citizenId;
      if (updateData.phone === current.phone) delete updateData.phone;
      return await this.prismaService.student.update({
        where: { id },
        data: updateData as Prisma.StudentUpdateInput,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          this.logger.warn(`Account with ID ${id} not found`);
          throw new NotFoundException("Account not found");
        }
        if (error.code === "P2002") {
          if (Array.isArray(error.meta?.target)) {
            if (
              error.meta.target.includes("email") &&
              error.meta.target.includes("username")
            ) {
              this.logger.warn(
                `Email ${
                  typeof data.email === "string" ? data.email : ""
                } and Username ${typeof data.username === "string" ? data.username : ""} already exist`,
              );
              throw new ConflictException("Email and username already exist");
            }
            if (error.meta.target.includes("email")) {
              this.logger.warn(
                `Email ${typeof data.email === "string" ? data.email : ""} already exists`,
              );
              throw new ConflictException("Email already exists");
            }
            if (error.meta.target.includes("username")) {
              this.logger.warn(
                `Username ${typeof data.username === "string" ? data.username : ""} already exists`,
              );
              throw new ConflictException("Username already exists");
            }
          }
        }
      }
      this.logger.error("Failed to update account", error.stack);
      throw new BadRequestException("Failed to update account");
    }
  }

  async delete(id: string): Promise<Student> {
    try {
      return await this.prismaService.student.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          this.logger.warn(`Account with ID ${id} not found`);
          throw new NotFoundException("Account not found");
        }
      }
      this.logger.error("Failed to delete account", error.stack);
      throw new BadRequestException("Failed to delete account");
    }
  }

  async deleteMany(ids: string[]): Promise<{ message: string }> {
    try {
      await this.prismaService.student.deleteMany({
        where: { id: { in: ids } },
      });
      return { message: "Accounts deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("One or more accounts not found");
        }
      }
      this.logger.error("Failed to delete accounts", error.stack);
      throw new BadRequestException("Failed to delete accounts");
    }
  }

  async studentUpdateAccount(data: StudentUpdateAccountDto, student: Student) {
    try {
      const { password, oldPassword, ...updateData } = data;
      let hashedPassword: string | null = null;
      if (password) {
        if (
          !oldPassword ||
          bcrypt.compareSync(oldPassword, student.password) === false
        ) {
          throw new BadRequestException("Old password is incorrect");
        }
        const salt = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(password, salt);
      }
      const updatedStudent = await this.prismaService.student.update({
        where: { id: student.id },
        data: {
          ...updateData,
          ...(hashedPassword && { password: hashedPassword }),
        },
      });

      // Emit event for password changed if password was updated
      if (hashedPassword) {
        this.eventEmitter.emit("student.password_changed", updatedStudent);
      }

      return updatedStudent;
    } catch (error) {
      this.logger.error("Failed to update student account", error.stack);
      throw new BadRequestException("Failed to update student account");
    }
  }
}
