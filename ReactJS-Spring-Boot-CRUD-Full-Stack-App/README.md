# Employee Management & HR System

A full-stack Employee Management & HR System, built on top of a basic tutorial CRUD app and
incrementally hardened into something closer to a real, production-style application:
layered Spring Boot architecture, JWT authentication with role-based authorization, validation,
centralized error handling, pagination/search/filter, a live-data dashboard, and a React
frontend to match.

This started as a simple 3-field (first name, last name, email) tutorial CRUD project. Every
phase of the rebuild is documented in [CHANGELOG.md](./CHANGELOG.md) so the "before vs after"
is traceable.

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Architecture](#architecture)
6. [Project Structure](#project-structure)
7. [Database Design](#database-design)
8. [API Endpoints](#api-endpoints)
9. [Authentication](#authentication)
10. [Authorization](#authorization)
11. [Environment Variables](#environment-variables)
12. [Running the Backend](#running-the-backend)
13. [Running the Frontend](#running-the-frontend)
14. [Testing](#testing)
15. [Known Limitations](#known-limitations)
16. [Future Improvements](#future-improvements)

## Overview

An HR system for managing employees: CRUD, search/filter/pagination, department metadata,
dashboard statistics, and login with three roles (ADMIN, HR, EMPLOYEE) enforced on the backend,
not just hidden in the UI.

## Problem Statement

Small organizations often start HR record-keeping in spreadsheets. This project models the next
step: a real system with proper access control (not everyone should see salaries), data
integrity (no duplicate emails, no orphaned department references), and auditability
(who changed what, when).

## Features

- Employee CRUD with rich fields: department, designation, salary, employment type, status, dates, address
- Auto-generated, unique employee codes (`EMP-2026-A1B2C3D4`)
- Server-side pagination, sorting, free-text search, and multi-field filtering
- JWT authentication with BCrypt password hashing
- Role-based authorization (ADMIN / HR / EMPLOYEE) enforced on the backend via `@PreAuthorize`
- Self-service employee profile view (`/employees/me`)
- Department management with a real deletion guard (can't delete a department in use)
- Dashboard statistics computed live from the database — no hardcoded numbers
- Centralized validation and error handling with a consistent JSON error shape
- Swagger / OpenAPI documentation with a working "Authorize" button for JWTs
- A real test suite: service logic, Bean Validation, MockMvc + Spring Security, JWT correctness

## Technology Stack

**Backend:** Java 23, Spring Boot 3.0.4, Spring Data JPA / Hibernate, Spring Security, JWT (jjwt),
MySQL, Maven, springdoc-openapi (Swagger UI), JUnit 5, Mockito

**Frontend:** React 16 (functional components + hooks), React Router v6, Axios, Bootstrap 4,
Recharts

## Architecture

```
React (hooks, Router v6)
        |
        v
   Axios (JWT attached via interceptor)
        |
        v
   REST API (Spring Boot)
        |
        v
   Controller  --(HTTP concerns, @PreAuthorize)
        |
        v
   Service     --(business logic, transactions)
        |
        v
   Repository  --(Spring Data JPA)
        |
        v
   Hibernate / MySQL
```

A request that fails validation or hits a business rule is caught by a single
`@RestControllerAdvice` (`GlobalExceptionHandler`) and turned into a consistent JSON error body
— controllers and services never format error responses themselves.

## Project Structure

```
springboot-backend/
  src/main/java/net/javaguides/springboot/
    config/         SecurityConfig, CorsConfig, OpenApiConfig, AdminBootstrap
    controller/     HTTP layer only
    dto/            Request/response DTOs (never expose entities directly)
    entity/         JPA entities + enums subpackage
    exception/      Custom exceptions + GlobalExceptionHandler
    mapper/         Entity <-> DTO conversion
    repository/     Spring Data JPA repositories + Specifications support
    security/       JWT util, filter, UserDetails adapter
    service/        Business logic interfaces + impl
    specification/  Dynamic query building for search/filter
    util/           EmployeeCodeGenerator
  src/test/java/... mirrors the above for what's actually tested

react-frontend/
  src/
    api/            Configured Axios client + error-message helper
    context/        AuthContext (login state, token persistence)
    components/     Reusable UI: Navbar, Sidebar, EmployeeTable, EmployeeForm, etc.
    pages/          One file per route
    services/       One class per backend resource (Employee, Auth, Department, Dashboard)

DOCUMENTATION/
  INTERVIEW_GUIDE.md       Beginner-friendly explanation of the whole system
  INTERVIEW_QUESTIONS.md   50+ project-specific interview Q&A
```

## Database Design

Three tables, deliberately kept simple:

- **users** — authentication accounts (id, name, email, password [BCrypt hash], role, enabled, created_at)
- **employees** — HR records (id, employee_code, first_name, last_name, email, phone, dates,
  department, designation, salary, employment_type, status, address/city/country, created_at, updated_at)
- **departments** — HR-managed department metadata (id, name, description, created_at, updated_at)

`users` and `employees` are intentionally **not** linked by a foreign key — see
[Known Limitations](#known-limitations) for why, and how `/employees/me` bridges them anyway.

## API Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register (always creates an EMPLOYEE account) |
| POST | `/api/v1/auth/login` | Public | Log in, returns a JWT |
| GET | `/api/v1/employees` | ADMIN, HR | Paginated list (`page`, `size`, `sortBy`, `sortDirection`) |
| GET | `/api/v1/employees/search` | ADMIN, HR | Free-text search (`keyword`) |
| GET | `/api/v1/employees/filter` | ADMIN, HR | Filter by name/email/department/designation/status |
| GET | `/api/v1/employees/me` | Any authenticated user | Own employee profile |
| GET | `/api/v1/employees/{id}` | ADMIN, HR | Single employee |
| POST | `/api/v1/employees` | ADMIN, HR | Create |
| PUT | `/api/v1/employees/{id}` | ADMIN, HR | Update |
| DELETE | `/api/v1/employees/{id}` | ADMIN, HR | Delete |
| GET | `/api/v1/departments` | ADMIN, HR | List departments |
| POST/PUT/DELETE | `/api/v1/departments/**` | ADMIN | Manage departments |
| GET | `/api/v1/dashboard/stats` | ADMIN, HR | Aggregate statistics |
| GET | `/api/v1/dashboard/department-summary` | ADMIN, HR | Employee count per department |
| GET | `/api/v1/users` | ADMIN | List user accounts |
| PUT | `/api/v1/users/{id}/role` | ADMIN | Change a user's role |

Full interactive documentation: `http://localhost:8080/swagger-ui.html` once the backend is running.

## Authentication

JWT-based, stateless (no server-side session). On login, the server returns a signed token
containing the user's email and role; the frontend attaches it to every request as
`Authorization: Bearer <token>` via an Axios interceptor. Passwords are hashed with BCrypt —
plaintext passwords are never stored or logged.

**First admin account:** self-registration always creates an EMPLOYEE account (you can't
elevate your own privileges by registering). On first startup, if no ADMIN exists yet, one is
seeded automatically from `ADMIN_EMAIL`/`ADMIN_PASSWORD` (see
[Environment Variables](#environment-variables)). Log in and change that password immediately
outside local development.

## Authorization

Enforced on the backend via Spring Security's `@PreAuthorize`, not just hidden in the UI:

| Role | Employees | Departments | Users | Dashboard |
|---|---|---|---|---|
| ADMIN | Full CRUD | Full CRUD | Manage roles | View |
| HR | Full CRUD | View only | No access | View |
| EMPLOYEE | Own profile only (`/employees/me`) | No access | No access | No access |

## Environment Variables

See `springboot-backend/.env.example` and `react-frontend/.env.example`. Nothing sensitive is
hardcoded in source — everything below has a working local-development default so the project
runs out of the box, but **should be overridden** for anything beyond one developer's laptop.

| Variable | Where | Purpose |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Backend | MySQL connection |
| `JWT_SECRET` | Backend | Token signing key (generate with `openssl rand -base64 64`) |
| `JWT_EXPIRATION_MS` | Backend | Token lifetime in milliseconds |
| `CORS_ALLOWED_ORIGIN` | Backend | Frontend origin allowed to call the API |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Backend | First-run admin bootstrap credentials |
| `REACT_APP_API_URL` | Frontend | Backend base URL |

## Running the Backend

```bash
cd springboot-backend
# create your database first: CREATE DATABASE employee_management_system;
```

**Environment variables must be set in the same terminal session you run Maven from** — a
`.env` file is *not* automatically read by plain Spring Boot (that requires an extra library
this project doesn't use). Pick the syntax for your shell:

**Windows PowerShell:**
```powershell
$env:DB_PASSWORD="your-mysql-password"
$env:JWT_SECRET="any-long-random-string-for-local-dev"
.\mvnw.cmd spring-boot:run
```

**Windows CMD:**
```cmd
set DB_PASSWORD=your-mysql-password
set JWT_SECRET=any-long-random-string-for-local-dev
mvnw.cmd spring-boot:run
```

**macOS/Linux:**
```bash
export DB_PASSWORD=your-mysql-password
export JWT_SECRET=$(openssl rand -base64 64)
./mvnw spring-boot:run
```

If you don't set `DB_PASSWORD` at all, the app falls back to an empty password — if your local
MySQL `root` user actually requires one, you'll see `Access denied for user 'root'@'localhost'
(using password: NO)`, which just means the variable wasn't picked up.

Swagger UI: `http://localhost:8080/swagger-ui.html`

## Running the Frontend

```bash
cd react-frontend
cp .env.example .env   # adjust REACT_APP_API_URL if needed
npm install
npm start
```

Runs at `http://localhost:3000`. Log in with the seeded admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD`,
defaults `admin@ems.local` / `Admin@12345` if not overridden — **change this immediately**),
or register a new (EMPLOYEE-role) account.

## Testing

```bash
cd springboot-backend
```

`contextLoads` (the one full-context test) needs a real database connection, so set
`DB_PASSWORD` first, the same way as in [Running the Backend](#running-the-backend) — e.g. on
Windows PowerShell: `$env:DB_PASSWORD="your-mysql-password"`. Every other test (service logic,
validation, controller/security, JWT) runs without a database at all.

```bash
./mvnw test        # macOS/Linux
.\mvnw.cmd test     # Windows
```

Covers: service-layer business rules (duplicate email, not-found handling), Jakarta Bean
Validation on the request DTO, MockMvc controller tests including real `@PreAuthorize`
enforcement (403 for wrong role, rejection when unauthenticated), JWT generation/validation
including expiry, and the auth service's duplicate-registration and bad-credentials paths.

These aren't padding for a coverage number — writing the JWT test actually caught a real bug
(`isTokenValid` would have thrown on an expired token instead of returning `false`); see
`CHANGELOG.md`.

## Known Limitations

Documented honestly rather than hidden:

- **`users` and `employees` are linked only by matching email**, not a foreign key. This keeps
  auth accounts independent of whether HR has created a corresponding employee record, but means
  `/employees/me` returns 404 for a user with no matching employee email — that's the intended
  behavior, not a bug.
- **`Department` (the management entity) and `Employee.department` (the enum)** are only loosely
  connected — the deletion guard matches on name, not a real foreign key. A department whose name
  doesn't match an enum constant is always deletable.
- **DB columns aren't `NOT NULL`** even for logically-required fields (email, department, etc.) —
  "required" is enforced by Bean Validation at the API layer, not the schema. This was a deliberate
  choice to avoid `ddl-auto=update` breaking against a table with rows from the earlier 3-field
  version of this project.
- **Unauthenticated requests to protected endpoints may return 401 or 403** depending on Spring
  Security's default entry point behavior — no custom `AuthenticationEntryPoint` was configured.
- **No refresh tokens** — a token simply expires after `JWT_EXPIRATION_MS` and the user logs in again.
- **No pagination on the Departments or Users list** — acceptable given these are expected to stay small.

## Future Improvements

- Refresh token flow instead of a single long-lived JWT
- A real foreign key between employees and departments (would require migrating the enum-based model)
- Rate limiting on `/auth/login`
- Audit fields (`createdBy`/`updatedBy`) via a proper `AuditorAware`, once tied to the authenticated user
- Soft-delete instead of hard-delete for employees
- Frontend test suite (React Testing Library) — currently only the backend has automated tests
