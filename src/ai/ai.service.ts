import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Lecturer, Student } from "@prisma/client";
import { Role } from "common";
import { EnrollmentService } from "src/course/enrollment/enrollment.service";
import { ExamScheduleService } from "src/exam-schedule/exam-schedule.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { UpdateConversationDto } from "./dto/update-conversation.dto";

const MAX_CONVERSATIONS = 5;
const MAX_CONTEXT_MESSAGES = 10;

const DAY_NAMES: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

function formatTime(minutes: number | null): string {
  if (minutes === null) return "TBA";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

const LMS_SYSTEM_PROMPT = `You are an LMS assistant for a university. Help students and lecturers with:
- Course schedules, enrollment, timetables
- Grades, progress, exams
- Study tips, time management, academic advice

If the user asks something unrelated to the LMS (e.g. general knowledge, coding, recipes), politely say: "I'm here to help with your LMS—courses, schedules, grades, and academic matters. For other topics, please use a different tool."`;

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollmentService: EnrollmentService,
    private readonly examScheduleService: ExamScheduleService,
  ) {}

  private getUserIdAndRole(
    user: Student | Lecturer,
    role: Role,
  ): { userId: string; role: "student" | "lecturer" } {
    if (role === Role.STUDENT) {
      return { userId: (user as Student).id, role: "student" };
    }
    if (role === Role.LECTURER) {
      return { userId: (user as Lecturer).id, role: "lecturer" };
    }
    throw new ForbiddenException(
      "AI chat is only available for students and lecturers",
    );
  }

  private ensureConsentOrThrow(user: Student | Lecturer, role: Role) {
    if (role === Role.STUDENT) {
      const s = user as Student;
      if (!s.aiConsentAt) {
        throw new BadRequestException(
          "AI features require your consent. Please review and accept the AI data usage policy.",
        );
      }
    } else if (role === Role.LECTURER) {
      const l = user as Lecturer;
      if (!l.aiConsentAt) {
        throw new BadRequestException(
          "AI features require your consent. Please review and accept the AI data usage policy.",
        );
      }
    }
  }

  private async getScheduleText(
    userId: string,
    role: "student" | "lecturer",
  ): Promise<string> {
    const lines: string[] = [];
    const sortedDays = [0, 1, 2, 3, 4, 5, 6];

    if (role === "student") {
      const enrollments = await this.prisma.studentCourseEnrollment.findMany({
        where: { studentId: userId },
        include: {
          courseOnSemester: {
            include: { course: true, lecturer: true },
          },
        },
      });

      for (const day of sortedDays) {
        const daysEnrollments = enrollments.filter(
          (e) => e.courseOnSemester.dayOfWeek === day,
        );
        if (daysEnrollments.length === 0) continue;

        lines.push(`\n${DAY_NAMES[day]}:`);
        for (const e of daysEnrollments) {
          const cos = e.courseOnSemester;
          const timeStr = `${formatTime(cos.startTime)} - ${formatTime(cos.endTime)}`;
          const loc = cos.location ?? "TBA";
          const lecturer = cos.lecturer?.fullName ?? null;
          const extra = lecturer ? ` (${lecturer})` : "";
          lines.push(`  - ${cos.course.name}: ${timeStr} @ ${loc}${extra}`);
        }
      }
    } else {
      const courses = await this.prisma.courseOnSemester.findMany({
        where: { lecturerId: userId },
        include: { course: true },
      });

      for (const day of sortedDays) {
        const daysCourses = courses.filter((c) => c.dayOfWeek === day);
        if (daysCourses.length === 0) continue;

        lines.push(`\n${DAY_NAMES[day]}:`);
        for (const c of daysCourses) {
          const timeStr = `${formatTime(c.startTime)} - ${formatTime(c.endTime)}`;
          const loc = c.location ?? "TBA";
          lines.push(`  - ${c.course.name}: ${timeStr} @ ${loc}`);
        }
      }
    }

    return lines.join("\n") || "No scheduled classes.";
  }

  /** Student-only: grades, progress, exams, schedule for academic advice. */
  private async getStudentAcademicContext(studentId: string): Promise<string> {
    const [scheduleText, progress, exams] = await Promise.all([
      this.getScheduleText(studentId, "student"),
      this.enrollmentService.getStudentProgress(studentId),
      this.examScheduleService.findByStudentId(studentId),
    ]);

    const parts: string[] = [];

    parts.push(
      "## Weekly Schedule\n" + (scheduleText || "No scheduled classes."),
    );

    parts.push("\n## Academic Progress");
    parts.push(
      `Overall: ${progress.overall.totalCreditsAttempted} credits attempted, ${progress.overall.totalCreditsCompleted} completed. Cumulative GPA: ${progress.overall.cumulativeGpa ?? "N/A"}. Status: ${progress.overall.status}.`,
    );
    for (const s of progress.bySemester) {
      const gpaStr = s.gpa != null ? s.gpa.toFixed(2) : "N/A";
      parts.push(
        `\n${s.semesterName}: ${s.creditsAttempted} credits, GPA ${gpaStr}`,
      );
      for (const e of s.enrollments) {
        const gradeStr =
          e.finalGrade != null ? e.finalGrade.toFixed(1) : "pending";
        parts.push(`  - ${e.courseName} (${e.credits} cr): ${gradeStr}`);
      }
    }

    if (exams.length > 0) {
      parts.push("\n## Exam Schedule");
      for (const ex of exams) {
        const cos = (ex as { courseOnSemester?: { course: { name: string } } })
          .courseOnSemester;
        const courseName = cos?.course?.name ?? "Unknown";
        const date = ex.examDate ?? "TBA";
        const loc = ex.location ?? "TBA";
        parts.push(`- ${courseName}: ${date} @ ${loc}`);
      }
    } else {
      parts.push("\n## Exam Schedule\nNo exams found.");
    }

    return parts.join("\n");
  }

  /** Lecturer-only: course analytics (avg grade, at-risk, distribution) for all assigned courses. */
  private async getLecturerTeachingContext(
    lecturerId: string,
  ): Promise<string> {
    const courses = await this.prisma.courseOnSemester.findMany({
      where: { lecturerId },
      include: { course: true, semester: true },
    });

    const parts: string[] = [];
    for (const cos of courses) {
      const analytics = await this.enrollmentService.getCourseAnalytics(
        cos.id,
        lecturerId,
      );
      const dist = analytics.distribution;
      parts.push(
        `\n## ${cos.course.name} (${cos.semester.name})\n` +
          `Students: ${analytics.totalStudents}, Graded: ${analytics.gradedCount}. ` +
          `Average grade: ${analytics.averageGrade != null ? analytics.averageGrade.toFixed(2) : "N/A"}. ` +
          `At-risk (grade < 5): ${analytics.atRiskCount}. ` +
          `Distribution: 0-4: ${dist["0-4"]}, 5-6: ${dist["5-6"]}, 7-8: ${dist["7-8"]}, 9-10: ${dist["9-10"]}.`,
      );
    }
    return parts.join("\n") || "No assigned courses.";
  }

  private async callGemini(
    systemPrompt: string,
    contents: Array<{ role: "user" | "model"; parts: string }>,
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return "**AI unavailable** – Add GEMINI_API_KEY to your backend environment.";
    }

    const formattedContents = contents.map((c) => ({
      role: c.role === "model" ? "model" : "user",
      parts: [{ text: c.parts }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: formattedContents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg =
        (err as { error?: { message?: string } })?.error?.message ??
        `AI request failed: ${response.status}`;
      throw new BadRequestException(msg);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text ?? "Unable to generate response. Please try again.";
  }

  async listConversations(user: Student | Lecturer, role: Role) {
    // Listing does not strictly require consent (shows empty if none), but
    // we still enforce consent for any meaningful interaction via UI gate.
    const { userId } = this.getUserIdAndRole(user, role);
    const isStudent = role === Role.STUDENT;

    return this.prisma.aiConversation.findMany({
      where: isStudent ? { studentId: userId } : { lecturerId: userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        preset: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async createConversation(
    user: Student | Lecturer,
    role: Role,
    dto: CreateConversationDto,
  ) {
    this.ensureConsentOrThrow(user, role);
    const { userId } = this.getUserIdAndRole(user, role);
    const isStudent = role === Role.STUDENT;

    if (dto.preset === "academic_advisor" && !isStudent) {
      throw new BadRequestException(
        "Academic Advisor is only available for students.",
      );
    }
    if (dto.preset === "course_analytics" && isStudent) {
      throw new BadRequestException(
        "Course Analytics is only available for lecturers.",
      );
    }

    const count = await this.prisma.aiConversation.count({
      where: isStudent ? { studentId: userId } : { lecturerId: userId },
    });
    if (count >= MAX_CONVERSATIONS) {
      throw new BadRequestException(
        `You can have at most ${MAX_CONVERSATIONS} conversations. Delete one to create a new one.`,
      );
    }

    const data: {
      studentId?: string;
      lecturerId?: string;
      title: string;
      preset: string | null;
    } = {
      title: dto.title ?? getDefaultTitle(dto.preset),
      preset: dto.preset ?? null,
    };
    if (isStudent) data.studentId = userId;
    else data.lecturerId = userId;

    const conversation = await this.prisma.aiConversation.create({
      data,
      include: { messages: true },
    });

    // Auto-send first message for schedule_insights, schedule_optimizer, academic_advisor, course_analytics
    if (
      dto.preset === "schedule_insights" ||
      dto.preset === "schedule_optimizer" ||
      dto.preset === "academic_advisor" ||
      dto.preset === "course_analytics"
    ) {
      const roleType = isStudent ? "student" : "lecturer";
      let contextText: string;
      let systemPrompt: string;
      let userPrompt: string;

      if (dto.preset === "academic_advisor" && isStudent) {
        contextText = await this.getStudentAcademicContext(userId);
        systemPrompt = `You are a supportive academic advisor for a university student. You have access to their grades, progress, schedule, and exam dates.

Focus on:
1. **Grades & progress** – Identify strengths and areas to improve; suggest study strategies for weaker subjects
2. **Study tips** – Time management, exam prep, balancing workload
3. **Academic advice** – Realistic, actionable guidance based on their data

Be encouraging but honest. Use bullet points. Keep responses concise (2–4 paragraphs max). Do NOT repeat raw data—interpret it and give advice.`;
        userPrompt = `Based on this student's academic data, provide personalized insights and advice:\n\n${contextText}`;
      } else if (dto.preset === "course_analytics" && !isStudent) {
        contextText = await this.getLecturerTeachingContext(userId);
        systemPrompt = `You are a teaching assistant for a university lecturer. You have access to their course analytics (enrollment, grades, at-risk students, distribution).

Focus on:
1. **At-risk students** – Which courses need attention; suggest interventions
2. **Grade trends** – Compare courses; identify patterns
3. **Teaching insights** – Practical tips for office hours, extra support, or curriculum adjustments

Be concise. Use bullet points. Do NOT repeat raw numbers—interpret and recommend.`;
        userPrompt = `Based on this lecturer's course analytics, provide teaching insights and recommendations:\n\n${contextText}`;
      } else {
        const scheduleText = await this.getScheduleText(
          userId,
          isStudent ? "student" : "lecturer",
        );
        systemPrompt =
          dto.preset === "schedule_insights"
            ? roleType === "student"
              ? `You are a helpful academic advisor. Analyze the student's weekly schedule and provide SHORT, ACTIONABLE insights. Do NOT repeat the timetable - the user already sees it.

Focus on:
1. **Study gaps** - Identify free blocks between classes
2. **Workload** - Which days are heaviest? Any imbalance?
3. **Practical tips** - Best times to study, when to take breaks

Keep each section to 1–2 sentences. Use bullet points. Be concise. No fluff.`
              : `You are a helpful teaching assistant. Analyze the lecturer's weekly teaching schedule and provide SHORT, ACTIONABLE insights. Do NOT repeat the timetable.

Focus on:
1. **Preparation gaps** - Time between classes for prep or office hours
2. **Teaching load** - Which days are busiest?
3. **Practical tips** - Best times for grading, when to schedule office hours

Keep each section to 1–2 sentences. Use bullet points. Be concise. No fluff.`
            : `You are a timetable conflict detector and optimizer for a university ${roleType}.

Your tasks:
1. **List all time conflicts** (overlapping class times on the same day)
2. **Flag risky transitions** – back-to-back classes with different locations or ONLINE → ON_CAMPUS
3. **Recommend improvements** – suggest which class sections could be moved, swapped, or replaced
4. **Balance the week** – point out heavy days vs light days, give concise suggestions

Constraints: Do NOT repeat the entire timetable. Do NOT make up specific course codes or room numbers.`;
        userPrompt =
          dto.preset === "schedule_insights"
            ? `Analyze this ${roleType} schedule and give insights:\n\n${scheduleText}`
            : `Analyze this ${roleType} timetable and detect conflicts, risky transitions, and improvements:\n\n${scheduleText}`;
      }

      await this.prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: "user",
          content: userPrompt,
        },
      });

      const reply = await this.callGemini(systemPrompt, [
        { role: "user", parts: userPrompt },
      ]);

      await this.prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: "model",
          content: reply,
        },
      });

      const updated = await this.prisma.aiConversation.findUnique({
        where: { id: conversation.id },
        include: { messages: true },
      });
      return updated!;
    }

    return conversation;
  }

  async getConversation(id: string, user: Student | Lecturer, role: Role) {
    const { userId } = this.getUserIdAndRole(user, role);
    // const isStudent = role === Role.STUDENT;

    const conv = await this.prisma.aiConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conv) throw new NotFoundException("Conversation not found");
    if (conv.studentId !== userId && conv.lecturerId !== userId) {
      throw new ForbiddenException(
        "You do not have access to this conversation",
      );
    }

    return conv;
  }

  async updateConversation(
    id: string,
    user: Student | Lecturer,
    role: Role,
    dto: UpdateConversationDto,
  ) {
    await this.ensureOwnership(id, user, role);
    return this.prisma.aiConversation.update({
      where: { id },
      data: dto,
    });
  }

  async deleteConversation(id: string, user: Student | Lecturer, role: Role) {
    await this.ensureOwnership(id, user, role);
    await this.prisma.aiConversation.delete({ where: { id } });
    return { success: true };
  }

  private async ensureOwnership(
    id: string,
    user: Student | Lecturer,
    role: Role,
  ) {
    const conv = await this.prisma.aiConversation.findUnique({
      where: { id },
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    const isStudent = role === Role.STUDENT;
    const userId = isStudent ? (user as Student).id : (user as Lecturer).id;
    if (conv.studentId !== userId && conv.lecturerId !== userId) {
      throw new ForbiddenException(
        "You do not have access to this conversation",
      );
    }
  }

  async sendMessage(
    conversationId: string,
    user: Student | Lecturer,
    role: Role,
    dto: SendMessageDto,
  ) {
    this.ensureConsentOrThrow(user, role);
    const conv = await this.getConversation(conversationId, user, role);
    const { userId } = this.getUserIdAndRole(user, role);
    const isStudent = role === Role.STUDENT;
    const roleType = isStudent ? "student" : "lecturer";

    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: "user",
        content: dto.content,
      },
    });

    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const allMessages = await this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    const recentMessages = allMessages.slice(-MAX_CONTEXT_MESSAGES);
    const contents = recentMessages.map((m) => ({
      role: m.role as "user" | "model",
      parts: m.content,
    }));

    let systemPrompt = LMS_SYSTEM_PROMPT;

    if (
      conv.preset === "schedule_insights" ||
      conv.preset === "schedule_optimizer"
    ) {
      const scheduleText = await this.getScheduleText(userId, roleType);
      systemPrompt += `\n\nYou have access to the user's timetable:\n${scheduleText}\n\nUse this when answering questions about their schedule.`;
    } else if (conv.preset === "academic_advisor" && isStudent) {
      const contextText = await this.getStudentAcademicContext(userId);
      systemPrompt += `\n\nYou have access to the student's academic data. Use it to give personalized advice:\n\n${contextText}`;
    } else if (conv.preset === "course_analytics" && !isStudent) {
      const contextText = await this.getLecturerTeachingContext(userId);
      systemPrompt += `\n\nYou have access to the lecturer's course analytics. Use it for teaching insights:\n\n${contextText}`;
    }

    const reply = await this.callGemini(systemPrompt, contents);

    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: "model",
        content: reply,
      },
    });

    const newMessage = await this.prisma.aiMessage.findFirst({
      where: { conversationId, role: "model" },
      orderBy: { createdAt: "desc" },
    });

    return newMessage!;
  }

  getConsent(user: Student | Lecturer, role: Role) {
    if (role === Role.STUDENT) {
      const s = user as Student;
      return {
        accepted: !!s.aiConsentAt,
        acceptedAt: s.aiConsentAt ?? null,
        version: s.aiConsentVersion ?? null,
      };
    }
    const l = user as Lecturer;
    return {
      accepted: !!l.aiConsentAt,
      acceptedAt: l.aiConsentAt ?? null,
      version: l.aiConsentVersion ?? null,
    };
  }

  async acceptConsent(user: Student | Lecturer, role: Role, version: string) {
    const now = new Date();
    if (role === Role.STUDENT) {
      await this.prisma.student.update({
        where: { id: (user as Student).id },
        data: {
          aiConsentAt: now,
          aiConsentVersion: version,
        },
      });
    } else if (role === Role.LECTURER) {
      await this.prisma.lecturer.update({
        where: { id: (user as Lecturer).id },
        data: {
          aiConsentAt: now,
          aiConsentVersion: version,
        },
      });
    }

    return { accepted: true, acceptedAt: now, version };
  }
}

function getDefaultTitle(preset?: string | null): string {
  switch (preset) {
    case "schedule_insights":
      return "Schedule Insights";
    case "schedule_optimizer":
      return "Schedule Optimizer";
    case "general":
      return "General LMS Help";
    case "academic_advisor":
      return "Academic Advisor";
    case "course_analytics":
      return "Course Analytics";
    default:
      return "New Chat";
  }
}
