import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { BASE_URL, STUDENT_CREDENTIALS, THRESHOLDS, STAGES } from './config.js';
import { loginStudent, authHeaders } from './helpers.js';

// ── Custom metrics ──────────────────────────────────────────
const loginDuration = new Trend('student_login_duration', true);
const notificationsDur = new Trend('student_notifications_duration', true);
const coursesDuration = new Trend('student_courses_duration', true);
const semestersDuration = new Trend('student_semesters_duration', true);
const scenarioFailRate = new Rate('student_scenario_fail_rate');

// ── k6 options ──────────────────────────────────────────────
const testProfile = __ENV.PROFILE || 'load'; // smoke | load | stress | spike
export const options = {
  stages: STAGES[testProfile],
  thresholds: THRESHOLDS,
  tags: { scenario: 'student' },
};

// ── Setup: login once and share token across VUs (optional) ─
export function setup() {
  const token = loginStudent(STUDENT_CREDENTIALS);
  if (!token) {
    throw new Error('Student login failed during setup — aborting test');
  }
  return { token };
}

// ── Main scenario ───────────────────────────────────────────
export default function (data) {
  const params = authHeaders(data.token);
  let passed = true;

  // 1. Get all notifications
  {
    const res = http.get(`${BASE_URL}/notification/student/all`, {
      ...params,
      tags: { name: 'GetStudentNotifications' },
    });
    notificationsDur.add(res.timings.duration);
    const ok = check(res, {
      'notifications status 200': (r) => r.status === 200,
    });
    if (!ok) passed = false;
  }

  sleep(1); // simulate user think time

  // 2. Get all courses
  {
    const res = http.get(`${BASE_URL}/course/all`, {
      ...params,
      tags: { name: 'GetAllCourses' },
    });
    coursesDuration.add(res.timings.duration);
    const ok = check(res, {
      'courses status 200': (r) => r.status === 200,
    });
    if (!ok) passed = false;
  }

  sleep(1);

  // 3. Get all semesters
  {
    const res = http.get(`${BASE_URL}/semester/all`, {
      ...params,
      tags: { name: 'GetAllSemesters' },
    });
    semestersDuration.add(res.timings.duration);
    const ok = check(res, {
      'semesters status 200': (r) => r.status === 200,
    });
    if (!ok) passed = false;
  }

  scenarioFailRate.add(!passed);
  sleep(1);
}
