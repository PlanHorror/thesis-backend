import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { Department } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Department[]> {
    return await this.prisma.department.findMany({
      include: {
        head: true,
      },
    });
  }

  async findById(id: string): Promise<Department> {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
        include: {
          head: {
            select: {
              id: true,
              fullName: true,
              lecturerId: true,
            },
          },
        },
      });
      if (!department) {
        throw new NotFoundException("Department not found");
      }
      return department;
    } catch (error) {
      this.logger.error("Failed to retrieve department", error.stack);
      throw new NotFoundException("Department not found");
    }
  }

  async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    try {
      return await this.prisma.department.create({ data });
    } catch (error: unknown) {
      const err = error as {
        code?: string;
        meta?: { target?: unknown };
        message?: string;
      };
      const isP2002 = err.code === "P2002";
      const target = err.meta?.target;
      const targetFields = Array.isArray(target)
        ? target
        : typeof target === "string"
          ? [target]
          : [];
      const isHeadIdConflict =
        isP2002 &&
        (targetFields.includes("headId") ||
          (typeof err.message === "string" && err.message.includes("headId")));

      if (isHeadIdConflict) {
        const raw = data as unknown as {
          headId?: string;
          head?: { connect?: { id?: string } };
        };
        const lecturerId =
          typeof raw.headId === "string" ? raw.headId : raw.head?.connect?.id;
        const existing =
          typeof lecturerId === "string"
            ? await this.prisma.department.findFirst({
                where: { headId: lecturerId },
                select: { name: true },
              })
            : null;
        const msg = existing
          ? `This lecturer is already the head of another department (${existing.name}). Please choose a different lecturer or remove them as head of that department first.`
          : "This lecturer is already the head of another department. Please choose a different lecturer.";
        throw new ConflictException(msg);
      }
      if (isP2002 && targetFields.length > 0) {
        throw new ConflictException(
          `${targetFields.join(", ")} already exists.`,
        );
      }
      this.logger.error("Failed to create department", (error as Error)?.stack);
      throw new BadRequestException("Failed to create department");
    }
  }

  async createMany(
    departments: Prisma.DepartmentCreateManyInput[],
  ): Promise<{ message: string }> {
    try {
      await this.prisma.department.createMany({
        data: departments,
        skipDuplicates: true,
      });
      return { message: "Departments created successfully" };
    } catch (error) {
      this.logger.error("Failed to create departments", error.stack);
      throw new BadRequestException("Failed to create departments");
    }
  }

  async update(
    id: string,
    data: Prisma.DepartmentUpdateInput,
  ): Promise<Department> {
    try {
      return await this.prisma.department.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      const err = error as {
        code?: string;
        meta?: { target?: unknown };
        message?: string;
      };
      if (err.code === "P2025") {
        throw new NotFoundException("Department not found");
      }
      if (err.code === "P2002") {
        const target = err.meta?.target;
        const targetFields = Array.isArray(target)
          ? target
          : typeof target === "string"
            ? [target]
            : [];
        const isHeadIdConflict =
          targetFields.includes("headId") ||
          (typeof err.message === "string" && err.message.includes("headId"));

        if (isHeadIdConflict) {
          const raw = data as unknown as {
            headId?: string | null;
            head?: { connect?: { id?: string } };
          };
          const lecturerId =
            typeof raw.headId === "string" ? raw.headId : raw.head?.connect?.id;
          const existing =
            typeof lecturerId === "string"
              ? await this.prisma.department.findFirst({
                  where: { headId: lecturerId },
                  select: { name: true },
                })
              : null;
          const msg = existing
            ? `This lecturer is already the head of another department (${existing.name}). Please choose a different lecturer or remove them as head of that department first.`
            : "This lecturer is already the head of another department. Please choose a different lecturer.";
          throw new ConflictException(msg);
        }
        if (targetFields.length > 0) {
          throw new ConflictException(
            `${targetFields.join(", ")} already exists.`,
          );
        }
      }
      this.logger.error("Failed to update department", (error as Error)?.stack);
      throw new BadRequestException("Failed to update department");
    }
  }

  async delete(id: string): Promise<Department> {
    try {
      return await this.prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Department not found");
        }
        if (error.code === "P2003") {
          // Foreign key constraint violation
          const field = error.meta?.field_name as string;
          if (field?.includes("Student")) {
            throw new ConflictException(
              "Cannot delete department: There are students assigned to this department. Please reassign or remove them first.",
            );
          }
          if (field?.includes("Course")) {
            throw new ConflictException(
              "Cannot delete department: There are courses assigned to this department. Please reassign or remove them first.",
            );
          }
          throw new ConflictException(
            "Cannot delete department: It has related records. Please remove them first.",
          );
        }
      }
      this.logger.error("Failed to delete department", error.stack);
      throw new BadRequestException("Failed to delete department");
    }
  }

  async deleteMany(ids: string[]): Promise<{ message: string }> {
    try {
      await this.prisma.department.deleteMany({
        where: { id: { in: ids } },
      });
      return { message: "Departments deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("One or more departments not found");
        }
      }
      this.logger.error("Failed to delete departments", error.stack);
      throw new BadRequestException("Failed to delete departments");
    }
  }
}
