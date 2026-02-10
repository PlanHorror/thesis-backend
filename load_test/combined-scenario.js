import { check, sleep } from 'k6';
import http from 'k6/http';
import { Trend, Rate } from 'k6/metrics';
import {
  BASE_URL,
  STUDENT_CREDENTIALS,
  LECTURER_CREDENTIALS,
  THRESHOLDS,
} from './config.js';
import { loginStudent, loginLecturer, authHeaders } from './helpers.js';

// ── Custom metrics ──────────────────────────────────────────
const studentNotiDur = new Trend('student_notifications_duration', true);
const studentCourseDur = new Trend('student_courses_duration', true);
const studentSemDur = new Trend('student_semesters_duration', true);
const lecturerCourseDur = new Trend('lecturer_courses_duration', true);
const lecturerSemDur = new Trend('lecturer_semesters_duration', true);
const failRate = new Rate('scenario_fail_rate');

// ── k6 options: two scenarios run concurrently ──────────────
export const options = {
  scenarios: {
    student_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 15 }, // ramp up
        { duration: '1m', target: 35 }, // ramp to 35
        { duration: '3m', target: 35 }, // hold at 35
        { duration: '1m', target: 65 }, // push to 65
        { duration: '3m', target: 65 }, // hold at 65
        { duration: '1m', target: 0 }, // ramp down
      ],
      exec: 'studentFlow',
      tags: { scenario: 'student' },
    },
    lecturer_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 }, // ramp up
        { duration: '1m', target: 20 }, // ramp to 20
        { duration: '3m', target: 20 }, // hold at 20
        { duration: '1m', target: 35 }, // push to 35
        { duration: '3m', target: 35 }, // hold at 35
        { duration: '1m', target: 0 }, // ramp down
      ],
      exec: 'lecturerFlow',
      tags: { scenario: 'lecturer' },
    },
  },
  thresholds: {
    ...THRESHOLDS,
    student_notifications_duration: ['p(95)<2000'],
    student_courses_duration: ['p(95)<2000'],
    student_semesters_duration: ['p(95)<2000'],
    lecturer_courses_duration: ['p(95)<2000'],
    lecturer_semesters_duration: ['p(95)<2000'],
    scenario_fail_rate: ['rate<0.05'],
  },
};

// ── Setup: login both roles, share tokens ───────────────────
export function setup() {
  const studentToken = loginStudent(STUDENT_CREDENTIALS);
  const lecturerToken = loginLecturer(LECTURER_CREDENTIALS);

  if (!studentToken) throw new Error('Student login failed — aborting');
  if (!lecturerToken) throw new Error('Lecturer login failed — aborting');

  return { studentToken, lecturerToken };
}

// ── Student flow ────────────────────────────────────────────
export function studentFlow(data) {
  const params = authHeaders(data.studentToken);
  let passed = true;

  // Get all notifications
  {
    const res = http.get(`${BASE_URL}/notification/student/all`, {
      ...params,
      tags: { name: 'StudentNotifications' },
    });
    studentNotiDur.add(res.timings.duration);
    if (!check(res, { 'notifications 200': (r) => r.status === 200 }))
      passed = false;
  }

  sleep(1);

  // Get all courses
  {
    const res = http.get(`${BASE_URL}/course/all`, {
      ...params,
      tags: { name: 'StudentCourses' },
    });
    studentCourseDur.add(res.timings.duration);
    if (!check(res, { 'courses 200': (r) => r.status === 200 })) passed = false;
  }

  sleep(1);

  // Get all semesters
  {
    const res = http.get(`${BASE_URL}/semester/all`, {
      ...params,
      tags: { name: 'StudentSemesters' },
    });
    studentSemDur.add(res.timings.duration);
    if (!check(res, { 'semesters 200': (r) => r.status === 200 }))
      passed = false;
  }

  failRate.add(!passed);
  sleep(1);
}

// ── Lecturer flow ───────────────────────────────────────────
export function lecturerFlow(data) {
  const params = authHeaders(data.lecturerToken);
  let passed = true;

  // Get all courses
  {
    const res = http.get(`${BASE_URL}/course/all`, {
      ...params,
      tags: { name: 'LecturerCourses' },
    });
    lecturerCourseDur.add(res.timings.duration);
    if (!check(res, { 'courses 200': (r) => r.status === 200 })) passed = false;
  }

  sleep(1);

  // Get all semesters
  {
    const res = http.get(`${BASE_URL}/semester/all`, {
      ...params,
      tags: { name: 'LecturerSemesters' },
    });
    lecturerSemDur.add(res.timings.duration);
    if (!check(res, { 'semesters 200': (r) => r.status === 200 }))
      passed = false;
  }

  failRate.add(!passed);
  sleep(1);
}
