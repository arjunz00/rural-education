# 🌾 GramShiksha: Rural Education Remote Monitoring & Early Intervention System (MERN Stack)

A production-grade, low-bandwidth optimized **Rural Education Remote Monitoring & Early Intervention System** built with the **MERN (MongoDB, Express.js, React 19, Node.js)** technology stack.

Designed specifically for semi-rural and tribal block schooling clusters (such as Zilla Parishad schools in Maharashtra), this application prevents student learning loss through algorithmic early dropout detection, daily roll call monitoring, and proactive teacher-parent interventions while enforcing **cryptographic student data privacy boundaries**.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------------+
                                  |   React 19 + Vite Frontend SPA (90 KB gzip) |
                                  |   High-Contrast Rural UI, Offline Mode      |
                                  +----------------------+----------------------+
                                                         | (JWT Bearer Token / API)
                                                         v
                                  +---------------------------------------------+
                                  |    Express.js Node.js (v24) REST Backend    |
                                  |    - Low-Bandwidth Tracker & Headers        |
                                  |    - authenticateToken Middleware           |
                                  |    - authorizeStudentScope Privacy Guard    |
                                  +----------------------+----------------------+
                                                         |
                                                         v
                                  +---------------------------------------------+
                                  |       MongoDB (Mongoose ODM 8)              |
                                  |       Compound Indexes & Aggregations       |
                                  +---------------------------------------------+
