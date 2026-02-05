import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Course, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    includeDepartment = false,
    includeCourseOnSemesters = false,
  ): Promise<Course[]> {
    return this.prisma.course.findMany({
      include: {
        department: includeDepartment,
        ...(includeCourseOnSemesters && {
          courseOnSemesters: { include: { semester: true } },
        }),
      },
    });
  }

  async findOne(
    id: string,
    includeDepartment = false,
    includeCourseOnSemesters = false,
  ): Promise<Course> {
    try {
      const course = await this.prisma.course.findUnique({
        where: { id },
        include: {
          department: includeDepartment,
          ...(includeCourseOnSemesters && {
            courseOnSemesters: { include: { semester: true } },
          }),
        },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      return course;
    } catch (error) {
      this.logger.error("Failed to retrieve course", error.stack);
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  async findByDepartmentId(
    departmentId: string,
    includeDepartment = false,
  ): Promise<Course[]> {
    try {
      return this.prisma.course.findMany({
        where: { departmentId },
        include: {
          department: includeDepartment,
        },
      });
    } catch (error) {
      this.logger.error(
        "Failed to retrieve courses by department ID",
        error.stack,
      );
      throw new NotFoundException(
        `Courses for department ID ${departmentId} not found`,
      );
    }
  }

  async create(data: Prisma.CourseCreateInput): Promise<Course> {
    try {
      return await this.prisma.course.create({ data });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(
          `Department with ID ${data.department?.connect?.id} not found`,
        );
      }
      this.logger.error("Failed to create course", error.stack);
      throw new BadRequestException("Error creating course");
    }
  }

  async createMany(
    courses: Prisma.CourseCreateManyInput[],
  ): Promise<{ message: string; count: number }> {
    try {
      const result = await this.prisma.course.createMany({ data: courses });
      return {
        message: "Courses created successfully",
        count: result.count,
      };
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("One or more departments not found");
      }
      this.logger.error("Failed to create courses", error.stack);
      throw new BadRequestException("Error creating courses");
    }
  }

  async update(id: string, data: Prisma.CourseUpdateInput): Promise<Course> {
    try {
      return await this.prisma.course.update({ where: { id }, data });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      this.logger.error("Failed to update course", error.stack);
      throw new BadRequestException("Error updating course");
    }
  }

  async remove(id: string): Promise<Course> {
    try {
      return await this.prisma.course.delete({ where: { id } });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      this.logger.error("Failed to delete course", error.stack);
      throw new BadRequestException("Error deleting course");
    }
  }

  async removeMany(ids: string[]): Promise<{ message: string }> {
    try {
      await this.prisma.course.deleteMany({
        where: { id: { in: ids } },
      });
      return { message: "Courses deleted successfully" };
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(
          `Courses with IDs ${ids.join(", ")} not found`,
        );
      }
      this.logger.error("Failed to delete courses", error.stack);
      throw new BadRequestException("Error deleting courses");
    }
  }
}
