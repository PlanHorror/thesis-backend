import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Check for enrollment sessions that are closing soon (1 day before end)
   * Runs once per day at 8 AM
   */
  @Cron('0 8 * * *')
  async checkEnrollmentSessionsClosingSoon(): Promise<void> {
    this.logger.log('Checking for enrollment sessions closing soon...');

    try {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      // Find active sessions that end between 24-48 hours from now
      // This ensures we only notify once (when session is ~1 day from closing)
      const closingSessions = await this.prisma.enrollmentSession.findMany({
        where: {
          isActive: true,
          endDate: {
            gte: oneDayFromNow,
            lt: twoDaysFromNow,
          },
        },
        include: {
          semester: true,
        },
      });

      for (const session of closingSessions) {
        const semesterName = session.semester?.name || 'Unknown Semester';
        this.eventEmitter.emit(
          'enrollment_session.closing_soon',
          session,
          semesterName,
        );
        this.logger.log(`Emitted closing_soon event for session ${session.id}`);
      }
    } catch (error) {
      this.logger.error('Failed to check enrollment sessions', error);
    }
  }

  /**
   * Check for semesters that are starting (within today)
   * Runs every day at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkSemesterStarted(): Promise<void> {
    this.logger.log('Checking for semesters starting today...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      // Find semesters that start today
      const startingSemesters = await this.prisma.semester.findMany({
        where: {
          startDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      for (const semester of startingSemesters) {
        this.eventEmitter.emit('semester.started', semester);
        this.logger.log(`Emitted started event for semester ${semester.id}`);
      }
    } catch (error) {
      this.logger.error('Failed to check semester starts', error);
    }
  }

  /**
   * Check for semesters that are ending soon (7 days before end)
   * Runs every day at 8 AM
   */
  @Cron('0 8 * * *')
  async checkSemesterEndingSoon(): Promise<void> {
    this.logger.log('Checking for semesters ending soon...');

    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      const eightDaysFromNow = new Date(
        now.getTime() + 8 * 24 * 60 * 60 * 1000,
      );

      // Find semesters that end in exactly 7 days (to avoid duplicate notifications)
      const endingSemesters = await this.prisma.semester.findMany({
        where: {
          endDate: {
            gte: sevenDaysFromNow,
            lt: eightDaysFromNow,
          },
        },
      });

      for (const semester of endingSemesters) {
        this.eventEmitter.emit('semester.ending_soon', semester);
        this.logger.log(
          `Emitted ending_soon event for semester ${semester.id}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to check semester endings', error);
    }
  }

  /**
   * Check for exam schedules that need reminders (1 day before exam)
   * Runs every day at 8 AM
   */
  @Cron('0 8 * * *')
  async checkExamScheduleReminders(): Promise<void> {
    this.logger.log('Checking for exam schedule reminders...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Find exams scheduled for tomorrow
      const upcomingExams = await this.prisma.examSchedule.findMany({
        where: {
          examDate: tomorrowStr,
        },
        include: {
          courseOnSemester: {
            include: {
              course: true,
            },
          },
        },
      });

      for (const exam of upcomingExams) {
        const courseName =
          exam.courseOnSemester?.course?.name || 'Unknown Course';
        this.eventEmitter.emit('exam_schedule.reminder', exam, courseName);
        this.logger.log(`Emitted reminder event for exam ${exam.id}`);
      }
    } catch (error) {
      this.logger.error('Failed to check exam reminders', error);
    }
  }

  /**
   * Check for enrollment sessions that should be closed (end date passed)
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkAndCloseExpiredSessions(): Promise<void> {
    this.logger.log('Checking for expired enrollment sessions...');

    try {
      const now = new Date();

      // Find active sessions that have ended
      const expiredSessions = await this.prisma.enrollmentSession.findMany({
        where: {
          isActive: true,
          endDate: {
            lt: now,
          },
        },
        include: {
          semester: true,
        },
      });

      for (const session of expiredSessions) {
        // Update session status to closed
        await this.prisma.enrollmentSession.update({
          where: { id: session.id },
          data: { isActive: false },
        });

        const semesterName = session.semester?.name || 'Unknown Semester';
        this.eventEmitter.emit(
          'enrollment_session.closed',
          session,
          semesterName,
        );
        this.logger.log(`Closed and emitted event for session ${session.id}`);
      }
    } catch (error) {
      this.logger.error('Failed to close expired sessions', error);
    }
  }
}
