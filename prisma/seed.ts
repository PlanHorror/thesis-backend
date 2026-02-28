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

async function seedAdditional2026And2027Offerings() {
  console.log(
    "Seeding additional 2026–2027 course offerings without wiping existing data...",
  );

  const courses = await prisma.course.findMany();
  const lecturers = await prisma.lecturer.findMany();

  if (courses.length === 0 || lecturers.length === 0) {
    console.log(
      "No existing courses or lecturers found. Run the full seed (without APPEND_2026_2027) first.",
    );
    return;
  }

  // Ensure target semesters exist (Spring/Fall 2026 & 2027)
  const targetSemestersInput = [
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
  ];

  const targetSemesters: { id: string }[] = [];
  for (const sem of targetSemestersInput) {
    const existing = await prisma.semester.findUnique({
      where: { name: sem.name },
    });
    if (existing) {
      targetSemesters.push(existing);
    } else {
      const created = await prisma.semester.create({ data: sem });
      targetSemesters.push(created);
    }
  }

  // Ensure there is an active enrollment session covering "now"
  // for each of these semesters, so students can enroll for mock tests.
  for (const sem of targetSemesters) {
    const existingSession = await prisma.enrollmentSession.findFirst({
      where: { semesterId: sem.id, isActive: true },
    });
    if (!existingSession) {
      await prisma.enrollmentSession.create({
        data: {
          semester: { connect: { id: sem.id } },
          name: "Mock Open Enrollment",
          // Wide window so it's always valid during development/testing
          startDate: new Date("2025-01-01"),
          endDate: new Date("2030-12-31"),
          isActive: true,
        },
      });
    }
  }

  // Same time slots logic as main seed
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

  for (const sem of targetSemesters) {
    courses.forEach((course, courseIdx) => {
      const lecturerIdx = courseIdx % lecturers.length;
      const slotIdx = courseIdx % timeSlots.length;
      const dayIdx = Math.floor(courseIdx / timeSlots.length) % 5;
      const slot = timeSlots[slotIdx];

      courseOnSemesterRecords.push({
        courseId: course.id,
        semesterId: sem.id,
        lecturerId: lecturers[lecturerIdx].id,
        location: `Room ${String.fromCharCode(65 + (courseIdx % 5))}${200 + (courseIdx % 20)}`,
        dayOfWeek: dayIdx + 1,
        startTime: slot.start,
        endTime: slot.end,
        capacity: 50,
      });
    });
  }

  // Use createMany with skipDuplicates: respects @@unique([courseId, semesterId])
  await prisma.courseOnSemester.createMany({
    data: courseOnSemesterRecords,
    skipDuplicates: true,
  });

  console.log(
    `Ensured offerings for ${courses.length} courses across ${targetSemesters.length} semesters (2026–2027).`,
  );
}

