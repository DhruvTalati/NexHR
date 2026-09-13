# Changelog

All changes made while transforming the original 3-field tutorial CRUD app into this project.
Grouped by the phase they were made in (see original project brief for full phase list).

## Post-Delivery Fixes
- `springdoc-openapi-starter-webmvc-ui` was pinned to `2.1.0`, which targets Spring Boot 3.1.x —
  incompatible with this project's Spring Boot 3.0.4. This caused `IllegalArgumentException:
  Attribute name must not be null` inside every `@WebMvcTest` (`EmployeeControllerTest`). Fixed
  by pinning to `2.0.4`, the version matching Boot 3.0.x.
- README's backend setup instructions used bash-only `export` syntax with no Windows equivalent,
  which silently left `DB_PASSWORD` unset and caused `contextLoads` to fail with "Access denied
  for user 'root'@'localhost' (using password: NO)". Added PowerShell/CMD/bash-specific
  instructions and a note that a `.env` file is not automatically read by plain Spring Boot.

## Phase A — Backend Layered Architecture
- Introduced a real service layer (`EmployeeService`/`EmployeeServiceImpl`) — the original
  controller talked directly to the repository with no service layer at all
- Moved `Employee` from `model` to `entity` package
- Added `EmployeeMapper` for entity/DTO conversion
- Controller rewritten to use constructor injection and depend only on the service interface
- `POST /employees` now returns `201 Created` (was `200`); `DELETE` now returns `204 No Content`
  with an empty body (was `{"deleted": true}`)

## Phase B — Employee Model Enhancement
- Replaced the 3-field entity (`firstName`, `lastName`, `emailId`) with a full HR record:
  `employeeCode`, `phone`, `dateOfBirth`, `dateOfJoining`, `department` (enum), `designation`,
  `salary` (`BigDecimal`), `employmentType` (enum), `status` (enum), `address`, `city`, `country`,
  `createdAt`/`updatedAt`
- `email` field renamed from `emailId`
- Added `EmployeeCodeGenerator` (UUID-based, avoids a two-step insert)
- Split the single `EmployeeDto` into `EmployeeRequestDto` (client-settable fields only) and
  `EmployeeResponseDto` (full representation) — server-managed fields can never be set by a client

## Phase C — Validation & Exception Handling
- Added Jakarta Bean Validation annotations across `EmployeeRequestDto`
- Renamed `ResourceNotFoundException` → `EmployeeNotFoundException`
- Added `DuplicateEmployeeException`, `DuplicateUserException`, `UserNotFoundException`, `BadRequestException`
- Added `GlobalExceptionHandler` (`@RestControllerAdvice`) — single source of truth for every
  error response shape; no more raw 500s or stack traces reaching the client
- Added duplicate-email detection on create/update (409 Conflict)

## Phase D — Pagination, Search, Filter
- `GET /employees` is now paginated and sortable (`page`, `size`, `sortBy`, `sortDirection`)
- Added `GET /employees/search` (free-text) and `GET /employees/filter` (multi-field, via JPA Specifications)
- Added `PageResponseDto<T>` as a generic pagination envelope

## Phase E — Authentication & Authorization
- Added `User` entity, `Role` enum, Spring Security, BCrypt, JWT (jjwt)
- `POST /auth/register` (always creates EMPLOYEE role — no client-side privilege escalation),
  `POST /auth/login`
- `AdminBootstrap` seeds one ADMIN account on first startup if none exists
- Every employee/department/dashboard endpoint now enforces role via `@PreAuthorize`
- Added `GET /employees/me` for self-service profile access

## Phase 9 — Department Management
- New `Department` entity (metadata: name, description) with full CRUD, ADMIN-only for writes
- Deletion is blocked while employees are still assigned (matched against the `Department` enum by name)

## Phase F — Dashboard
- `GET /dashboard/stats` and `GET /dashboard/department-summary`, computed live from repository
  aggregate queries — nothing hardcoded

## Phase 13 — API Documentation
- Added springdoc-openapi with a working JWT "Authorize" button in Swagger UI

## Phase 15 / 22 / 23 — Security & Configuration
- Removed the real MySQL password that was previously committed in plaintext in `application.properties`
- All secrets (`DB_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD`) now come from environment variables
- CORS restricted to a configured origin instead of `@CrossOrigin(origins = "http://localhost:3000")`
  hardcoded on the controller

## Phase 24 — Testing
- Added a real test suite: `EmployeeServiceImplTest`, `EmployeeControllerTest` (MockMvc + Spring
  Security), `EmployeeRequestDtoValidationTest`, `JwtUtilTest`, `AuthServiceImplTest`
- **Found and fixed a real bug** while writing `JwtUtilTest`: `isTokenValid` would throw
  `ExpiredJwtException` on an expired token instead of returning `false`, because jjwt throws
  during parsing itself — not something a manual expiry check after the fact would catch

## Phase G — Frontend Rewrite
- Upgraded `react-router-dom` v5 → v6; rewrote `App.js` using `<Routes>`/`<Route element>`
- Converted all class components to functional components with hooks
- Added `AuthContext`, `ProtectedRoute` (with role support), an Axios client with a JWT interceptor
  and a `getErrorMessage()` helper that turns raw Axios/backend errors into readable messages
- New pages: Login, Register, Dashboard (with a live Recharts department-distribution chart),
  Employees List (paginated/searchable/filterable/sortable), Employee Create/Edit/View,
  Departments (role-aware), Profile (self-service), 404
- New reusable components: `Navbar`, `Sidebar`, `Layout`, `Footer`, `EmployeeTable`, `EmployeeForm`,
  `Pagination`, `SearchBar`, `Modal`, `Toast`, `StatsCard`, `LoadingSpinner`, `ErrorMessage`
- Fixed a pre-existing bug: `/view-employee/:id` was used by the employee list but was missing
  from the router's `<Switch>` entirely — a 404 waiting to happen
- Removed dead code: the old `UpdateEmployeeComponent` (superseded by dual-purpose Create/Update
  logic, but never actually wired to a route)
