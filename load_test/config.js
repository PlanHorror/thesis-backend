// Load test configuration
// Update BASE_URL to match your deployment target

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';

// Test user credentials — update these to match real users in your DB
export const STUDENT_CREDENTIALS = {
  studentId: __ENV.STUDENT_ID || 'STU-CS-003',
  password: __ENV.STUDENT_PASSWORD || 'student123',
};
// export const STUDENT_CREDENTIALS = {
//   studentId: __ENV.STUDENT_ID || 'STU-2026-009',
//   password: __ENV.STUDENT_PASSWORD || 'SecurePass123!',
// };

export const LECTURER_CREDENTIALS = {
  lecturerId: __ENV.LECTURER_ID || 'LEC-001',
  password: __ENV.LECTURER_PASSWORD || 'lecturer123',
};
// export const LECTURER_CREDENTIALS = {
//   lecturerId: __ENV.LECTURER_ID || 'LEC-001',
//   password: __ENV.LECTURER_PASSWORD || 'SecurePass123!',
// };

// Thresholds (pass/fail criteria)
export const THRESHOLDS = {
  http_req_duration: ['p(95)<2000'], // 95% of requests < 2s
  http_req_failed: ['rate<0.05'], // < 5% failure rate
};

// Load stages for ramping VUs
export const STAGES = {
  smoke: [
    { duration: '10s', target: 1 }, // 1 user for 10s
  ],
  load: [
    { duration: '30s', target: 10 }, // ramp up to 10 users
    { duration: '1m', target: 10 }, // hold at 10
    { duration: '30s', target: 0 }, // ramp down
  ],
  stress: [
    { duration: '30s', target: 20 }, // ramp up
    { duration: '1m', target: 50 }, // push to 50
    { duration: '2m', target: 50 }, // hold
    { duration: '30s', target: 0 }, // ramp down
  ],
  spike: [
    { duration: '10s', target: 5 }, // warm up
    { duration: '5s', target: 100 }, // spike!
    { duration: '30s', target: 100 }, // hold spike
    { duration: '10s', target: 5 }, // recover
    { duration: '30s', target: 0 }, // ramp down
  ],
};
