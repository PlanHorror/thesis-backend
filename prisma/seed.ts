import * as bcrypt from "bcrypt";
import { PrismaService } from "../src/prisma/prisma.service";

const prisma = new PrismaService();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

/** Minutes from midnight (backend DTO format). 8:00 = 480, 10:00 = 600, etc. */
function timeToMinutes(hours: number, minutes = 0): number {
  return hours * 60 + minutes;
}

async function main() {
  console.log("Starting seed...");

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

  console.log("Cleaned up existing data");

  // ─── 1. Admin ────────────────────────────────────────────────
  const hashedAdminPassword = await hashPassword("1234");
  const admin = await prisma.admin.create({
    data: {
      username: "admin",
      password: hashedAdminPassword,
      active: true,
    },
  });
  console.log(`Created admin: ${admin.username}`);

  // ─── 2. Lecturers ───────────────────────────────────────────
  const hashedLecturerPassword = await hashPassword("1234");
  const lecturerData = [
    {
      lecturerId: "LEC001",
      username: "nguyenvana",
      email: "nguyenvana@university.edu",
      fullName: "Nguyen Van A",
    },
    {
      lecturerId: "LEC002",
      username: "tranthib",
      email: "tranthib@university.edu",
      fullName: "Tran Thi B",
    },
    {
      lecturerId: "LEC003",
      username: "levanc",
      email: "levanc@university.edu",
      fullName: "Le Van C",
    },
    {
      lecturerId: "LEC004",
      username: "phamthid",
      email: "phamthid@university.edu",
      fullName: "Pham Thi D",
    },
    {
      lecturerId: "LEC005",
      username: "hoangvane",
      email: "hoangvane@university.edu",
      fullName: "Hoang Van E",
    },
  ];

  const lecturers = await Promise.all(
    lecturerData.map((l) =>
      prisma.lecturer.create({
        data: { ...l, password: hashedLecturerPassword, active: true },
      }),
    ),
  );
  console.log(`Created ${lecturers.length} lecturers`);

  // ─── 3. Departments ─────────────────────────────────────────
  const departmentData = [
    {
      departmentId: "CS",
      name: "Computer Science",
      description: "Department of Computer Science",
      headIndex: 0,
    },
    {
      departmentId: "IT",
      name: "Information Technology",
      description: "Department of Information Technology",
      headIndex: 1,
    },
    {
      departmentId: "EE",
      name: "Electrical Engineering",
      description: "Department of Electrical Engineering",
      headIndex: 2,
    },
    {
      departmentId: "ME",
      name: "Mechanical Engineering",
      description: "Department of Mechanical Engineering",
      headIndex: 3,
    },
    {
      departmentId: "BA",
      name: "Business Administration",
      description: "Department of Business Administration",
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
  console.log(`Created ${departments.length} departments`);

  // ─── 4. Students ─────────────────────────────────────────────
  const hashedStudentPassword = await hashPassword("1234");

  const buildStudents = (
    deptIndex: number,
    deptCode: string,
    count: number,
    startIdx: number,
  ) =>
    Array.from({ length: count }, (_, i) => {
      const num = String(startIdx + i + 1).padStart(3, "0");
      return {
        departmentId: departments[deptIndex].id,
        email: `student.${deptCode.toLowerCase()}.${num}@university.edu`,
        username: `student_${deptCode.toLowerCase()}_${num}`,
        password: hashedStudentPassword,
        studentId: `STU-${deptCode}-${num}`,
        fullName: `Student ${deptCode} ${num}`,
        gender: i % 2 === 0,
        birthDate: `200${(i % 5) + 1}-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
        citizenId: `CID-${deptCode}-${num}`,
        phone: `+849${String(10000000 + startIdx * 1000 + i).slice(-8)}`,
        address:
          i % 3 === 0
            ? `${100 + i} University Street, District ${(i % 9) + 1}`
            : null,
        active: true,
      };
    });

  const allStudentData = [
    ...buildStudents(0, "CS", 8, 0),
    ...buildStudents(1, "IT", 8, 8),
    ...buildStudents(2, "EE", 4, 16),
    ...buildStudents(3, "ME", 4, 20),
    ...buildStudents(4, "BA", 4, 24),
  ];

  const students = await Promise.all(
    allStudentData.map((s) => prisma.student.create({ data: s })),
  );
  console.log(`Created ${students.length} students`);

  // ─── 5. Courses ──────────────────────────────────────────────
  const courseDefinitions = [
    {
      name: "Introduction to Programming",
      credits: 3,
      deptIdx: 0,
      recommendedSemester: "Year 1 Sem 1",
    },
    {
      name: "Data Structures & Algorithms",
      credits: 3,
      deptIdx: 0,
      recommendedSemester: "Year 1 Sem 2",
    },
    {
      name: "Database Systems",
      credits: 3,
      deptIdx: 0,
      recommendedSemester: "Year 2 Sem 1",
    },
    {
      name: "Operating Systems",
      credits: 3,
      deptIdx: 0,
      recommendedSemester: "Year 2 Sem 2",
    },
    {
      name: "Software Engineering",
      credits: 3,
      deptIdx: 0,
      recommendedSemester: "Year 3 Sem 1",
    },
    {
      name: "Artificial Intelligence",
      credits: 3,
      deptIdx: 0,
      recommendedSemester: "Year 3 Sem 2",
    },
    {
      name: "Web Development",
      credits: 3,
      deptIdx: 1,
      recommendedSemester: "Year 1 Sem 1",
    },
    {
      name: "Networking Fundamentals",
      credits: 3,
      deptIdx: 1,
      recommendedSemester: "Year 1 Sem 2",
    },
    {
      name: "Cybersecurity",
      credits: 3,
      deptIdx: 1,
      recommendedSemester: "Year 2 Sem 1",
    },
    {
      name: "Cloud Computing",
      credits: 3,
      deptIdx: 1,
      recommendedSemester: "Year 2 Sem 2",
    },
    {
      name: "DevOps Practices",
      credits: 3,
      deptIdx: 1,
      recommendedSemester: "Year 3 Sem 1",
    },
    {
      name: "Mobile App Development",
      credits: 3,
      deptIdx: 1,
      recommendedSemester: "Year 3 Sem 2",
    },
    {
      name: "Circuit Analysis",
      credits: 3,
      deptIdx: 2,
      recommendedSemester: "Year 1 Sem 1",
    },
    {
      name: "Digital Electronics",
      credits: 3,
      deptIdx: 2,
      recommendedSemester: "Year 1 Sem 2",
    },
    {
      name: "Signal Processing",
      credits: 3,
      deptIdx: 2,
      recommendedSemester: "Year 2 Sem 1",
    },
    {
      name: "Power Systems",
      credits: 3,
      deptIdx: 2,
      recommendedSemester: "Year 2 Sem 2",
    },
    {
      name: "Embedded Systems",
      credits: 3,
      deptIdx: 2,
      recommendedSemester: "Year 3 Sem 1",
    },
    {
      name: "Control Systems",
      credits: 3,
      deptIdx: 2,
      recommendedSemester: "Year 3 Sem 2",
    },
    {
      name: "Engineering Mechanics",
      credits: 3,
      deptIdx: 3,
      recommendedSemester: "Year 1 Sem 1",
    },
    {
      name: "Thermodynamics",
      credits: 3,
      deptIdx: 3,
      recommendedSemester: "Year 1 Sem 2",
    },
    {
      name: "Fluid Mechanics",
      credits: 3,
      deptIdx: 3,
      recommendedSemester: "Year 2 Sem 1",
    },
    {
      name: "Machine Design",
      credits: 3,
      deptIdx: 3,
      recommendedSemester: "Year 2 Sem 2",
    },
    {
      name: "Manufacturing Processes",
      credits: 3,
      deptIdx: 3,
      recommendedSemester: "Year 3 Sem 1",
    },
    {
      name: "Robotics",
      credits: 3,
      deptIdx: 3,
      recommendedSemester: "Year 3 Sem 2",
    },
    {
      name: "Principles of Management",
      credits: 3,
      deptIdx: 4,
      recommendedSemester: "Year 1 Sem 1",
    },
    {
      name: "Financial Accounting",
      credits: 3,
      deptIdx: 4,
      recommendedSemester: "Year 1 Sem 2",
    },
    {
      name: "Marketing Management",
      credits: 3,
      deptIdx: 4,
      recommendedSemester: "Year 2 Sem 1",
    },
    {
      name: "Business Statistics",
      credits: 3,
      deptIdx: 4,
      recommendedSemester: "Year 2 Sem 2",
    },
    {
      name: "Human Resource Management",
      credits: 3,
      deptIdx: 4,
      recommendedSemester: "Year 3 Sem 1",
    },
    {
      name: "Strategic Management",
      credits: 3,
      deptIdx: 4,
      recommendedSemester: "Year 3 Sem 2",
    },
  ];

  const courses = await Promise.all(
    courseDefinitions.map(({ deptIdx, ...c }) =>
      prisma.course.create({
        data: { ...c, departmentId: departments[deptIdx].id },
      }),
    ),
  );
  console.log(`Created ${courses.length} courses`);

  // ─── 6. Semesters ────────────────────────────────────────────
  const semesterData = [
    {
      name: "Spring 2025",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-05-30"),
    },
    {
      name: "Fall 2025",
      startDate: new Date("2025-08-15"),
      endDate: new Date("2025-12-20"),
    },
    {
      name: "Spring 2026",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-05-30"),
    },
    {
      name: "Fall 2026",
      startDate: new Date("2026-08-15"),
      endDate: new Date("2026-12-20"),
    },
    {
      name: "Spring 2027",
      startDate: new Date("2027-01-15"),
      endDate: new Date("2027-05-30"),
    },
    {
      name: "Fall 2027",
      startDate: new Date("2027-08-15"),
      endDate: new Date("2027-12-20"),
    },
    {
      name: "Spring 2028",
      startDate: new Date("2028-01-15"),
      endDate: new Date("2028-05-30"),
    },
    {
      name: "Fall 2028",
      startDate: new Date("2028-08-15"),
      endDate: new Date("2028-12-20"),
    },
  ];

  const semesters = await Promise.all(
    semesterData.map((s) => prisma.semester.create({ data: s })),
  );
  console.log(`Created ${semesters.length} semesters`);

  // ─── 7. CourseOnSemester ─────────────────────────────────────
  // Time format: minutes from midnight (backend DTO). 8:00=480, 10:00=600, 12:00=720, 14:00=840, 16:00=960
  // Spread lecturers to avoid same-day conflicts: each lecturer gets different day/time slots
  const timeSlots = [
    { start: timeToMinutes(8, 0), end: timeToMinutes(10, 0) },
    { start: timeToMinutes(10, 0), end: timeToMinutes(12, 0) },
    { start: timeToMinutes(13, 0), end: timeToMinutes(15, 0) },
    { start: timeToMinutes(15, 0), end: timeToMinutes(17, 0) },
  ];

  const courseOnSemesterRecords: Array<{
    courseId: string;
    semesterId: string;
    lecturerId: string | null;
    location: string;
    dayOfWeek: number;
    startTime: number;
    endTime: number;
    capacity: number;
  }> = [];

  for (let semIdx = 0; semIdx < 2; semIdx++) {
    const isFall2025 = semIdx === 1;
    courses.forEach((course, courseIdx) => {
      const lecturerIdx = courseIdx % lecturers.length;
      const slotIdx = courseIdx % timeSlots.length;
      const dayIdx = Math.floor(courseIdx / timeSlots.length) % 5;
      const slot = timeSlots[slotIdx];
      const noLecturer = isFall2025 && courseIdx < 5;
      courseOnSemesterRecords.push({
        courseId: course.id,
        semesterId: semesters[semIdx].id,
        lecturerId: noLecturer ? null : lecturers[lecturerIdx].id,
        location: noLecturer
          ? `Room TBA-${courseIdx + 1}`
          : `Room ${String.fromCharCode(65 + (courseIdx % 5))}${100 + (courseIdx % 20)}`,
        dayOfWeek: dayIdx + 1,
        startTime: slot.start,
        endTime: slot.end,
        capacity: 40,
      });
    });
  }

  const fall2025Semester = semesters[1];

  const courseOnSemesters = await Promise.all(
    courseOnSemesterRecords.map((cos) =>
      prisma.courseOnSemester.create({ data: cos }),
    ),
  );
  console.log(`Created ${courseOnSemesters.length} course-on-semester records`);

  // ─── 8. Student Enrollments (Spring 2025) ─────────────────────
  const spring2025CoS = courseOnSemesters.filter(
    (cos) => cos.semesterId === semesters[0].id,
  );

  const cosByDept = new Map<string, typeof spring2025CoS>();
  for (const cos of spring2025CoS) {
    const course = courses.find((c) => c.id === cos.courseId);
    if (course?.departmentId) {
      const existing = cosByDept.get(course.departmentId) ?? [];
      existing.push(cos);
      cosByDept.set(course.departmentId, existing);
    }
  }

  const enrollmentRecords: Array<{
    studentId: string;
    courseOnSemesterId: string;
    gradeType1?: number | null;
    gradeType2?: number | null;
    gradeType3?: number | null;
    finalGrade?: number | null;
  }> = [];

  for (const student of students) {
    const deptCourses = cosByDept.get(student.departmentId) ?? [];
    const studentIdx = students.indexOf(student);
    const offset = studentIdx % Math.max(1, deptCourses.length - 2);
    const toEnroll = deptCourses.slice(offset, offset + 3);
    for (let i = 0; i < toEnroll.length; i++) {
      const cos = toEnroll[i];
      const hasGrades = i < 2 && studentIdx % 2 === 0;
      enrollmentRecords.push({
        studentId: student.id,
        courseOnSemesterId: cos.id,
        ...(hasGrades && {
          gradeType1: 7 + (studentIdx % 3) * 0.5,
          gradeType2: 8 + (studentIdx % 2) * 0.5,
          gradeType3: 7.5,
          finalGrade: 7.5 + (studentIdx % 2) * 0.5,
        }),
      });
    }
  }

  const enrollments = await Promise.all(
    enrollmentRecords.map((e) =>
      prisma.studentCourseEnrollment.create({
        data: {
          studentId: e.studentId,
          courseOnSemesterId: e.courseOnSemesterId,
          gradeType1: e.gradeType1,
          gradeType2: e.gradeType2,
          gradeType3: e.gradeType3,
          finalGrade: e.finalGrade,
        },
      }),
    ),
  );
  console.log(`Created ${enrollments.length} student enrollments`);

  // ─── 9. Lecturer Teaching Requests ───────────────────────────
  const unassignedFall2025 = courseOnSemesters.filter(
    (cos) => cos.semesterId === fall2025Semester.id && cos.lecturerId === null,
  );
  const teachingRequestStatuses = ["PENDING", "PENDING", "REJECTED"] as const;
  const teachingRequests = await Promise.all(
    unassignedFall2025.slice(0, 3).map((cos, i) =>
      prisma.lecturerTeachingRequest.create({
        data: {
          lecturerId: lecturers[i % lecturers.length].id,
          courseOnSemesterId: cos.id,
          status: teachingRequestStatuses[i],
        },
      }),
    ),
  );
  console.log(`Created ${teachingRequests.length} lecturer teaching requests`);

  // ─── 10. Course Documents ────────────────────────────────────
  const docPath = (cosId: string, suffix: string) =>
    `seed/docs/${cosId}-${suffix}.pdf`;
  const spring2025WithLecturer = spring2025CoS.filter((cos) => cos.lecturerId);
  const docRecords = spring2025WithLecturer.slice(0, 10).flatMap((cos, idx) => [
    {
      courseOnSemesterId: cos.id,
      title: "Course Syllabus",
      path: docPath(cos.id, `syllabus-${idx}`),
      url: "https://example.edu/syllabus.pdf",
    },
    {
      courseOnSemesterId: cos.id,
      title: "Lecture Notes - Week 1",
      path: docPath(cos.id, `lecture1-${idx}`),
      url: null,
    },
  ]);

  const courseDocuments = await Promise.all(
    docRecords.map((d) => prisma.courseDocument.create({ data: d })),
  );
  console.log(`Created ${courseDocuments.length} course documents`);

  // ─── 11. Exam Schedules ──────────────────────────────────────
  const examRecords = spring2025CoS.slice(0, 15).map((cos) => ({
    courseOnSemesterId: cos.id,
    examDate: "2025-05-15",
    startTime: new Date("2025-05-15T08:00:00Z"),
    endTime: new Date("2025-05-15T10:00:00Z"),
    location: "Exam Hall A",
    description: "Final examination",
  }));

  const examSchedules = await Promise.all(
    examRecords.map((e) => prisma.examSchedule.create({ data: e })),
  );
  console.log(`Created ${examSchedules.length} exam schedules`);

  // ─── 12. Enrollment Sessions ─────────────────────────────────
  const enrollmentSessions = await Promise.all(
    semesters.slice(0, 2).map((sem, i) =>
      prisma.enrollmentSession.create({
        data: {
          name: `Enrollment ${sem.name}`,
          semesterId: sem.id,
          startDate: new Date(
            sem.startDate.getTime() - 30 * 24 * 60 * 60 * 1000,
          ),
          endDate: new Date(sem.startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
          isActive: i === 0,
        },
      }),
    ),
  );
  console.log(`Created ${enrollmentSessions.length} enrollment sessions`);

  // ─── 13. Notifications ───────────────────────────────────────
  const notificationData = [
    ...students.slice(0, 5).map((s) => ({
      title: "Welcome to the University",
      message: `Hello ${s.fullName}, welcome to the new semester!`,
      studentId: s.id,
      type: "INFO" as const,
    })),
    ...lecturers.map((l) => ({
      title: "Teaching Schedule Published",
      message: `Dear ${l.fullName}, your teaching schedule for Spring 2025 is now available.`,
      lecturerId: l.id,
      type: "INFO" as const,
    })),
    ...students.slice(5, 8).map((s) => ({
      title: "Grade Posted",
      message: `Your grades for Spring 2025 have been updated.`,
      studentId: s.id,
      type: "INFO" as const,
    })),
  ];

  const notifications = await Promise.all(
    notificationData.map((n) => prisma.notification.create({ data: n })),
  );
  console.log(`Created ${notifications.length} notifications`);

  // ─── 14. Posts ───────────────────────────────────────────────
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "Welcome to Spring 2025 Semester",
        content:
          "We are excited to welcome all students and staff to the new semester. Please check your schedules and course registrations.",
        type: "ANNOUNCEMENT",
        adminId: admin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "Campus Library Hours Extended",
        content:
          "The campus library will now be open from 7:00 AM to 11:00 PM on weekdays during the semester.",
        type: "NEWS",
        adminId: admin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "CS Department: Hackathon 2025",
        content:
          "The Computer Science department is hosting its annual hackathon. Register now at the CS office.",
        type: "NEWS",
        adminId: admin.id,
        departmentId: departments[0].id,
      },
    }),
  ]);
  console.log(`Created ${posts.length} posts`);

  // ─── Summary ────────────────────────────────────────────────
  console.log("\nSeed Summary:");
  console.log(`   Admin:                 1`);
  console.log(`   Lecturers:             ${lecturers.length}`);
  console.log(`   Departments:           ${departments.length}`);
  console.log(`   Students:              ${students.length}`);
  console.log(`   Courses:               ${courses.length}`);
  console.log(`   Semesters:             ${semesters.length}`);
  console.log(`   CourseOnSemesters:     ${courseOnSemesters.length}`);
  console.log(`   Enrollments:           ${enrollments.length}`);
  console.log(`   LecturerTeachRequests:  ${teachingRequests.length}`);
  console.log(`   CourseDocuments:       ${courseDocuments.length}`);
  console.log(`   ExamSchedules:         ${examSchedules.length}`);
  console.log(`   EnrollmentSessions:    ${enrollmentSessions.length}`);
  console.log(`   Notifications:         ${notifications.length}`);
  console.log(`   Posts:                 ${posts.length}`);
  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
