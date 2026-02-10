import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async seed(): Promise<{ message: string; summary: Record<string, number> }> {
    this.logger.log('🌱 Starting seed...');

    // Clean up existing data (in reverse dependency order)
    await this.prisma.webhookLog.deleteMany();
    await this.prisma.webhook.deleteMany();
    await this.prisma.notification.deleteMany();
    await this.prisma.examSchedule.deleteMany();
    await this.prisma.courseDocument.deleteMany();
    await this.prisma.studentCourseEnrollment.deleteMany();
    await this.prisma.lecturerTeachingRequest.deleteMany();
    await this.prisma.enrollmentSession.deleteMany();
    await this.prisma.courseOnSemester.deleteMany();
    await this.prisma.course.deleteMany();
    await this.prisma.student.deleteMany();
    await this.prisma.department.deleteMany();
    await this.prisma.lecturer.deleteMany();
    await this.prisma.semester.deleteMany();
    await this.prisma.post.deleteMany();
    await this.prisma.admin.deleteMany();

    this.logger.log('🧹 Cleaned up existing data');

    // ─── 1. Admin ────────────────────────────────────────────────
    const hashedAdminPassword = await this.hashPassword('admin123');
    const admin = await this.prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedAdminPassword,
        active: true,
      },
    });
    this.logger.log(`✅ Created admin: ${admin.username}`);

    // ─── 2. Lecturers ───────────────────────────────────────────
    const hashedLecturerPassword = await this.hashPassword('lecturer123');
    const lecturerData = [
      {
        lecturerId: 'LEC-001',
        username: 'nguyen.van.a',
        email: 'nguyen.van.a@university.edu',
        fullName: 'Nguyen Van A',
      },
      {
        lecturerId: 'LEC-002',
        username: 'tran.thi.b',
        email: 'tran.thi.b@university.edu',
        fullName: 'Tran Thi B',
      },
      {
        lecturerId: 'LEC-003',
        username: 'le.van.c',
        email: 'le.van.c@university.edu',
        fullName: 'Le Van C',
      },
      {
        lecturerId: 'LEC-004',
        username: 'pham.thi.d',
        email: 'pham.thi.d@university.edu',
        fullName: 'Pham Thi D',
      },
      {
        lecturerId: 'LEC-005',
        username: 'hoang.van.e',
        email: 'hoang.van.e@university.edu',
        fullName: 'Hoang Van E',
      },
    ];

    const lecturers = await Promise.all(
      lecturerData.map((l) =>
        this.prisma.lecturer.create({
          data: { ...l, password: hashedLecturerPassword, active: true },
        }),
      ),
    );
    this.logger.log(`✅ Created ${lecturers.length} lecturers`);

    // ─── 3. Departments ─────────────────────────────────────────
    const departmentData = [
      {
        departmentId: 'CS',
        name: 'Computer Science',
        description: 'Department of Computer Science',
        headIndex: 0,
      },
      {
        departmentId: 'IT',
        name: 'Information Technology',
        description: 'Department of Information Technology',
        headIndex: 1,
      },
      {
        departmentId: 'EE',
        name: 'Electrical Engineering',
        description: 'Department of Electrical Engineering',
        headIndex: 2,
      },
      {
        departmentId: 'ME',
        name: 'Mechanical Engineering',
        description: 'Department of Mechanical Engineering',
        headIndex: 3,
      },
      {
        departmentId: 'BA',
        name: 'Business Administration',
        description: 'Department of Business Administration',
        headIndex: 4,
      },
    ];

    const departments = await Promise.all(
      departmentData.map(({ headIndex, ...d }) =>
        this.prisma.department.create({
          data: { ...d, headId: lecturers[headIndex].id },
        }),
      ),
    );
    this.logger.log(`✅ Created ${departments.length} departments`);

    // ─── 4. Students ─────────────────────────────────────────────
    const hashedStudentPassword = await this.hashPassword('student123');

    const buildStudents = (
      deptIndex: number,
      deptCode: string,
      count: number,
      startIdx: number,
    ) =>
      Array.from({ length: count }, (_, i) => {
        const num = String(startIdx + i + 1).padStart(3, '0');
        return {
          departmentId: departments[deptIndex].id,
          email: `student${num}@university.edu`,
          username: `student${num}`,
          password: hashedStudentPassword,
          studentId: `STU-${deptCode}-${num}`,
          fullName: `Student ${deptCode} ${num}`,
          gender: i % 2 === 0,
          birthDate: `200${(i % 5) + 1}-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
          citizenId: `CID${deptCode}${num}`,
          phone: `09${deptCode.charCodeAt(0)}${num}${String(i).padStart(4, '0')}`,
          active: true,
        };
      });

    const allStudentData = [
      ...buildStudents(0, 'CS', 8, 0),
      ...buildStudents(1, 'IT', 8, 8),
      ...buildStudents(2, 'EE', 4, 16),
      ...buildStudents(3, 'ME', 4, 20),
      ...buildStudents(4, 'BA', 4, 24),
    ];

    const students = await Promise.all(
      allStudentData.map((s) => this.prisma.student.create({ data: s })),
    );
    this.logger.log(`✅ Created ${students.length} students`);

    // ─── 5. Courses ──────────────────────────────────────────────
    const courseDefinitions = [
      { name: 'Introduction to Programming', credits: 3, deptIdx: 0, recommendedSemester: 'Year 1 Sem 1' },
      { name: 'Data Structures & Algorithms', credits: 3, deptIdx: 0, recommendedSemester: 'Year 1 Sem 2' },
      { name: 'Database Systems', credits: 3, deptIdx: 0, recommendedSemester: 'Year 2 Sem 1' },
      { name: 'Operating Systems', credits: 3, deptIdx: 0, recommendedSemester: 'Year 2 Sem 2' },
      { name: 'Software Engineering', credits: 3, deptIdx: 0, recommendedSemester: 'Year 3 Sem 1' },
      { name: 'Artificial Intelligence', credits: 3, deptIdx: 0, recommendedSemester: 'Year 3 Sem 2' },
      { name: 'Web Development', credits: 3, deptIdx: 1, recommendedSemester: 'Year 1 Sem 1' },
      { name: 'Networking Fundamentals', credits: 3, deptIdx: 1, recommendedSemester: 'Year 1 Sem 2' },
      { name: 'Cybersecurity', credits: 3, deptIdx: 1, recommendedSemester: 'Year 2 Sem 1' },
      { name: 'Cloud Computing', credits: 3, deptIdx: 1, recommendedSemester: 'Year 2 Sem 2' },
      { name: 'DevOps Practices', credits: 3, deptIdx: 1, recommendedSemester: 'Year 3 Sem 1' },
      { name: 'Mobile App Development', credits: 3, deptIdx: 1, recommendedSemester: 'Year 3 Sem 2' },
      { name: 'Circuit Analysis', credits: 3, deptIdx: 2, recommendedSemester: 'Year 1 Sem 1' },
      { name: 'Digital Electronics', credits: 3, deptIdx: 2, recommendedSemester: 'Year 1 Sem 2' },
      { name: 'Signal Processing', credits: 3, deptIdx: 2, recommendedSemester: 'Year 2 Sem 1' },
      { name: 'Power Systems', credits: 3, deptIdx: 2, recommendedSemester: 'Year 2 Sem 2' },
      { name: 'Embedded Systems', credits: 3, deptIdx: 2, recommendedSemester: 'Year 3 Sem 1' },
      { name: 'Control Systems', credits: 3, deptIdx: 2, recommendedSemester: 'Year 3 Sem 2' },
      { name: 'Engineering Mechanics', credits: 3, deptIdx: 3, recommendedSemester: 'Year 1 Sem 1' },
      { name: 'Thermodynamics', credits: 3, deptIdx: 3, recommendedSemester: 'Year 1 Sem 2' },
      { name: 'Fluid Mechanics', credits: 3, deptIdx: 3, recommendedSemester: 'Year 2 Sem 1' },
      { name: 'Machine Design', credits: 3, deptIdx: 3, recommendedSemester: 'Year 2 Sem 2' },
      { name: 'Manufacturing Processes', credits: 3, deptIdx: 3, recommendedSemester: 'Year 3 Sem 1' },
      { name: 'Robotics', credits: 3, deptIdx: 3, recommendedSemester: 'Year 3 Sem 2' },
      { name: 'Principles of Management', credits: 3, deptIdx: 4, recommendedSemester: 'Year 1 Sem 1' },
      { name: 'Financial Accounting', credits: 3, deptIdx: 4, recommendedSemester: 'Year 1 Sem 2' },
      { name: 'Marketing Management', credits: 3, deptIdx: 4, recommendedSemester: 'Year 2 Sem 1' },
      { name: 'Business Statistics', credits: 3, deptIdx: 4, recommendedSemester: 'Year 2 Sem 2' },
      { name: 'Human Resource Management', credits: 3, deptIdx: 4, recommendedSemester: 'Year 3 Sem 1' },
      { name: 'Strategic Management', credits: 3, deptIdx: 4, recommendedSemester: 'Year 3 Sem 2' },
    ];

    const courses = await Promise.all(
      courseDefinitions.map(({ deptIdx, ...c }) =>
        this.prisma.course.create({
          data: { ...c, departmentId: departments[deptIdx].id },
        }),
      ),
    );
    this.logger.log(`✅ Created ${courses.length} courses`);

    // ─── 6. Semesters ────────────────────────────────────────────
    const semesterData = [
      { name: 'Spring 2025', startDate: new Date('2025-01-15'), endDate: new Date('2025-05-30') },
      { name: 'Fall 2025', startDate: new Date('2025-08-15'), endDate: new Date('2025-12-20') },
      { name: 'Spring 2026', startDate: new Date('2026-01-15'), endDate: new Date('2026-05-30') },
      { name: 'Fall 2026', startDate: new Date('2026-08-15'), endDate: new Date('2026-12-20') },
      { name: 'Spring 2027', startDate: new Date('2027-01-15'), endDate: new Date('2027-05-30') },
      { name: 'Fall 2027', startDate: new Date('2027-08-15'), endDate: new Date('2027-12-20') },
      { name: 'Spring 2028', startDate: new Date('2028-01-15'), endDate: new Date('2028-05-30') },
      { name: 'Fall 2028', startDate: new Date('2028-08-15'), endDate: new Date('2028-12-20') },
    ];

    const semesters = await Promise.all(
      semesterData.map((s) => this.prisma.semester.create({ data: s })),
    );
    this.logger.log(`✅ Created ${semesters.length} semesters`);

    // ─── 7. CourseOnSemester (first 2 semesters) ────────────────
    const courseOnSemesterRecords: Array<{
      courseId: string;
      semesterId: string;
      lecturerId: string;
      location: string;
      dayOfWeek: number;
      startTime: number;
      endTime: number;
      capacity: number;
    }> = [];

    for (let semIdx = 0; semIdx < 2; semIdx++) {
      courses.forEach((course, courseIdx) => {
        const lecturerIdx = courseIdx % lecturers.length;
        courseOnSemesterRecords.push({
          courseId: course.id,
          semesterId: semesters[semIdx].id,
          lecturerId: lecturers[lecturerIdx].id,
          location: `Room ${String.fromCharCode(65 + (courseIdx % 5))}${100 + courseIdx}`,
          dayOfWeek: (courseIdx % 5) + 1,
          startTime: 8 + (courseIdx % 4) * 2,
          endTime: 10 + (courseIdx % 4) * 2,
          capacity: 40,
        });
      });
    }

    const courseOnSemesters = await Promise.all(
      courseOnSemesterRecords.map((cos) =>
        this.prisma.courseOnSemester.create({ data: cos }),
      ),
    );
    this.logger.log(`✅ Created ${courseOnSemesters.length} course-on-semester records`);

    // ─── 8. Student Enrollments (Spring 2025) ───────────────────
    const spring2025CoS = courseOnSemesters.filter(
      (cos) => cos.semesterId === semesters[0].id,
    );

    const enrollmentRecords: Array<{
      studentId: string;
      courseOnSemesterId: string;
    }> = [];

    const cosByDept = new Map<string, typeof spring2025CoS>();
    for (const cos of spring2025CoS) {
      const course = courses.find((c) => c.id === cos.courseId);
      if (course?.departmentId) {
        const existing = cosByDept.get(course.departmentId) ?? [];
        existing.push(cos);
        cosByDept.set(course.departmentId, existing);
      }
    }

    for (const student of students) {
      const deptCourses = cosByDept.get(student.departmentId) ?? [];
      const toEnroll = deptCourses.slice(0, 3);
      for (const cos of toEnroll) {
        enrollmentRecords.push({
          studentId: student.id,
          courseOnSemesterId: cos.id,
        });
      }
    }

    const enrollments = await Promise.all(
      enrollmentRecords.map((e) =>
        this.prisma.studentCourseEnrollment.create({ data: e }),
      ),
    );
    this.logger.log(`✅ Created ${enrollments.length} student enrollments`);

    // ─── 9. Enrollment Sessions ─────────────────────────────────
    const enrollmentSessions = await Promise.all(
      semesters.slice(0, 2).map((sem, i) =>
        this.prisma.enrollmentSession.create({
          data: {
            name: `Enrollment ${sem.name}`,
            semesterId: sem.id,
            startDate: new Date(sem.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(sem.startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            isActive: i === 0,
          },
        }),
      ),
    );
    this.logger.log(`✅ Created ${enrollmentSessions.length} enrollment sessions`);

    // ─── 10. Notifications ──────────────────────────────────────
    const notificationData = [
      ...students.slice(0, 5).map((s) => ({
        title: 'Welcome to the University',
        message: `Hello ${s.fullName}, welcome to the new semester!`,
        studentId: s.id,
        type: 'INFO' as const,
      })),
      ...lecturers.map((l) => ({
        title: 'Teaching Schedule Published',
        message: `Dear ${l.fullName}, your teaching schedule for Spring 2025 is now available.`,
        lecturerId: l.id,
        type: 'INFO' as const,
      })),
    ];

    const notifications = await Promise.all(
      notificationData.map((n) => this.prisma.notification.create({ data: n })),
    );
    this.logger.log(`✅ Created ${notifications.length} notifications`);

    // ─── 11. Posts ──────────────────────────────────────────────
    const posts = await Promise.all([
      this.prisma.post.create({
        data: {
          title: 'Welcome to Spring 2025 Semester',
          content: 'We are excited to welcome all students and staff to the new semester.',
          type: 'ANNOUNCEMENT',
          adminId: admin.id,
        },
      }),
      this.prisma.post.create({
        data: {
          title: 'Campus Library Hours Extended',
          content: 'The campus library will now be open from 7:00 AM to 11:00 PM on weekdays.',
          type: 'NEWS',
          adminId: admin.id,
        },
      }),
      this.prisma.post.create({
        data: {
          title: 'CS Department: Hackathon 2025',
          content: 'The Computer Science department is hosting its annual hackathon.',
          type: 'NEWS',
          adminId: admin.id,
          departmentId: departments[0].id,
        },
      }),
    ]);
    this.logger.log(`✅ Created ${posts.length} posts`);

    const summary = {
      admins: 1,
      lecturers: lecturers.length,
      departments: departments.length,
      students: students.length,
      courses: courses.length,
      semesters: semesters.length,
      courseOnSemesters: courseOnSemesters.length,
      enrollments: enrollments.length,
      enrollmentSessions: enrollmentSessions.length,
      notifications: notifications.length,
      posts: posts.length,
    };

    this.logger.log('✨ Seed completed successfully!');

    return {
      message: 'Database seeded successfully',
      summary,
    };
  }
}
