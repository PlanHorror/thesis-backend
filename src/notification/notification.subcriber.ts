import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  NotificationType,
  PostType,
  type Course,
  type CourseDocument,
  type CourseOnSemester,
  type Department,
  type EnrollmentSession,
  type ExamSchedule,
  type Lecturer,
  type Post,
  type Semester,
  type Student,
  type StudentCourseEnrollment,
} from "@prisma/client";
import { AppGateway } from "src/gateway/gateway.gateway";
import { PrismaService } from "src/prisma/prisma.service";
import { WebhookService } from "src/webhook/webhook.service";
import { NotificationService } from "./notification.service";

@Injectable()
export class NotificationSubscriber {
  private readonly logger = new Logger(NotificationSubscriber.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly webSocketGateway: AppGateway,
    private readonly webhookService: WebhookService,
  ) {}

  // ==================== Course Enrollment Events ====================

  @OnEvent("enrollment.created")
  async onEnrollmentCreated(
    enrollment: StudentCourseEnrollment,
    courseName: string,
  ): Promise<void> {
    this.logger.log(
      `Event: enrollment.created - Student: ${enrollment.studentId}`,
    );
    // TODO: Implement
    const notification = await this.notificationService.create({
      student: {
        connect: { id: enrollment.studentId },
      },
      type: NotificationType.INFO,
      title: "Enrollment Successful",
      message: `You have been successfully enrolled in the course: ${courseName}.`,
      url: `/courses/${enrollment.courseOnSemesterId}`,
    });
    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  @OnEvent("enrollment.deleted")
  async onEnrollmentDeleted(
    enrollment: StudentCourseEnrollment,
    courseName: string,
  ): Promise<void> {
    this.logger.log(
      `Event: enrollment.deleted - Student: ${enrollment.studentId}`,
    );
    const notification = await this.notificationService.create({
      student: {
        connect: { id: enrollment.studentId },
      },
      type: NotificationType.INFO,
      title: "Enrollment Removed",
      message: `Your enrollment in the course: ${courseName} has been removed.`,
    });
    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  @OnEvent("enrollment.deleted_by_admin")
  async onEnrollmentDeletedByAdmin(
    enrollment: StudentCourseEnrollment,
    courseName: string,
  ): Promise<void> {
    this.logger.log(
      `Event: enrollment.deleted_by_admin - Student: ${enrollment.studentId}`,
    );
    const notification = await this.notificationService.create({
      student: {
        connect: { id: enrollment.studentId },
      },
      type: NotificationType.WARNING,
      title: "Enrollment Removed by Admin",
      message: `Your enrollment in the course: ${courseName} has been removed by an administrator.`,
    });
    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  // ==================== Enrollment Session Events ====================

  @OnEvent("enrollment_session.created")
  async onEnrollmentSessionCreated(
    session: EnrollmentSession,
    semesterName: string,
  ): Promise<void> {
    this.logger.log(
      `Event: enrollment_session.created - Session: ${session.id}`,
    );

    const students = await this.prisma.student.findMany({
      where: { active: true },
      select: { id: true },
    });

    if (students.length === 0) {
      this.logger.log("No active students to notify");
      return;
    }

    const startStr = session.startDate.toLocaleDateString();
    const endStr = session.endDate.toLocaleDateString();
    const notifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: NotificationType.INFO,
            title: "New Enrollment Session Scheduled",
            message: `A new enrollment session "${session.name || semesterName}" for ${semesterName} has been scheduled (${startStr} – ${endStr}). You can enroll when it opens.`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent enrollment session created notifications to ${notifications.length} students`,
    );
  }

  @OnEvent("enrollment_session.opened")
  async onEnrollmentSessionOpened(
    session: EnrollmentSession,
    semesterName: string,
  ): Promise<void> {
    this.logger.log(
      `Event: enrollment_session.opened - Session: ${session.id}`,
    );

    // Get all active students
    const students = await this.prisma.student.findMany({
      where: { active: true },
      select: { id: true },
    });

    if (students.length === 0) {
      this.logger.log("No active students to notify");
      return;
    }

    // Create notifications in batch
    const notifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: NotificationType.INFO,
            title: "Enrollment Session Opened",
            message: `Enrollment session "${session.name || semesterName}" is now open. You can enroll in courses until ${session.endDate.toLocaleDateString()}.`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent enrollment session opened notifications to ${notifications.length} students`,
    );
  }

  @OnEvent("enrollment_session.closing_soon")
  async onEnrollmentSessionClosingSoon(
    session: EnrollmentSession,
    semesterName: string,
  ): Promise<void> {
    this.logger.log(
      `Event: enrollment_session.closing_soon - Session: ${session.id}`,
    );
    // TODO: Implement - notify all students in semester
    const students = await this.prisma.student.findMany({
      where: { active: true },
      select: { id: true },
    });
    const notifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: NotificationType.WARNING,
            title: "Enrollment Session Closing Soon",
            message: `Enrollment session "${session.name || semesterName}" is closing soon on ${session.endDate.toLocaleDateString()}. Please complete your course enrollments before the deadline.`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent enrollment session closing soon notifications to ${notifications.length} students`,
    );
  }

  @OnEvent("enrollment_session.closed")
  async onEnrollmentSessionClosed(session: EnrollmentSession): Promise<void> {
    this.logger.log(
      `Event: enrollment_session.closed - Session: ${session.id}`,
    );
    // TODO: Implement - notify all students in semester
    const students = await this.prisma.student.findMany({
      where: { active: true },
      select: { id: true },
    });
    const notifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: NotificationType.INFO,
            title: "Enrollment Session Closed",
            message: `Enrollment session "${session.name}" has now closed. You can no longer enroll in courses for this semester.`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent enrollment session closed notifications to ${notifications.length} students`,
    );
  }

  // ==================== Exam Schedule Events ====================

  @OnEvent("exam_schedule.created")
  async onExamScheduleCreated(examSchedule: ExamSchedule): Promise<void> {
    this.logger.log(
      `Event: exam_schedule.created - ExamSchedule: ${examSchedule.id}`,
    );
    // TODO: Implement - notify enrolled students
    const students = await this.prisma.studentCourseEnrollment.findMany({
      where: { courseOnSemesterId: examSchedule.courseOnSemesterId },
      select: { studentId: true },
    });

    if (students.length === 0) {
      this.logger.log("No enrolled students to notify");
      return;
    }

    const notifications = await this.prisma.$transaction(
      students.map((enrollment) =>
        this.prisma.notification.create({
          data: {
            studentId: enrollment.studentId,
            type: NotificationType.INFO,
            title: "New Exam Scheduled",
            message: `A new exam has been scheduled. Please check the exam schedule for details.`,
            url: `/exam-schedules/${examSchedule.id}`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent exam schedule created notifications to ${notifications.length} students`,
    );
  }

  @OnEvent("exam_schedule.updated")
  async onExamScheduleUpdated(examSchedule: ExamSchedule): Promise<void> {
    this.logger.log(
      `Event: exam_schedule.updated - ExamSchedule: ${examSchedule.id}`,
    );
    // TODO: Implement - notify enrolled students
    const students = await this.prisma.studentCourseEnrollment.findMany({
      where: { courseOnSemesterId: examSchedule.courseOnSemesterId },
      select: { studentId: true },
    });

    if (students.length === 0) {
      this.logger.log("No enrolled students to notify");
      return;
    }

    const notifications = await this.prisma.$transaction(
      students.map((enrollment) =>
        this.prisma.notification.create({
          data: {
            studentId: enrollment.studentId,
            type: NotificationType.INFO,
            title: "Exam Schedule Updated",
            message: `The exam schedule has been updated. Please check the exam schedule for the latest details.`,
            url: `/exam-schedules/${examSchedule.id}`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent exam schedule updated notifications to ${notifications.length} students`,
    );
  }

  @OnEvent("exam_schedule.deleted")
  async onExamScheduleDeleted(
    courseOnSemesterId: string,
    courseName: string,
  ): Promise<void> {
    this.logger.log(
      `Event: exam_schedule.deleted - CourseOnSemester: ${courseOnSemesterId}`,
    );

    const students = await this.prisma.studentCourseEnrollment.findMany({
      where: { courseOnSemesterId },
      select: { studentId: true },
    });

    if (students.length === 0) {
      this.logger.log("No enrolled students to notify");
      return;
    }

    const notifications = await this.prisma.$transaction(
      students.map((enrollment) =>
        this.prisma.notification.create({
          data: {
            studentId: enrollment.studentId,
            type: NotificationType.WARNING,
            title: "Exam Schedule Cancelled",
            message: `The exam schedule for "${courseName}" has been cancelled.`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent exam schedule deleted notifications to ${notifications.length} students`,
    );
  }

  @OnEvent("exam_schedule.reminder")
  async onExamScheduleReminder(examSchedule: ExamSchedule): Promise<void> {
    this.logger.log(
      `Event: exam_schedule.reminder - ExamSchedule: ${examSchedule.id}`,
    );
    // TODO: Implement - notify enrolled students (requires scheduler)
    const students = await this.prisma.studentCourseEnrollment.findMany({
      where: { courseOnSemesterId: examSchedule.courseOnSemesterId },
      select: { studentId: true },
    });

    if (students.length === 0) {
      this.logger.log("No enrolled students to notify");
      return;
    }

    const notifications = await this.prisma.$transaction(
      students.map((enrollment) =>
        this.prisma.notification.create({
          data: {
            studentId: enrollment.studentId,
            type: NotificationType.INFO,
            title: "Exam Reminder",
            message: `This is a reminder for your upcoming exam. Please check the exam schedule for details.`,
            url: `/exam-schedules/${examSchedule.id}`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent exam schedule reminder notifications to ${notifications.length} students`,
    );
  }

  // ==================== Course Document Events ====================

  @OnEvent("document.created")
  async onDocumentCreated(document: CourseDocument): Promise<void> {
    this.logger.log(`Event: document.created - Document: ${document.id}`);
    // TODO: Implement - notify enrolled students
    const students = await this.prisma.studentCourseEnrollment.findMany({
      where: { courseOnSemesterId: document.courseOnSemesterId },
      select: { studentId: true },
    });

    if (students.length === 0) {
      this.logger.log("No enrolled students to notify");
      return;
    }

    const notifications = await this.prisma.$transaction(
      students.map((enrollment) =>
        this.prisma.notification.create({
          data: {
            studentId: enrollment.studentId,
            type: NotificationType.INFO,
            title: "New Course Document Available",
            message: `A new document "${document.title}" has been added to your course. Please check the course materials for details.`,
            url: `/courses/${document.courseOnSemesterId}/documents/${document.id}`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent document created notifications to ${notifications.length} students`,
    );
  }

  @OnEvent("document.updated")
  async onDocumentUpdated(document: CourseDocument): Promise<void> {
    this.logger.log(`Event: document.updated - Document: ${document.id}`);

    const students = await this.prisma.studentCourseEnrollment.findMany({
      where: { courseOnSemesterId: document.courseOnSemesterId },
      select: { studentId: true },
    });

    if (students.length === 0) {
      this.logger.log("No enrolled students to notify");
      return;
    }

    const notifications = await this.prisma.$transaction(
      students.map((enrollment) =>
        this.prisma.notification.create({
          data: {
            studentId: enrollment.studentId,
            type: NotificationType.INFO,
            title: "Course Document Updated",
            message: `The document "${document.title}" has been updated.`,
            url: `/courses/${document.courseOnSemesterId}/documents/${document.id}`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent document updated notifications to ${notifications.length} students`,
    );
  }

  @OnEvent("document.deleted")
  async onDocumentDeleted(
    courseOnSemesterId: string,
    documentTitle: string,
  ): Promise<void> {
    this.logger.log(
      `Event: document.deleted - CourseOnSemester: ${courseOnSemesterId}`,
    );

    const students = await this.prisma.studentCourseEnrollment.findMany({
      where: { courseOnSemesterId },
      select: { studentId: true },
    });

    if (students.length === 0) {
      this.logger.log("No enrolled students to notify");
      return;
    }

    const notifications = await this.prisma.$transaction(
      students.map((enrollment) =>
        this.prisma.notification.create({
          data: {
            studentId: enrollment.studentId,
            type: NotificationType.INFO,
            title: "Course Document Removed",
            message: `The document "${documentTitle}" has been removed from the course.`,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(notifications);
    this.logger.log(
      `Sent document deleted notifications to ${notifications.length} students`,
    );
  }

  // ==================== Course on Semester Events ====================

  @OnEvent("course_semester.updated")
  async onCourseSemesterUpdated(
    courseOnSemester: CourseOnSemester,
    courseName: string,
  ): Promise<void> {
    this.logger.log(
      `Event: course_semester.updated - CourseOnSemester: ${courseOnSemester.id}`,
    );

    // Notify enrolled students
    const students = await this.prisma.studentCourseEnrollment.findMany({
      where: { courseOnSemesterId: courseOnSemester.id },
      select: { studentId: true },
    });

    const studentNotifications = await this.prisma.$transaction(
      students.map((enrollment) =>
        this.prisma.notification.create({
          data: {
            studentId: enrollment.studentId,
            type: NotificationType.INFO,
            title: "Course Information Updated",
            message: `The course "${courseName}" information has been updated. Please check for schedule or location changes.`,
            url: `/courses/${courseOnSemester.id}`,
          },
        }),
      ),
    );

    // Notify lecturer if assigned
    const allNotifications = [...studentNotifications];
    if (courseOnSemester.lecturerId) {
      const lecturerNotification = await this.prisma.notification.create({
        data: {
          lecturerId: courseOnSemester.lecturerId,
          type: NotificationType.INFO,
          title: "Course Information Updated",
          message: `The course "${courseName}" you are teaching has been updated.`,
          url: `/courses/${courseOnSemester.id}`,
        },
      });
      allNotifications.push(lecturerNotification);
    }

    for (const notification of allNotifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(allNotifications);
    this.logger.log(
      `Sent course updated notifications to ${students.length} students and lecturer`,
    );
  }

  // ==================== Student Account Events ====================

  @OnEvent("student.created")
  async onStudentCreated(student: Student): Promise<void> {
    this.logger.log(`Event: student.created - Student: ${student.id}`);

    const notification = await this.prisma.notification.create({
      data: {
        studentId: student.id,
        type: NotificationType.INFO,
        title: "Welcome to the System",
        message: `Welcome ${student.fullName || student.username}! Your account has been created successfully.`,
      },
    });

    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  @OnEvent("student.password_changed")
  async onStudentPasswordChanged(student: Student): Promise<void> {
    this.logger.log(`Event: student.password_changed - Student: ${student.id}`);

    const notification = await this.prisma.notification.create({
      data: {
        studentId: student.id,
        type: NotificationType.WARNING,
        title: "Password Changed",
        message:
          "Your password has been changed. If you did not make this change, please contact support immediately.",
      },
    });

    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  // ==================== Lecturer Account Events ====================

  @OnEvent("lecturer.created")
  async onLecturerCreated(lecturer: Lecturer): Promise<void> {
    this.logger.log(`Event: lecturer.created - Lecturer: ${lecturer.id}`);

    const notification = await this.prisma.notification.create({
      data: {
        lecturerId: lecturer.id,
        type: NotificationType.INFO,
        title: "Welcome to the System",
        message: `Welcome ${lecturer.fullName || lecturer.username}! Your lecturer account has been created successfully.`,
      },
    });

    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  @OnEvent("lecturer.password_changed")
  async onLecturerPasswordChanged(lecturer: Lecturer): Promise<void> {
    this.logger.log(
      `Event: lecturer.password_changed - Lecturer: ${lecturer.id}`,
    );

    const notification = await this.prisma.notification.create({
      data: {
        lecturerId: lecturer.id,
        type: NotificationType.WARNING,
        title: "Password Changed",
        message:
          "Your password has been changed. If you did not make this change, please contact support immediately.",
      },
    });

    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  @OnEvent("lecturer_request.approved")
  async onLecturerRequestApproved(payload: {
    lecturerId: string;
    courseName: string;
    semesterName: string;
  }): Promise<void> {
    this.logger.log(
      `Event: lecturer_request.approved - Lecturer: ${payload.lecturerId}`,
    );

    const notification = await this.prisma.notification.create({
      data: {
        lecturerId: payload.lecturerId,
        type: NotificationType.INFO,
        title: "Teaching Request Approved",
        message: `Your request to teach "${payload.courseName}" (${payload.semesterName}) has been approved. You are now assigned to this course.`,
      },
    });

    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  @OnEvent("lecturer_request.rejected")
  async onLecturerRequestRejected(payload: {
    lecturerId: string;
    courseName: string;
    semesterName: string;
  }): Promise<void> {
    this.logger.log(
      `Event: lecturer_request.rejected - Lecturer: ${payload.lecturerId}`,
    );

    const notification = await this.prisma.notification.create({
      data: {
        lecturerId: payload.lecturerId,
        type: NotificationType.WARNING,
        title: "Teaching Request Declined",
        message: `Your request to teach "${payload.courseName}" (${payload.semesterName}) has been declined.`,
      },
    });

    this.webSocketGateway.sendNotificationToUser(notification);
    await this.webhookService.triggerWebhooksForNotifications([notification]);
  }

  // ==================== Semester Events ====================

  @OnEvent("semester.started")
  async onSemesterStarted(semester: Semester): Promise<void> {
    this.logger.log(`Event: semester.started - Semester: ${semester.id}`);

    // Get all active students and lecturers
    const [students, lecturers] = await Promise.all([
      this.prisma.student.findMany({
        where: { active: true },
        select: { id: true },
      }),
      this.prisma.lecturer.findMany({
        where: { active: true },
        select: { id: true },
      }),
    ]);

    const studentNotifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: NotificationType.INFO,
            title: "New Semester Started",
            message: `Semester "${semester.name}" has officially started. Good luck with your studies!`,
          },
        }),
      ),
    );

    const lecturerNotifications = await this.prisma.$transaction(
      lecturers.map((lecturer) =>
        this.prisma.notification.create({
          data: {
            lecturerId: lecturer.id,
            type: NotificationType.INFO,
            title: "New Semester Started",
            message: `Semester "${semester.name}" has officially started.`,
          },
        }),
      ),
    );

    const allNotifications = [
      ...studentNotifications,
      ...lecturerNotifications,
    ];
    for (const notification of allNotifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(allNotifications);
    this.logger.log(
      `Sent semester started notifications to ${students.length} students and ${lecturers.length} lecturers`,
    );
  }

  @OnEvent("semester.ending_soon")
  async onSemesterEndingSoon(semester: Semester): Promise<void> {
    this.logger.log(`Event: semester.ending_soon - Semester: ${semester.id}`);

    // Get all active students and lecturers
    const [students, lecturers] = await Promise.all([
      this.prisma.student.findMany({
        where: { active: true },
        select: { id: true },
      }),
      this.prisma.lecturer.findMany({
        where: { active: true },
        select: { id: true },
      }),
    ]);

    const studentNotifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: NotificationType.WARNING,
            title: "Semester Ending Soon",
            message: `Semester "${semester.name}" is ending on ${semester.endDate.toLocaleDateString()}. Please complete all pending work.`,
          },
        }),
      ),
    );

    const lecturerNotifications = await this.prisma.$transaction(
      lecturers.map((lecturer) =>
        this.prisma.notification.create({
          data: {
            lecturerId: lecturer.id,
            type: NotificationType.WARNING,
            title: "Semester Ending Soon",
            message: `Semester "${semester.name}" is ending on ${semester.endDate.toLocaleDateString()}. Please finalize grades and course materials.`,
          },
        }),
      ),
    );

    const allNotifications = [
      ...studentNotifications,
      ...lecturerNotifications,
    ];
    for (const notification of allNotifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(allNotifications);
    this.logger.log(
      `Sent semester ending soon notifications to ${students.length} students and ${lecturers.length} lecturers`,
    );
  }

  // ==================== Course Events ====================

  @OnEvent("course.created")
  async onCourseCreated(course: Course): Promise<void> {
    this.logger.log(`Event: course.created - Course: ${course.id}`);

    const [students, lecturers] = await Promise.all([
      this.prisma.student.findMany({
        where: { active: true },
        select: { id: true },
      }),
      this.prisma.lecturer.findMany({ select: { id: true } }),
    ]);

    const title = "New Course Available";
    const message = `A new course "${course.name}" has been added to the catalog. Check the course catalog to learn more.`;
    const url = "/courses";

    const studentNotifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: NotificationType.INFO,
            title,
            message,
            url,
          },
        }),
      ),
    );

    const lecturerNotifications = await this.prisma.$transaction(
      lecturers.map((lecturer) =>
        this.prisma.notification.create({
          data: {
            lecturerId: lecturer.id,
            type: NotificationType.INFO,
            title,
            message,
            url,
          },
        }),
      ),
    );

    const allNotifications = [
      ...studentNotifications,
      ...lecturerNotifications,
    ];
    for (const notification of allNotifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(allNotifications);
    this.logger.log(
      `Sent course created notifications to ${students.length} students and ${lecturers.length} lecturers`,
    );
  }

  // ==================== Department Events ====================

  @OnEvent("department.created")
  async onDepartmentCreated(department: Department): Promise<void> {
    this.logger.log(`Event: department.created - Department: ${department.id}`);

    const [students, lecturers] = await Promise.all([
      this.prisma.student.findMany({
        where: { active: true },
        select: { id: true },
      }),
      this.prisma.lecturer.findMany({ select: { id: true } }),
    ]);

    const title = "New Department Added";
    const message = `A new department "${department.name}" (${department.departmentId}) has been added.`;
    const url = "/courses";

    const studentNotifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: NotificationType.INFO,
            title,
            message,
            url,
          },
        }),
      ),
    );

    const lecturerNotifications = await this.prisma.$transaction(
      lecturers.map((lecturer) =>
        this.prisma.notification.create({
          data: {
            lecturerId: lecturer.id,
            type: NotificationType.INFO,
            title,
            message,
            url,
          },
        }),
      ),
    );

    const allNotifications = [
      ...studentNotifications,
      ...lecturerNotifications,
    ];
    for (const notification of allNotifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(allNotifications);
    this.logger.log(
      `Sent department created notifications to ${students.length} students and ${lecturers.length} lecturers`,
    );
  }

  // ==================== Post Events ====================

  @OnEvent("post.created")
  async onPostCreated(post: Post): Promise<void> {
    this.logger.log(
      `Event: post.created - Post: ${post.id}, Type: ${post.type}`,
    );

    // Determine notification type based on post type
    const notificationType =
      post.type === PostType.ANNOUNCEMENT
        ? NotificationType.WARNING
        : NotificationType.INFO;

    const postTypeLabel =
      post.type === PostType.ANNOUNCEMENT ? "Announcement" : "News";

    // Get target users based on departmentId
    let students: Student[];
    let lecturers: Lecturer[];

    if (post.departmentId) {
      // Department-specific post - only notify students in that department
      // Lecturers don't have departmentId, so we notify all lecturers for department posts
      [students, lecturers] = await Promise.all([
        this.prisma.student.findMany({
          where: { departmentId: post.departmentId },
        }),
        this.prisma.lecturer.findMany(),
      ]);
    } else {
      // Global post - notify all users
      [students, lecturers] = await Promise.all([
        this.prisma.student.findMany(),
        this.prisma.lecturer.findMany(),
      ]);
    }

    // Create notifications for students
    const studentNotifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: notificationType,
            title: `New ${postTypeLabel}: ${post.title}`,
            message:
              post.content.length > 200
                ? `${post.content.substring(0, 200)}...`
                : post.content,
            url: `/posts/${post.id}`,
          },
        }),
      ),
    );

    // Create notifications for lecturers
    const lecturerNotifications = await this.prisma.$transaction(
      lecturers.map((lecturer) =>
        this.prisma.notification.create({
          data: {
            lecturerId: lecturer.id,
            type: notificationType,
            title: `New ${postTypeLabel}: ${post.title}`,
            message:
              post.content.length > 200
                ? `${post.content.substring(0, 200)}...`
                : post.content,
            url: `/posts/${post.id}`,
          },
        }),
      ),
    );

    const allNotifications = [
      ...studentNotifications,
      ...lecturerNotifications,
    ];
    for (const notification of allNotifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(allNotifications);
    this.logger.log(
      `Sent post created notifications to ${students.length} students and ${lecturers.length} lecturers`,
    );
  }

  @OnEvent("post.updated")
  async onPostUpdated(post: Post): Promise<void> {
    this.logger.log(
      `Event: post.updated - Post: ${post.id}, Type: ${post.type}`,
    );

    // Determine notification type based on post type
    const notificationType =
      post.type === PostType.ANNOUNCEMENT
        ? NotificationType.WARNING
        : NotificationType.INFO;

    const postTypeLabel =
      post.type === PostType.ANNOUNCEMENT ? "Announcement" : "News";

    // Get target users based on departmentId
    let students: Student[];
    let lecturers: Lecturer[];

    if (post.departmentId) {
      // Department-specific post - only notify students in that department
      // Lecturers don't have departmentId, so we notify all lecturers for department posts
      [students, lecturers] = await Promise.all([
        this.prisma.student.findMany({
          where: { departmentId: post.departmentId },
        }),
        this.prisma.lecturer.findMany(),
      ]);
    } else {
      // Global post - notify all users
      [students, lecturers] = await Promise.all([
        this.prisma.student.findMany(),
        this.prisma.lecturer.findMany(),
      ]);
    }

    // Create notifications for students
    const studentNotifications = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.notification.create({
          data: {
            studentId: student.id,
            type: notificationType,
            title: `Updated ${postTypeLabel}: ${post.title}`,
            message:
              post.content.length > 200
                ? `${post.content.substring(0, 200)}...`
                : post.content,
            url: `/posts/${post.id}`,
          },
        }),
      ),
    );

    // Create notifications for lecturers
    const lecturerNotifications = await this.prisma.$transaction(
      lecturers.map((lecturer) =>
        this.prisma.notification.create({
          data: {
            lecturerId: lecturer.id,
            type: notificationType,
            title: `Updated ${postTypeLabel}: ${post.title}`,
            message:
              post.content.length > 200
                ? `${post.content.substring(0, 200)}...`
                : post.content,
            url: `/posts/${post.id}`,
          },
        }),
      ),
    );

    const allNotifications = [
      ...studentNotifications,
      ...lecturerNotifications,
    ];
    for (const notification of allNotifications) {
      this.webSocketGateway.sendNotificationToUser(notification);
    }
    await this.webhookService.triggerWebhooksForNotifications(allNotifications);
    this.logger.log(
      `Sent post updated notifications to ${students.length} students and ${lecturers.length} lecturers`,
    );
  }
}
