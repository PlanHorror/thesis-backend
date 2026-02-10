# k6 Load Tests

Load tests for the thesis-backend API using [k6](https://k6.io/).

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Files

| File                   | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `config.js`            | Shared config (base URL, credentials, stages)           |
| `helpers.js`           | Login helpers and auth header builder                   |
| `student-scenario.js`  | Student flow: login → notifications, courses, semesters |
| `lecturer-scenario.js` | Lecturer flow: login → courses, semesters               |
| `combined-scenario.js` | Both scenarios running concurrently                     |

## Usage

### Run individual scenarios

```bash
# Student scenario (smoke test)
k6 run -e PROFILE=smoke -e BASE_URL=http://localhost:3000/api load_test/student-scenario.js

# Lecturer scenario (load test)
k6 run -e PROFILE=load -e BASE_URL=http://localhost:3000/api load_test/lecturer-scenario.js
```

### Run combined (both roles concurrently)

```bash
k6 run -e BASE_URL=http://localhost:3000/api load_test/combined-scenario.js
```

### Against AWS deployment

```bash
k6 run -e BASE_URL=http://<ALB_HOSTNAME>/api load_test/combined-scenario.js
```

### Custom credentials

```bash
k6 run \
  -e BASE_URL=http://localhost:3000/api \
  -e STUDENT_ID=STU001 \
  -e STUDENT_PASSWORD=password123 \
  -e LECTURER_ID=LEC001 \
  -e LECTURER_PASSWORD=password123 \
  load_test/combined-scenario.js
```

## Test Profiles

Set via `-e PROFILE=<name>` (for individual scenarios only):

| Profile  | Description                        |
| -------- | ---------------------------------- |
| `smoke`  | 1 VU for 10s — verify scripts work |
| `load`   | Ramp to 10 VUs, hold 1m, ramp down |
| `stress` | Ramp to 50 VUs, hold 2m, ramp down |
| `spike`  | Spike to 100 VUs then recover      |

## Thresholds

- 95th percentile response time < 2s
- Error rate < 5%
