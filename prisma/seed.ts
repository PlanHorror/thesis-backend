import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data (in reverse dependency order)
  await prisma.webhookLog.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.courseDocument.deleteMany();
  await prisma.studentCourseEnrollment.deleteMany();
  await prisma.lecturerTeachingRequest.deleteMany();
  await prisma.enrollmentSession.deleteMany();
  await prisma.courseOnSemester.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.department.deleteMany();
  await prisma.lecturer.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.post.deleteMany();
  await prisma.admin.deleteMany();

  console.log('🧹 Cleaned up existing data');

  // ─── 1. Admin ────────────────────────────────────────────────
  const hashedAdminPassword = await hashPassword('admin123');
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      password: hashedAdminPassword,
      active: true,
    },
  });
  console.log(`✅ Created admin: ${admin.username}`);

  // ─── 2. Lecturers ───────────────────────────────────────────
  const hashedLecturerPassword = await hashPassword('lecturer123');
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
      prisma.lecturer.create({
        data: { ...l, password: hashedLecturerPassword, active: true },
      }),
    ),
  );
  console.log(`✅ Created ${lecturers.length} lecturers`);

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
      prisma.department.create({
        data: { ...d, headId: lecturers[headIndex].id },
      }),
    ),
  );
  console.log(`✅ Created ${departments.length} departments`);

  // ─── 4. Students ─────────────────────────────────────────────
  const hashedStudentPassword = await hashPassword('student123');

  // Helper to build student records for a department
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
    ...buildStudents(0, 'CS', 8, 0), // 8 CS students
    ...buildStudents(1, 'IT', 8, 8), // 8 IT students
    ...buildStudents(2, 'EE', 4, 16), // 4 EE students
    ...buildStudents(3, 'ME', 4, 20), // 4 ME students
    ...buildStudents(4, 'BA', 4, 24), // 4 BA students
  ];

  const students = await Promise.all(
    allStudentData.map((s) => prisma.student.create({ data: s })),
  );
  console.log(`✅ Created ${students.length} students`);

  // ─── 5. Courses ──────────────────────────────────────────────
  const courseDefinitions = [
    // CS courses
    {
      name: 'Introduction to Programming',
      credits: 3,
      deptIdx: 0,
      recommendedSemester: 'Year 1 Sem 1',
    },
    {
      name: 'Data Structures & Algorithms',
      credits: 3,
      deptIdx: 0,
      recommendedSemester: 'Year 1 Sem 2',
    },
    {
      name: 'Database Systems',
      credits: 3,
      deptIdx: 0,
      recommendedSemester: 'Year 2 Sem 1',
    },
    {
      name: 'Operating Systems',
      credits: 3,
      deptIdx: 0,
      recommendedSemester: 'Year 2 Sem 2',
    },
    {
      name: 'Software Engineering',
      credits: 3,
      deptIdx: 0,
      recommendedSemester: 'Year 3 Sem 1',
    },
    {
      name: 'Artificial Intelligence',
      credits: 3,
      deptIdx: 0,
      recommendedSemester: 'Year 3 Sem 2',
    },
    // IT courses
    {
      name: 'Web Development',
      credits: 3,
      deptIdx: 1,
      recommendedSemester: 'Year 1 Sem 1',
    },
    {
      name: 'Networking Fundamentals',
      credits: 3,
      deptIdx: 1,
      recommendedSemester: 'Year 1 Sem 2',
    },
    {
      name: 'Cybersecurity',
      credits: 3,
      deptIdx: 1,
      recommendedSemester: 'Year 2 Sem 1',
    },
    {
      name: 'Cloud Computing',
      credits: 3,
      deptIdx: 1,
      recommendedSemester: 'Year 2 Sem 2',
    },
    {
      name: 'DevOps Practices',
      credits: 3,
      deptIdx: 1,
      recommendedSemester: 'Year 3 Sem 1',
    },
    {
      name: 'Mobile App Development',
      credits: 3,
      deptIdx: 1,
      recommendedSemester: 'Year 3 Sem 2',
    },
    // EE courses
    {
      name: 'Circuit Analysis',
      credits: 3,
      deptIdx: 2,
      recommendedSemester: 'Year 1 Sem 1',
    },
    {
      name: 'Digital Electronics',
      credits: 3,
      deptIdx: 2,
      recommendedSemester: 'Year 1 Sem 2',
    },
    {
      name: 'Signal Processing',
      credits: 3,
      deptIdx: 2,
      recommendedSemester: 'Year 2 Sem 1',
    },
    {
      name: 'Power Systems',
      credits: 3,
      deptIdx: 2,
      recommendedSemester: 'Year 2 Sem 2',
    },
    {
      name: 'Embedded Systems',
      credits: 3,
      deptIdx: 2,
      recommendedSemester: 'Year 3 Sem 1',
    },
    {
      name: 'Control Systems',
      credits: 3,
      deptIdx: 2,
      recommendedSemester: 'Year 3 Sem 2',
    },
    // ME courses
    {
      name: 'Engineering Mechanics',
      credits: 3,
      deptIdx: 3,
      recommendedSemester: 'Year 1 Sem 1',
    },
    {
      name: 'Thermodynamics',
      credits: 3,
      deptIdx: 3,
      recommendedSemester: 'Year 1 Sem 2',
    },
    {
      name: 'Fluid Mechanics',
      credits: 3,
      deptIdx: 3,
      recommendedSemester: 'Year 2 Sem 1',
    },
    {
      name: 'Machine Design',
      credits: 3,
      deptIdx: 3,
      recommendedSemester: 'Year 2 Sem 2',
    },
    {
      name: 'Manufacturing Processes',
      credits: 3,
      deptIdx: 3,
      recommendedSemester: 'Year 3 Sem 1',
    },
    {
      name: 'Robotics',
      credits: 3,
      deptIdx: 3,
      recommendedSemester: 'Year 3 Sem 2',
    },
    // BA courses
    {
      name: 'Principles of Management',
      credits: 3,
      deptIdx: 4,
      recommendedSemester: 'Year 1 Sem 1',
    },
    {
      name: 'Financial Accounting',
      credits: 3,
      deptIdx: 4,
      recommendedSemester: 'Year 1 Sem 2',
    },
    {
      name: 'Marketing Management',
      credits: 3,
      deptIdx: 4,
      recommendedSemester: 'Year 2 Sem 1',
    },
    {
      name: 'Business Statistics',
      credits: 3,
      deptIdx: 4,
      recommendedSemester: 'Year 2 Sem 2',
    },
    {
      name: 'Human Resource Management',
      credits: 3,
      deptIdx: 4,
      recommendedSemester: 'Year 3 Sem 1',
    },
    {
      name: 'Strategic Management',
      credits: 3,
      deptIdx: 4,
      recommendedSemester: 'Year 3 Sem 2',
    },
  ];

  const courses = await Promise.all(
    courseDefinitions.map(({ deptIdx, ...c }) =>
      prisma.course.create({
        data: { ...c, departmentId: departments[deptIdx].id },
      }),
    ),
  );
  console.log(`✅ Created ${courses.length} courses`);

  // ─── 6. Semesters ────────────────────────────────────────────
  const semesterData = [
    {
      name: 'Spring 2025',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-30'),
    },
    {
      name: 'Fall 2025',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-12-20'),
    },
    {
      name: 'Spring 2026',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-05-30'),
    },
    {
      name: 'Fall 2026',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-12-20'),
    },
    {
      name: 'Spring 2027',
      startDate: new Date('2027-01-15'),
      endDate: new Date('2027-05-30'),
    },
    {
      name: 'Fall 2027',
      startDate: new Date('2027-08-15'),
      endDate: new Date('2027-12-20'),
    },
    {
      name: 'Spring 2028',
      startDate: new Date('2028-01-15'),
      endDate: new Date('2028-05-30'),
    },
    {
      name: 'Fall 2028',
      startDate: new Date('2028-08-15'),
      endDate: new Date('2028-12-20'),
    },
  ];

  const semesters = await Promise.all(
    semesterData.map((s) => prisma.semester.create({ data: s })),
  );
  console.log(`✅ Created ${semesters.length} semesters`);

  // ─── 7. CourseOnSemester (first 2 semesters) ────────────────
  // Assign all 30 courses to Spring 2025 & Fall 2025, round-robin lecturers
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
        dayOfWeek: (courseIdx % 5) + 1, // Mon=1 to Fri=5
        startTime: 8 + (courseIdx % 4) * 2, // 8, 10, 12, 14
        endTime: 10 + (courseIdx % 4) * 2, // 10, 12, 14, 16
        capacity: 40,
      });
    });
  }

  const courseOnSemesters = await Promise.all(
    courseOnSemesterRecords.map((cos) =>
      prisma.courseOnSemester.create({ data: cos }),
    ),
  );
  console.log(
    `✅ Created ${courseOnSemesters.length} course-on-semester records`,
  );

  // ─── 8. Student Enrollments (Spring 2025) ───────────────────
  // Enroll each student in 3 courses from their department (Spring 2025 only)
  const spring2025CoS = courseOnSemesters.filter(
    (cos) => cos.semesterId === semesters[0].id,
  );

  const enrollmentRecords: Array<{
    studentId: string;
    courseOnSemesterId: string;
  }> = [];

  // Group Spring 2025 course-on-semesters by department
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
    // Enroll in up to 3 courses
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
      prisma.studentCourseEnrollment.create({ data: e }),
    ),
  );
  console.log(`✅ Created ${enrollments.length} student enrollments`);

  // ─── 9. Enrollment Sessions ─────────────────────────────────
  const enrollmentSessions = await Promise.all(
    semesters.slice(0, 2).map((sem, i) =>
      prisma.enrollmentSession.create({
        data: {
          name: `Enrollment ${sem.name}`,
          semesterId: sem.id,
          startDate: new Date(
            sem.startDate.getTime() - 30 * 24 * 60 * 60 * 1000,
          ), // 30 days before semester
          endDate: new Date(sem.startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before semester
          isActive: i === 0,
        },
      }),
    ),
  );
  console.log(`✅ Created ${enrollmentSessions.length} enrollment sessions`);

  // ─── 10. Notifications ──────────────────────────────────────
  // Sample notifications for first 5 students and all lecturers
  const notificationData = [
    ...students.slice(0, 5).map((s, i) => ({
      title: `Welcome to the University`,
      message: `Hello ${s.fullName}, welcome to the new semester!`,
      studentId: s.id,
      type: 'INFO' as const,
    })),
    ...lecturers.map((l) => ({
      title: `Teaching Schedule Published`,
      message: `Dear ${l.fullName}, your teaching schedule for Spring 2025 is now available.`,
      lecturerId: l.id,
      type: 'INFO' as const,
    })),
  ];

  const notifications = await Promise.all(
    notificationData.map((n) => prisma.notification.create({ data: n })),
  );
  console.log(`✅ Created ${notifications.length} notifications`);

  // ─── 11. Posts ──────────────────────────────────────────────
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Welcome to Spring 2025 Semester',
        content:
          'We are excited to welcome all students and staff to the new semester. Please check your schedules and course registrations.',
        type: 'ANNOUNCEMENT',
        adminId: admin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Campus Library Hours Extended',
        content:
          'The campus library will now be open from 7:00 AM to 11:00 PM on weekdays during the semester.',
        type: 'NEWS',
        adminId: admin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'CS Department: Hackathon 2025',
        content:
          'The Computer Science department is hosting its annual hackathon. Register now at the CS office.',
        type: 'NEWS',
        adminId: admin.id,
        departmentId: departments[0].id,
      },
    }),
  ]);
  console.log(`✅ Created ${posts.length} posts`);

  // ─── Summary ────────────────────────────────────────────────
  console.log('\n📊 Seed Summary:');
  console.log(`   Admin:              1`);
  console.log(`   Lecturers:          ${lecturers.length}`);
  console.log(`   Departments:        ${departments.length}`);
  console.log(`   Students:           ${students.length}`);
  console.log(`   Courses:            ${courses.length}`);
  console.log(`   Semesters:          ${semesters.length}`);
  console.log(`   CourseOnSemesters:  ${courseOnSemesters.length}`);
  console.log(`   Enrollments:        ${enrollments.length}`);
  console.log(`   EnrollmentSessions: ${enrollmentSessions.length}`);
  console.log(`   Notifications:      ${notifications.length}`);
  console.log(`   Posts:              ${posts.length}`);
  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
