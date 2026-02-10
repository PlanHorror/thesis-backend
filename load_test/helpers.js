import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './config.js';

/**
 * Login as student and return the access token.
 * @param {object} credentials - { studentId, password } or { username, password }
 * @returns {string} JWT access token
 */
export function loginStudent(credentials) {
  const res = http.post(
    `${BASE_URL}/auth/student/signin`,
    JSON.stringify(credentials),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'StudentLogin' },
    },
  );

  const ok = check(res, {
    'student login status 200/201': (r) => r.status === 200 || r.status === 201,
    'student login has accessToken': (r) => {
      try {
        return !!JSON.parse(r.body).accessToken;
      } catch {
        return false;
      }
    },
  });

  if (!ok) {
    console.error(`Student login failed: ${res.status} ${res.body}`);
    return null;
  }

  return JSON.parse(res.body).accessToken;
}

/**
 * Login as lecturer and return the access token.
 * @param {object} credentials - { lecturerId, password } or { username, password }
 * @returns {string} JWT access token
 */
export function loginLecturer(credentials) {
  const res = http.post(
    `${BASE_URL}/auth/lecturer/signin`,
    JSON.stringify(credentials),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'LecturerLogin' },
    },
  );

  const ok = check(res, {
    'lecturer login status 200/201': (r) =>
      r.status === 200 || r.status === 201,
    'lecturer login has accessToken': (r) => {
      try {
        return !!JSON.parse(r.body).accessToken;
      } catch {
        return false;
      }
    },
  });

  if (!ok) {
    console.error(`Lecturer login failed: ${res.status} ${res.body}`);
    return null;
  }

  return JSON.parse(res.body).accessToken;
}

/**
 * Build request params with accessToken cookie.
 * @param {string} token
 * @returns {object} request params with headers and cookies
 */
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `accessToken=${token}`,
    },
  };
}