```

---

## 🔒 Strict User Data Privacy & Role-Based Access Control (RBAC)

> **CRITICAL PRIVACY BOUNDARY**: Transparent data access across families is strictly forbidden. The system enforces zero-trust data scoping at both the Express API middleware level and the React UI routing level.

### The 5 User Personas & Permissions:

| Persona | Role | Default Username | Default Password | Scoped Data & Privacy Boundary |
| :--- | :--- | :--- | :--- | :--- |
| 👨‍🏫 **Class Teacher** | `teacher` | `teacher` | `password123` | Assigned class & school students. Can perform daily roll call, grade CCE ledger, and record home visits/calls. |
| 🏫 **Headmaster** | `headmaster` | `headmaster` | `password123` | School-wide student records, attendance trends, chronic dropout warning lists, review teacher outreach, export CSV audit reports. |
| 🏛️ **Block Officer (BEO)** | `admin` | `admin` | `password123` | Cluster oversight across 4 village schools, Right to Education (RTE) statutory compliance monitoring. |
| 👨‍👩‍👧 **Parent / Guardian** | `parent` | `parent` | `password123` | **STRICTLY LOCKED TO LINKED CHILD ONLY (Asha Jadhav #1).** Viewing another child's ID via API or URL returns `403 Forbidden`. Read-only. |
| 🎓 **Student / Learner** | `student` | `student` | `password123` | **STRICTLY LOCKED TO OWN LEARNER FILE (Asha Jadhav #1).** Daily streak tracker, grades, teacher advice, and offline audio study packets. |

---

## ⚙️ Technology Stack

- **Database:** MongoDB 7/8 with Mongoose ODM.
  - Compound unique index: `{ studentId: 1, attendanceDate: 1 }` prevents duplicate daily roll calls.
  - Indexes on `studentId`, `attendanceDate`, `username`, `email`.
  - Mongoose aggregation pipelines for school-wide attendance rates and subject averages.
- **Backend API:** Node.js v24+ with Express.js (ES modules).
  - JWT authentication (`jsonwebtoken`, `bcryptjs`).
  - Strict privacy middleware (`authorizeStudentScope`) preventing horizontal privilege escalation.
  - Low-bandwidth diagnostic headers (`X-Low-Bandwidth-Ready`, `X-Payload-Bytes`).
  - Built-in test runner (`node:test`) and Supertest.
- **Frontend Web:** React 19 + Vite.
  - Functional components with React Hooks (`useState`, `useEffect`, `useContext`).
  - Zero heavy charting dependencies — clean responsive SVG gauges and charts for low data usage.
  - Dedicated Multi-Role Login interface with **1-Click Fast Sign In ⚡** buttons.
  - Dedicated Parent & Student Safe Portal (`ParentStudentPortal.jsx`) with Printable Official CCE Marksheet modal (`@media print` formatted).
  - Access Denied screen (`PrivacyGuard.jsx`): *"🔒 Student Data Privacy Protection"*.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20 or higher (`node -v`)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or configured via `server/.env`

### 2. Install All Dependencies
```bash
npm run install:all
```
*(Or install in root, server, and client separately)*

### 3. Seed Database with Realistic Demo Personas
Populates MongoDB with 5 persona accounts, 5 students, 50 attendance records, 15 CCE subject grades, 3 teacher interventions, and 4 low-bandwidth offline learning resources:
```bash
npm run seed
```

### 4. Run Automated Backend & Privacy Tests
Runs 18 automated integration and privacy boundary tests:
```bash
npm test
```

### 5. Launch Full Stack Development Servers
Starts the backend Express server on `http://localhost:5000` and the Vite React frontend on `http://localhost:5173`:
```bash
npm run dev
```
- **Web Application:** [http://localhost:5173](http://localhost:5173)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 REST API Specification

### Authentication
- `POST /api/auth/login` — Sign in with username/email & password. Returns JWT token and user profile.
- `GET /api/auth/me` — Return current authenticated profile.
- `POST /api/auth/logout` — End session.
- `GET /api/auth/demo-accounts` — Safe list of demo personas and designations.

### Students
- `GET /api/students` — Staff receives all school students; Parent/Student receives strictly their linked record (`count: 1`).
- `GET /api/students/:id` — Returns student dossier. **Returns 403 Forbidden if Parent/Student requests an unauthorized ID.**
- `POST /api/students` — Create new student (Staff only, 403 for Parent/Student).
- `PATCH /api/students/:id` — Update student profile (Staff only).
- `GET /api/students/:id/attendance` — Attendance history and streak (Privacy protected).
- `GET /api/students/:id/academic` — CCE Unit Test marksheet (Privacy protected).
- `GET /api/students/:id/interventions` — Teacher outreach log (Privacy protected).

### Attendance & Roll Call
- `GET /api/attendance` — Filter by date, date range. Scoped for Parent/Student.
- `GET /api/attendance/summary` — School-wide attendance overview (Staff only).
- `GET /api/attendance/analytics` — Attendance trends and streak metrics.
- `POST /api/attendance` — Single student roll call record (Staff only).
- `POST /api/attendance/bulk` — Daily matrix roll call batch save (Staff only).

### Early Warning & Risk Engine
- `GET /api/risk/assessments` — Evaluates students based on:
  - Minimum observation window (10 days).
  - Attendance rate (< 60% = High Risk, < 75% = Medium Risk).
  - Consecutive unexcused absences (3+ days = Critical Alert).
  - Trend detection (sharp drop vs. steady vs. improving).
  - Academic correlation factor (CCE exam failure).
  - **Privacy:** Returns only the linked child's risk status for Parent/Student.

### Interventions & Outreach
- `GET /api/interventions` — Active & resolved interventions list (Scoped).
- `POST /api/interventions` — Log home visit, phone call, or counseling (Staff only).
- `PATCH /api/interventions/:id` — Update status, compute post-attendance outcome (% delta).

### Learning Resources & Health
- `GET /api/resources` — Offline audio capsules and text cheat sheets with download sizes.
- `GET /api/health` — Returns `{ status: "ok", stack: "MERN", lowBandwidthReady: true }`.

---

## 🧪 Automated Privacy Verification Results

```
✔ ⚡ [HEALTH] GET /api/health returns status ok and stack MERN
✔ ⚡ [AUTH] Invalid login returns 401 Unauthorized
✔ ⚡ [AUTH] Protected route without token returns 401
✔ ⚡ [AUTH] GET /api/auth/me with valid token returns current profile
✔ ⚡ [RISK ENGINE] Accurately detects High Risk and Critical Alert for Rohan Pawar (#2)
✔ ⚡ [ATTENDANCE] Teacher can submit bulk daily roll call
✔ ⚡ [ATTENDANCE SUMMARY] Headmaster can view school-wide attendance summary
✔ ⚡ [ACADEMIC] Teacher can view subject averages across school
✔ 🔒 [PRIVACY] Parent can access their OWN child's record (studentId: 1)
✔ 🔒 [PRIVACY] Parent requesting ANOTHER student's record (studentId: 2) MUST return 403 Forbidden
✔ 🔒 [PRIVACY] Parent requesting another student's attendance (/api/students/2/attendance) MUST return 403 Forbidden
✔ 🔒 [PRIVACY] Parent requesting another student's academic marks (/api/students/2/academic) MUST return 403 Forbidden
✔ 🔒 [PRIVACY] Parent requesting another student's interventions (/api/students/2/interventions) MUST return 403 Forbidden
✔ 🔒 [PRIVACY] Student requesting ANOTHER student's record (studentId: 3) MUST return 403 Forbidden
✔ 🔒 [PRIVACY] Parent GET /api/students returns ONLY their linked student record
✔ 🔒 [PRIVACY] Parent GET /api/risk/assessments returns ONLY their child's assessment
✔ 🔒 [PRIVACY] Parent attempting to mark roll call POST /api/attendance MUST return 403 Forbidden
✔ 🔒 [PRIVACY] Teacher (Staff) can access full student list and all records

Total: 18 passed, 0 failed. Duration: ~4.6s
```

---

## 📄 License
MIT License. Developed for rural education upliftment and institutional Right to Education (RTE) compliance.
