import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CourseSemesterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async findAll(
    includeCourses = false,
    includeSemesters = false,
    includeLecturer = false,
    includeEnrollmentCount = false,
    courseId?: string,
    semesterId?: string,
  ) {
    return await this.prisma.courseOnSemester.findMany({
      include: {
        course: includeCourses
          ? {
              include: {
                department: true,
              },
            }
          : false,
        semester: includeSemesters,
        lecturer: includeLecturer
          ? {
              select: {
                id: true,
                fullName: true,
                lecturerId: true,
                email: true,
              },
            }
          : false,
        _count: includeEnrollmentCount
          ? {
              select: {
                enrollments: true,
              },
            }
          : false,
      },
      where: {
        ...(courseId && { courseId }),
        ...(semesterId && { semesterId }),
      },
    });
  }

  async findByLecturerId(lecturerId: string) {
    return await this.prisma.courseOnSemester.findMany({
      where: { lecturerId },
      include: {
        course: {
          include: { department: true },
        },
        semester: true,
        _count: { select: { enrollments: true } },
      },
    });
  }

  async findOne(id: string, includeCourses = false, includeSemesters = false) {
    try {
      const courseOnSemester = await this.prisma.courseOnSemester.findUnique({
        where: { id },
        include: {
          course: includeCourses,
          semester: includeSemesters,
        },
      });
      if (!courseOnSemester) {
        throw new NotFoundException(`CourseSemester with ID ${id} not found`);
      }
      return courseOnSemester;
    } catch {
      throw new NotFoundException(`CourseSemester with ID ${id} not found`);
    }
  }

  async create(data: Prisma.CourseOnSemesterCreateInput) {
    try {
      return await this.prisma.courseOnSemester.create({
        data,
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Course or Semester not found`);
      }
      if (error.code === "P2002") {
        throw new ConflictException(
          "This course is already assigned to this semester",
        );
      }
      throw new BadRequestException(
        `Error creating course on semester: ${error.message}`,
      );
    }
  }

  async createMany(
    courseSemesters: Prisma.CourseOnSemesterCreateManyInput[],
  ): Promise<{ message: string }> {
    try {
      await this.prisma.courseOnSemester.createMany({
        data: courseSemesters,
        skipDuplicates: true,
      });
      return { message: "CourseSemesters created successfully" };
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Course or Semester not found`);
      }
      if (error.code === "P2002") {
        throw new ConflictException(
          "One or more course-semester assignments already exist",
        );
      }
      throw new BadRequestException(
        `Error creating multiple course on semester: ${error.message}`,
      );
    }
  }

  async update(id: string, data: Prisma.CourseOnSemesterUpdateInput) {
    try {
      const updatedCourseSemester = await this.prisma.courseOnSemester.update({
        where: { id },
        data,
        include: {
          course: true,
        },
      });

      // Emit event for course semester updated
      const courseName =
        (updatedCourseSemester as any).course?.name || "Unknown Course";
      this.eventEmitter.emit(
        "course_semester.updated",
        updatedCourseSemester,
        courseName,
      );

      return updatedCourseSemester;
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`CourseSemester with ID ${id} not found`);
      }
      if (error.code === "P2002") {
        throw new ConflictException(
          "This course is already assigned to this semester",
        );
      }
      throw new BadRequestException(
        `Error updating course on semester: ${error.message}`,
      );
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.courseOnSemester.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`CourseSemester with ID ${id} not found`);
      }
      throw new BadRequestException(
        `Error deleting course on semester: ${error.message}`,
      );
    }
  }

  async deleteByCourseId(courseId: string) {
    try {
      return await this.prisma.courseOnSemester.deleteMany({
        where: { courseId },
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(
          `No course-semester assignments found for courseId: ${courseId}`,
        );
      }
      throw new BadRequestException(
        `Error deleting course on semester by courseId: ${error.message}`,
      );
    }
  }

  async deleteBySemesterId(semesterId: string) {
    try {
      return await this.prisma.courseOnSemester.deleteMany({
        where: { semesterId },
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(
          `No course-semester assignments found for semesterId: ${semesterId}`,
        );
      }
      throw new BadRequestException(
        `Error deleting course on semester by semesterId: ${error.message}`,
      );
    }
  }

  /**
   * Update only meeting/location fields by the assigned lecturer.
   * Used for lecturers to set or change meeting URL and mode without admin.
   */
  async updateScheduleByLecturer(
    id: string,
    lecturerId: string,
    data: {
      mode?: "ONLINE" | "ON_CAMPUS" | "HYBRID";
      location?: string | null;
      meetingUrl?: string | null;
    },
  ) {
    const existing = await this.prisma.courseOnSemester.findUnique({
      where: { id },
      include: { course: true, enrollments: { select: { studentId: true } } },
    });
    if (!existing) {
      throw new NotFoundException("Course-semester not found");
    }
    if (existing.lecturerId !== lecturerId) {
      throw new ForbiddenException(
        "You can only update schedule details for courses you teach",
      );
    }

    const updateData: Prisma.CourseOnSemesterUpdateInput = {};
    if (data.mode !== undefined) updateData.mode = data.mode;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.meetingUrl !== undefined) updateData.meetingUrl = data.meetingUrl;

    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    const updated = await this.prisma.courseOnSemester.update({
      where: { id },
      data: updateData,
      include: { course: true },
    });

    const hasScheduleChange =
      (existing as any).mode !== (updated as any).mode ||
      (existing.location ?? "") !== (updated.location ?? "") ||
      (existing as any).meetingUrl !== (updated as any).meetingUrl;

    if (hasScheduleChange) {
      await this.prisma.scheduleChange.create({
        data: {
          courseOnSemesterId: id,
          changedBy: lecturerId,
          changeType: "LECTURER_SCHEDULE_UPDATE",
          oldMode: (existing as any).mode ?? undefined,
          newMode: (updated as any).mode ?? undefined,
          oldLocation: existing.location ?? undefined,
          newLocation: updated.location ?? undefined,
          oldMeetingUrl: (existing as any).meetingUrl ?? undefined,
          newMeetingUrl: (updated as any).meetingUrl ?? undefined,
        },
      });

      const courseName = existing.course?.name ?? "Course";
      this.eventEmitter.emit("course_semester.updated", updated, courseName);
    }

    return updated;
  }

  async findScheduleChanges(courseOnSemesterId: string, limit = 10) {
    return await this.prisma.scheduleChange.findMany({
      where: { courseOnSemesterId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async deleteMany(ids: string[]) {
    try {
      return await this.prisma.courseOnSemester.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`No course-semester assignments found`);
      }
      throw new BadRequestException(
        `Error deleting multiple course on semester: ${error.message}`,
      );
    }
  }
}