async function main() {
  const appendOnly = process.env.APPEND_2026_2027 === "true";

  if (appendOnly) {
    await seedAdditional2026And2027Offerings();
    return;
  }

  console.log("Starting full seed (will wipe existing data)...");

  // Clean up existing data (reverse dependency order)
  await prisma.webhookLog.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.profileUpdateRequest.deleteMany();
  await prisma.courseWithdrawalRequest.deleteMany();
  await prisma.scheduleChange.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.courseDocument.deleteMany();
  await prisma.studentCourseEnrollment.deleteMany();
  await prisma.lecturerTeachingRequest.deleteMany();
  await prisma.enrollmentSession.deleteMany();
  await prisma.courseOnSemester.deleteMany();
  await prisma.course.deleteMany();
  await prisma.post.deleteMany();
  await prisma.student.deleteMany();
  await prisma.department.deleteMany();
  await prisma.lecturer.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.supportRequest.deleteMany();

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
      gender: true,
      birthDate: "1985-03-15",
      citizenId: "001085012345",
      phone: "+84901234501",
      address: "10 Faculty Lane, Campus",
    },
    {
      lecturerId: "LEC002",
      username: "tranthib",
      email: "tranthib@university.edu",
      fullName: "Tran Thi B",
      gender: false,
      birthDate: "1988-07-22",
      citizenId: "001088076543",
      phone: "+84901234502",
      address: "12 Faculty Lane, Campus",
    },
    {
      lecturerId: "LEC003",
      username: "levanc",
      email: "levanc@university.edu",
      fullName: "Le Van C",
      gender: true,
      birthDate: "1982-11-08",
      citizenId: "001082098765",
      phone: "+84901234503",
      address: null,
    },
    {
      lecturerId: "LEC004",
      username: "phamthid",
      email: "phamthid@university.edu",
      fullName: "Pham Thi D",
      gender: false,
      birthDate: "1990-01-30",
      citizenId: "001090045678",
      phone: "+84901234504",
      address: "14 Faculty Lane, Campus",
    },
    {
      lecturerId: "LEC005",
      username: "hoangvane",
      email: "hoangvane@university.edu",
      fullName: "Hoang Van E",
      gender: true,
      birthDate: "1986-09-12",
      citizenId: "001086056789",
      phone: "+84901234505",
      address: null,
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

  type ScheduleMode = "ONLINE" | "ON_CAMPUS" | "HYBRID";
  const courseOnSemesterRecords: Array<{
    courseId: string;
    semesterId: string;
    lecturerId: string | null;
    location: string | null;
    meetingUrl: string | null;
    mode: ScheduleMode;
    dayOfWeek: number;
    startTime: number;
    endTime: number;
    capacity: number;
  }> = [];

  for (let semIdx = 0; semIdx < 3; semIdx++) {
    const isFall2025 = semIdx === 1;
    courses.forEach((course, courseIdx) => {
      const lecturerIdx = courseIdx % lecturers.length;
      const slotIdx = courseIdx % timeSlots.length;
      const dayIdx = Math.floor(courseIdx / timeSlots.length) % 5;
      const slot = timeSlots[slotIdx];
      const noLecturer = isFall2025 && courseIdx < 5;
      const mode: ScheduleMode =
        courseIdx % 5 === 0
          ? "ONLINE"
          : courseIdx % 5 === 1
            ? "HYBRID"
            : "ON_CAMPUS";
      const meetingUrl =
        mode === "ONLINE" || mode === "HYBRID"
          ? `https://meet.example.edu/${course.id.slice(-6)}`
          : null;
      courseOnSemesterRecords.push({
        courseId: course.id,
        semesterId: semesters[semIdx].id,
        lecturerId: noLecturer ? null : lecturers[lecturerIdx].id,
        location: noLecturer
          ? `Room TBA-${courseIdx + 1}`
          : mode === "ON_CAMPUS"
            ? `Room ${String.fromCharCode(65 + (courseIdx % 5))}${100 + (courseIdx % 20)}`
            : "Online",
        meetingUrl,
        mode,
        dayOfWeek: dayIdx + 1,
        startTime: slot.start,
        endTime: slot.end,
        capacity: 40,
      });
    });
  }

  const fall2025Semester = semesters[1];
  // const spring2026Semester = semesters[2];

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
    semesters.slice(0, 3).map((sem, i) =>
      prisma.enrollmentSession.create({
        data: {
          name: `Enrollment ${sem.name}`,
          semesterId: sem.id,
          startDate: new Date(
            sem.startDate.getTime() - 30 * 24 * 60 * 60 * 1000,
          ),
          endDate: new Date(sem.startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
          isActive: i === 2,
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

  // ─── 15. Profile Update Requests ───────────────────────────
  const profileUpdateRequests = await Promise.all([
    prisma.profileUpdateRequest.create({
      data: {
        userId: students[0].id,
        role: "student",
        requestedData: {
          fullName: "Student CS 001 Updated",
          phone: "+84900111000",
        },
        status: "PENDING",
      },
    }),
    prisma.profileUpdateRequest.create({
      data: {
        userId: students[2].id,
        role: "student",
        requestedData: { address: "456 New Street, District 2" },
        status: "APPROVED",
      },
    }),
    prisma.profileUpdateRequest.create({
      data: {
        userId: lecturers[1].id,
        role: "lecturer",
        requestedData: { fullName: "Dr. Tran Thi B", birthDate: "1988-07-22" },
        status: "PENDING",
      },
    }),
    prisma.profileUpdateRequest.create({
      data: {
        userId: students[5].id,
        role: "student",
        requestedData: { citizenId: "001099011111" },
        status: "REJECTED",
        rejectionReason: "Citizen ID must be verified by admin.",
      },
    }),
  ]);
  console.log(
    `Created ${profileUpdateRequests.length} profile update requests`,
  );

  // ─── 16. Course Withdrawal Requests ─────────────────────────
  const enrollmentsForWithdrawal = enrollments
    .filter((_, i) => i % 5 === 0)
    .slice(0, 4);
  const withdrawalStatuses: Array<"PENDING" | "APPROVED" | "REJECTED"> = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "PENDING",
  ];
  const courseWithdrawalRequests = await Promise.all(
    enrollmentsForWithdrawal.map((enr, i) =>
      prisma.courseWithdrawalRequest.create({
        data: {
          studentId: enr.studentId,
          courseOnSemesterId: enr.courseOnSemesterId,
          enrollmentId: enr.id,
          reason: i % 2 === 0 ? "schedule" : "workload",
          details: i === 0 ? "Conflict with part-time job." : null,
          status: withdrawalStatuses[i],
          rejectionReason:
            withdrawalStatuses[i] === "REJECTED"
              ? "Withdrawal period ended."
              : null,
        },
      }),
    ),
  );
  console.log(
    `Created ${courseWithdrawalRequests.length} course withdrawal requests`,
  );

  // ─── 17. Schedule Changes ────────────────────────────────────
  const cosForScheduleChange = courseOnSemesters.slice(0, 3);
  const scheduleChanges = await Promise.all(
    cosForScheduleChange.map((cos) =>
      prisma.scheduleChange.create({
        data: {
          courseOnSemesterId: cos.id,
          changedBy: "admin",
          changeType: "SCHEDULE_UPDATE",
          oldDayOfWeek: cos.dayOfWeek,
          newDayOfWeek: (cos.dayOfWeek ?? 1) + 1,
          oldStartTime: cos.startTime,
          newStartTime: (cos.startTime ?? 480) + 30,
          oldEndTime: cos.endTime,
          newEndTime: (cos.endTime ?? 600) + 30,
          oldLocation: cos.location,
          newLocation: `${cos.location ?? ""} (updated)`,
        },
      }),
    ),
  );
  console.log(`Created ${scheduleChanges.length} schedule changes`);

  // ─── 18. AI Conversations & Messages ────────────────────────
  const aiConv1 = await prisma.aiConversation.create({
    data: {
      studentId: students[0].id,
      title: "Schedule insights",
      preset: "schedule_insights",
    },
  });
  await prisma.aiMessage.createMany({
    data: [
      {
        conversationId: aiConv1.id,
        role: "user",
        content: "When is my next offline class?",
      },
      {
        conversationId: aiConv1.id,
        role: "model",
        content:
          "Based on your timetable, your next on-campus class is Database Systems on Tuesday 13:00–15:00 in Room B102.",
      },
    ],
  });

  const aiConv2 = await prisma.aiConversation.create({
    data: {
      lecturerId: lecturers[0].id,
      title: "General LMS help",
      preset: "general",
    },
  });
  await prisma.aiMessage.createMany({
    data: [
      {
        conversationId: aiConv2.id,
        role: "user",
        content: "How do I export my course grades?",
      },
      {
        conversationId: aiConv2.id,
        role: "model",
        content:
          "You can export grades from the course detail page using the Export or Download option in the grades section.",
      },
    ],
  });
  console.log("Created AI conversations and messages");

  // ─── 19. Support Requests ───────────────────────────────────
  const supportRequests = await Promise.all([
    prisma.supportRequest.create({
      data: {
        name: "Student CS 001",
        email: students[0].email,
        role: "student",
        category: "enrollment",
        subject: "Cannot enroll in Web Development",
        message: "I get an error when clicking Enroll for Spring 2026.",
        userId: students[0].id,
      },
    }),
    prisma.supportRequest.create({
      data: {
        name: "Tran Thi B",
        email: lecturers[1].email,
        role: "lecturer",
        category: "schedule",
        subject: "Room change request",
        message: "Please move my Tuesday class to Room D201 if available.",
        userId: lecturers[1].id,
      },
    }),
    prisma.supportRequest.create({
      data: {
        name: "Guest User",
        email: "guest@example.com",
        role: "other",
        category: "technical",
        subject: "Login page not loading",
        message: "The sign-in page shows a blank screen on Safari.",
        userId: null,
      },
    }),
    prisma.supportRequest.create({
      data: {
        name: "Student BA 026",
        email: students[students.length - 1].email,
        role: "student",
        category: "grades",
        subject: "Grade appeal",
        message:
          "I believe my final grade for Marketing Management should be reviewed.",
        userId: students[students.length - 1].id,
      },
    }),
  ]);
  console.log(`Created ${supportRequests.length} support requests`);

  // ─── 20. Webhooks & Webhook Logs ─────────────────────────────
  const webhook1 = await prisma.webhook.create({
    data: {
      url: "https://demo.example.com/webhooks/grades",
      secret: "whsec_demo_secret_1",
      isActive: true,
      studentId: students[0].id,
    },
  });
  const webhook2 = await prisma.webhook.create({
    data: {
      url: "https://demo.example.com/webhooks/notifications",
      isActive: true,
      lecturerId: lecturers[0].id,
    },
  });
  await prisma.webhookLog.createMany({
    data: [
      {
        webhookId: webhook1.id,
        event: "grade.updated",
        payload: { enrollmentId: enrollments[0].id, finalGrade: 8.0 },
        statusCode: 200,
        responseBody: "OK",
        duration: 45,
      },
      {
        webhookId: webhook2.id,
        event: "notification.created",
        payload: { title: "Schedule change", type: "WARNING" },
        statusCode: 200,
        duration: 32,
      },
    ],
  });
  console.log("Created webhooks and webhook logs");

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
  console.log(`   LecturerTeachRequests: ${teachingRequests.length}`);
  console.log(`   CourseDocuments:       ${courseDocuments.length}`);
  console.log(`   ExamSchedules:         ${examSchedules.length}`);
  console.log(`   EnrollmentSessions:    ${enrollmentSessions.length}`);
  console.log(`   Notifications:         ${notifications.length}`);
  console.log(`   Posts:                 ${posts.length}`);
  console.log(`   ProfileUpdateRequests: ${profileUpdateRequests.length}`);
  console.log(`   CourseWithdrawalReqs:  ${courseWithdrawalRequests.length}`);
  console.log(`   ScheduleChanges:      ${scheduleChanges.length}`);
  console.log(`   SupportRequests:      ${supportRequests.length}`);
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
