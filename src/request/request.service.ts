import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CourseWithdrawalRequestStatus,
  LecturerTeachingRequestStatus,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Check if semester has started (startDate <= today).
   */
  private semesterHasStarted(startDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return start.getTime() <= today.getTime();
  }

  /**
   * Check if two course-semester slots overlap (same day and time overlap).
   */
  private hasScheduleConflict(
    dayA: number | null,
    startA: number | null,
    endA: number | null,
    dayB: number | null,
    startB: number | null,
    endB: number | null,
  ): boolean {
    if (dayA === null || dayB === null || dayA !== dayB) return false;
    if (startA === null || endA === null || startB === null || endB === null)
      return false;
    return startA < endB && endA > startB;
  }

  /**
   * Create a lecturer teaching request. Validates:
   * - Course-semester exists and semester has started
   * - No lecturer assigned yet
   * - No schedule conflict with lecturer's existing assignments
   * - No existing PENDING request for same course-semester
   */
  async createLecturerTeachingRequest(
    lecturerId: string,
    courseOnSemesterId: string,
  ) {
    const cos = await this.prisma.courseOnSemester.findUnique({
      where: { id: courseOnSemesterId },
      include: { semester: true },
    });
    if (!cos) throw new NotFoundException("Course-semester not found");
    if (cos.lecturerId)
      throw new BadRequestException(
        "This course already has an assigned lecturer",
      );
    if (!cos.semester)
      throw new BadRequestException("Course-semester has no semester");
    if (!this.semesterHasStarted(cos.semester.startDate))
      throw new BadRequestException(
        "Cannot request: course semester has not started yet",
      );

    const existing = await this.prisma.lecturerTeachingRequest.findUnique({
      where: {
        lecturerId_courseOnSemesterId: { lecturerId, courseOnSemesterId },
      },
    });
    if (existing) {
      if (existing.status === "PENDING")
        throw new ConflictException(
          "You already have a pending request for this course",
        );
      if (existing.status === "APPROVED")
        throw new BadRequestException(
          "You are already assigned to this course",
        );
    }

    const myAssignments = await this.prisma.courseOnSemester.findMany({
      where: { lecturerId },
      select: { dayOfWeek: true, startTime: true, endTime: true },
    });
    for (const a of myAssignments) {
      if (
        this.hasScheduleConflict(
          cos.dayOfWeek,
          cos.startTime,
          cos.endTime,
          a.dayOfWeek,
          a.startTime,
          a.endTime,
        )
      )
        throw new ConflictException(
          "This course conflicts with your existing schedule",
        );
    }

    return this.prisma.lecturerTeachingRequest.upsert({
      where: {
        lecturerId_courseOnSemesterId: { lecturerId, courseOnSemesterId },
      },
      create: {
        lecturerId,
        courseOnSemesterId,
        status: "PENDING",
      },
      update: { status: "PENDING" },
    });
  }

  async findMyLecturerTeachingRequests(lecturerId: string) {
    return this.prisma.lecturerTeachingRequest.findMany({
      where: { lecturerId },
      include: {
        courseOnSemester: {
          include: {
            course: true,
            semester: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllLecturerTeachingRequests(
    status?: LecturerTeachingRequestStatus,
  ) {
    return this.prisma.lecturerTeachingRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            lecturerId: true,
            email: true,
          },
        },
        courseOnSemester: {
          include: {
            course: { include: { department: true } },
            semester: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async approveLecturerTeachingRequest(id: string) {
    const req = await this.prisma.lecturerTeachingRequest.findUnique({
      where: { id },
      include: {
        courseOnSemester: {
          include: { course: true, semester: true },
        },
      },
    });
    if (!req) throw new NotFoundException("Request not found");
    if (req.status !== "PENDING")
      throw new BadRequestException("Request is not pending");
    await this.prisma.$transaction([
      this.prisma.courseOnSemester.update({
        where: { id: req.courseOnSemesterId },
        data: { lecturerId: req.lecturerId },
      }),
      this.prisma.lecturerTeachingRequest.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
    ]);

    const courseName = req.courseOnSemester?.course?.name ?? "the course";
    const semesterName = req.courseOnSemester?.semester?.name ?? "the semester";
    this.eventEmitter.emit("lecturer_request.approved", {
      lecturerId: req.lecturerId,
      courseName,
      semesterName,
    });

    return { message: "Request approved", request: req };
  }

  async rejectLecturerTeachingRequest(id: string, reason?: string) {
    const req = await this.prisma.lecturerTeachingRequest.findUnique({
      where: { id },
      include: {
        courseOnSemester: {
          include: { course: true, semester: true },
        },
      },
    });
    if (!req) throw new NotFoundException("Request not found");
    if (req.status !== "PENDING")
      throw new BadRequestException("Request is not pending");

    const updated = await this.prisma.lecturerTeachingRequest.update({
      where: { id },
      data: {
        status: "REJECTED",

        ...(reason ? ({ rejectionReason: reason.trim() } as any) : {}),
      },
    });

    const courseName = req.courseOnSemester?.course?.name ?? "the course";
    const semesterName = req.courseOnSemester?.semester?.name ?? "the semester";
    this.eventEmitter.emit("lecturer_request.rejected", {
      lecturerId: req.lecturerId,
      courseName,
      semesterName,
      reason: reason?.trim() || undefined,
    });

    return updated;
  }

  // ==================== Student Course Withdrawal Requests ====================

  async createCourseWithdrawalRequest(
    studentId: string,
    courseOnSemesterId: string,
    reason: string,
    details?: string,
  ) {
    if (!reason.trim()) {
      throw new BadRequestException("Reason is required");
    }

    const enrollment = await this.prisma.studentCourseEnrollment.findFirst({
      where: {
        studentId,
        courseOnSemesterId,
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

    if (!enrollment) {
      throw new NotFoundException(
        "You are not enrolled in this course for the selected semester.",
      );
    }

    const existing = await this.prisma.courseWithdrawalRequest.findUnique({
      where: { enrollmentId: enrollment.id },
    });

    if (existing) {
      if (existing.status === "PENDING") {
        throw new ConflictException(
          "You already have a pending withdrawal request for this course.",
        );
      }
      if (existing.status === "APPROVED") {
        throw new BadRequestException(
          "You have already been withdrawn from this course.",
        );
      }
    }

    const request = await this.prisma.courseWithdrawalRequest.upsert({
      where: { enrollmentId: enrollment.id },
      create: {
        studentId,
        enrollmentId: enrollment.id,
        courseOnSemesterId,
        reason: reason.trim(),
        details: details?.trim() || null,
        status: "PENDING",
      },
      update: {
        reason: reason.trim(),
        details: details?.trim() || null,
        status: "PENDING",
      },
    });

    const courseName =
      enrollment.courseOnSemester?.course?.name ?? "the course";
    const semesterName =
      enrollment.courseOnSemester?.semester?.name ?? "the semester";

    this.eventEmitter.emit("withdrawal_request.created", {
      id: request.id,
      studentId,
      courseOnSemesterId,
      courseName,
      semesterName,
    });

    return request;
  }

  async findAllCourseWithdrawalRequests(
    status?: CourseWithdrawalRequestStatus,
  ) {
    // Typed as any here to avoid having to re-generate Prisma types in this snippet
    // Cast is safe because model now has relations to student and courseOnSemester.
    return (await this.prisma.courseWithdrawalRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        student: true,
        enrollment: {
          include: {
            courseOnSemester: {
              include: {
                course: { include: { department: true } },
                semester: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })) as any;
  }

  async findStudentWithdrawalRequestById(studentId: string, id: string) {
    const request = await this.prisma.courseWithdrawalRequest.findFirst({
      where: {
        id,
        studentId,
      },
      include: {
        enrollment: {
          include: {
            courseOnSemester: {
              include: {
                course: true,
                semester: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException("Withdrawal request not found");
    }

    return request;
  }

  async approveCourseWithdrawalRequest(id: string) {
    const request = await this.prisma.courseWithdrawalRequest.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            courseOnSemester: {
              include: { course: true, semester: true },
            },
          },
        },
        student: true,
      },
    });

    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "PENDING") {
      throw new BadRequestException("Request is not pending");
    }

    const courseName =
      (request as any).courseOnSemester?.course?.name ?? "the course";
    const semesterName =
      (request as any).courseOnSemester?.semester?.name ?? "the semester";

    await this.prisma.$transaction([
      this.prisma.courseWithdrawalRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          // Use relation update to clear the enrollment link
          enrollment: { disconnect: true } as any,
        },
      }),
      ...(request.enrollmentId
        ? [
            this.prisma.studentCourseEnrollment.delete({
              where: { id: request.enrollmentId },
            }),
          ]
        : []),
    ]);

    // Reuse existing enrollment.deleted_by_admin event for notifications
    this.eventEmitter.emit(
      "enrollment.deleted_by_admin",
      request.enrollment,
      courseName,
    );

    // Additional event specifically for withdrawal requests
    this.eventEmitter.emit("withdrawal_request.approved", {
      studentId: request.studentId,
      courseName,
      semesterName,
      courseOnSemesterId: request.courseOnSemesterId,
    });

    return { message: "Withdrawal request approved", request };
  }

  async rejectCourseWithdrawalRequest(id: string, reason?: string) {
    const request = await this.prisma.courseWithdrawalRequest.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            courseOnSemester: {
              include: { course: true, semester: true },
            },
          },
        },
      },
    });

    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "PENDING") {
      throw new BadRequestException("Request is not pending");
    }

    const updated = await this.prisma.courseWithdrawalRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        ...(reason ? ({ rejectionReason: reason.trim() } as any) : {}),
      },
    });

    const courseName =
      request.enrollment?.courseOnSemester?.course?.name ?? "the course";
    const semesterName =
      request.enrollment?.courseOnSemester?.semester?.name ?? "the semester";

    this.eventEmitter.emit("withdrawal_request.rejected", {
      studentId: request.studentId,
      courseName,
      semesterName,
      courseOnSemesterId: request.courseOnSemesterId,
      reason: reason?.trim() || undefined,
      requestId: request.id,
    });

    return updated;
  }
}
