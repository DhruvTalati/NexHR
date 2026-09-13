# Interview Questions — This Project

53 questions, all specific to this codebase, grouped by category. Each has a strong answer, a
likely follow-up, and an answer to that follow-up.

## Java

**Q1: Why does `EmployeeRequestDto` use `BigDecimal` for salary instead of `double`?**
A: `double` uses binary floating-point, which can't represent many decimal values exactly (e.g.
0.1), causing rounding errors in financial calculations. `BigDecimal` represents decimal numbers
exactly, which matters for money.
*Follow-up: What's the tradeoff?* `BigDecimal` is slower and more verbose (no operator overloading —
you call `.add()`, not `+`), but that's an acceptable cost for correctness on financial data.

**Q2: Why are the enums (`Department`, `EmployeeStatus`, etc.) stored as `STRING` in the database, not `ORDINAL`?**
A: `@Enumerated(EnumType.STRING)` stores the enum's name (e.g. `"ACTIVE"`). `ORDINAL` would store
its position (0, 1, 2...), which silently breaks if you ever reorder or insert a new constant in
the middle of the enum — existing rows would suddenly map to the wrong value.
*Follow-up: Any downside to STRING?* Slightly more storage, and renaming an enum constant requires
a data migration — but that's a much safer failure mode than silent misinterpretation.

**Q3: Why is `Employee.getUpdatedAt()` present but `setUpdatedAt()` isn't?**
A: `updatedAt` is only ever set internally, by the `@PreUpdate` lifecycle callback. Not exposing a
public setter means no code outside the entity can accidentally (or maliciously, via a
mis-mapped DTO) set an arbitrary timestamp.
*Follow-up: Could a client fake this via the API anyway?* No — `EmployeeRequestDto` doesn't even
have an `updatedAt` field, so there's nothing for a client to set in the first place; this is
defense in depth.

**Q4: What does `final` do on the `EmployeeServiceImpl` fields, and why use it?**
A: It means the field can only be assigned once (in the constructor) and never reassigned. It
documents intent — "this dependency never changes after construction" — and the compiler enforces it.
*Follow-up: Does it affect the object the field points to?* No — `final EmployeeRepository
employeeRepository` means the *reference* can't be reassigned, but the repository bean itself is
still mutable internally (which is fine; that's Spring's concern, not ours).

**Q5: Why does `EmployeeCodeGenerator` use `UUID` instead of the entity's database `id`?**
A: With `GenerationType.IDENTITY`, the `id` is only assigned by the database *after* an insert —
using it for the code would require inserting first, then updating with the code, a wasted round
trip. `UUID` can be generated before persistence, so it's ready in the same insert.
*Follow-up: Any downside to UUID-based codes?* They're not sequential/sortable by creation order the
way an incrementing counter would be — acceptable here since the code is just an identifier, not
meant to convey ordering.

## Spring (Core)

**Q6: What is Dependency Injection, concretely, in this project?**
A: Classes declare what they need in their constructor (e.g. `EmployeeServiceImpl(EmployeeRepository
repo, EmployeeMapper mapper, ...)`), and Spring's IoC container creates and supplies those objects
automatically at startup, rather than the class creating them itself with `new`.
*Follow-up: Why does that matter for testing?* `EmployeeServiceImplTest` constructs the service with
*mock* dependencies instead of real ones, so tests run instantly with no database — impossible if
the class instantiated its own repository internally.

**Q7: What's the difference between `@Component`, `@Service`, and `@Repository` in this codebase?**
A: They're functionally identical to Spring's container (all are stereotypes of `@Component`), but
they communicate intent: `@Service` marks business logic (`EmployeeServiceImpl`), `@Repository`
marks data access (also enables JPA exception translation), `@Component` is the generic catch-all
(`EmployeeMapper`, `EmployeeCodeGenerator`).
*Follow-up: Would the app break if you used `@Component` everywhere instead?* Functionally, mostly
no — but you'd lose `@Repository`'s automatic translation of low-level JDBC exceptions into
Spring's consistent `DataAccessException` hierarchy.

**Q8: What does `@Configuration` mean on `SecurityConfig`?**
A: It marks the class as a source of Spring bean definitions — every `@Bean`-annotated method
inside it (like `passwordEncoder()`, `securityFilterChain()`) gets registered in the application
context at startup.
*Follow-up: What's the difference between `@Configuration` and `@Component`?* `@Configuration`
classes are proxied by Spring (CGLIB) so that calling one `@Bean` method from another within the
same class returns the *same* singleton instance rather than creating a new one each time.

**Q9: How does Spring know to inject `EmployeeRepository` into `EmployeeServiceImpl` specifically?**
A: `EmployeeRepository` is an interface extending `JpaRepository`; Spring Data JPA automatically
generates and registers an implementation bean for it at startup, keyed by type. Since
`EmployeeServiceImpl`'s constructor asks for that exact type, Spring matches it by type.
*Follow-up: What if there were two beans of the same type?* Spring would throw a
`NoUniqueBeanDefinitionException` unless you disambiguate with `@Qualifier` or mark one `@Primary`.

**Q10: What's a Spring "bean"?**
A: Any object whose lifecycle (creation, wiring, destruction) is managed by the Spring IoC
container, rather than being created directly with `new` by application code. `EmployeeService`,
`EmployeeRepository`, `PasswordEncoder` are all beans in this project.
*Follow-up: Are DTOs like `EmployeeRequestDto` beans?* No — they're plain data-holder objects,
created fresh per-request by Jackson during JSON deserialization, not managed by the container.

## Spring Boot

**Q11: What does `@SpringBootApplication` actually do?**
A: It's a convenience annotation combining three: `@Configuration` (this class can define beans),
`@EnableAutoConfiguration` (auto-configure beans based on the classpath), and `@ComponentScan`
(scan this package and subpackages for components) — which is how every controller/service/etc.
in `net.javaguides.springboot.*` gets picked up automatically.
*Follow-up: What if a class lived outside that package?* It wouldn't be discovered unless you
explicitly widened `@ComponentScan`'s base packages.

**Q12: How does Spring Boot know to configure a MySQL `DataSource` without you writing that code?**
A: Auto-configuration inspects the classpath — `spring-boot-starter-data-jpa` and the MySQL driver
being present signals "this app wants a JPA + MySQL setup" — and Spring Boot wires the
`DataSource`/`EntityManagerFactory`/`TransactionManager` using values from `application.properties`.
*Follow-up: What happens if no database driver is on the classpath?* Auto-configuration for
`DataSource` backs off silently (or fails at startup if JPA is present but no driver can be
resolved) — Spring Boot generally prefers "don't configure it" over guessing wrong.

**Q13: What's the purpose of `application.properties` in this project?**
A: Centralized externalized configuration — database connection, JWT secret/expiration, CORS
origin, admin bootstrap credentials, and Swagger paths — all sourced from environment variables
with local-dev defaults via `${VAR:default}` syntax.
*Follow-up: Why not hardcode these values directly in Java classes?* Then changing them (e.g.
switching databases between dev/staging/prod) would require a code change and recompilation
instead of just setting an environment variable.

**Q14: What does `spring-boot-devtools` do, and why is it scoped `runtime`?**
A: It enables automatic restart on classpath changes during development. It's scoped `runtime`
(and typically `optional`) so it's never accidentally packaged into a production build where
it's not needed and could add startup overhead.

**Q15: Why does `AdminBootstrap` implement `CommandLineRunner`?**
A: `CommandLineRunner`'s `run()` method is automatically invoked by Spring Boot once, right after
the application context finishes loading — exactly the right hook for "check if an admin exists,
seed one if not" logic that needs to run once at startup, not on every request.
*Follow-up: What if there were multiple `CommandLineRunner` beans?* Spring Boot runs all of them
in order (optionally controlled via `@Order`) — not a concern here since this project only has one.

## REST API

**Q16: Why does `DELETE /employees/{id}` return `204 No Content` instead of `200 OK` with a body?**
A: `204` is the standard REST convention for "the operation succeeded and there's nothing
meaningful to return" — a deleted resource has no representation to send back.
*Follow-up: What did this endpoint return before the refactor?* `200 OK` with `{"deleted": true}` —
technically fine but non-idiomatic; `204` communicates the same thing via status code alone.

**Q17: Why does `POST /employees` return `201 Created`, not `200 OK`?**
A: `201` specifically means "a new resource was created," which is more precise than `200`'s
generic "success." Combined with the response body containing the new resource (with its
server-generated `id` and `employeeCode`), the client has everything it needs.

**Q18: How does `EmployeeController` decide what HTTP status to return for `EmployeeNotFoundException`?**
A: It doesn't — `GlobalExceptionHandler`'s `@ExceptionHandler(EmployeeNotFoundException.class)`
method catches it wherever it's thrown and maps it to `404`, centrally, for every controller.

**Q19: What's the difference between `@PathVariable` and `@RequestParam` in this project?**
A: `@PathVariable` extracts a value from the URL path itself (`{id}` in `/employees/{id}`) —
used when the value identifies *which* resource. `@RequestParam` extracts query string parameters
(`?page=0&size=10`) — used for optional modifiers like pagination or filters.

**Q20: Why is `/employees/search` a separate endpoint instead of a query parameter on `/employees`?**
A: Both are defensible, but a separate `/search` endpoint keeps the "default paginated list"
semantics of `GET /employees` simple, and makes the free-text-search behavior (`OR` across
name/email fields) explicit in the URL rather than implicit in a generic `?keyword=` parameter
that behaves differently from `/filter`'s `AND`-combined parameters.

## JPA & Hibernate

**Q21: What does `@Id` combined with `@GeneratedValue(strategy = GenerationType.IDENTITY)` mean?**
A: `@Id` marks the primary key field. `IDENTITY` tells Hibernate to delegate id generation to the
database's auto-increment column — the id is only known after the row is actually inserted.
*Follow-up: What's an alternative strategy, and why didn't we use it?* `SEQUENCE` (a database
sequence object) allows Hibernate to batch inserts more efficiently since it can pre-fetch ids —
not used here because MySQL's native auto-increment (`IDENTITY`) is simpler and this project's
scale doesn't need that optimization.

**Q22: Why does `EmployeeRepository extend JpaSpecificationExecutor<Employee>`?**
A: It adds `findAll(Specification<Employee>, Pageable)` methods, which is what powers the
`/employees/filter` endpoint's dynamic, combinable WHERE clauses (`EmployeeSpecification`) — plain
`JpaRepository` only supports fixed, method-name-derived queries.

**Q23: How does `findByEmail(String email)` in `EmployeeRepository` work with no method body?**
A: Spring Data JPA parses the method name at startup ("find by Email") and generates the
equivalent JPQL query (`SELECT e FROM Employee e WHERE e.email = ?1`) automatically — this is
called a "derived query method."
*Follow-up: What if you needed a more complex query than the method name could express?* Use
`@Query` with JPQL or native SQL directly, as done in `EmployeeRepository.findAverageSalary()`.

**Q24: What's the difference between JPA and Hibernate?**
A: JPA is a specification (interfaces/annotations) — it defines *what* persistence should look
like but has no implementation. Hibernate is a concrete implementation of that specification —
it's the library that actually generates SQL and talks to the database.

**Q25: What does `@Transactional(readOnly = true)` do on `getAllEmployees()`?**
A: It's a hint to Hibernate that this method won't modify data, letting it skip dirty-checking
overhead (tracking whether loaded entities changed) — a minor performance optimization for
read-heavy methods.
*Follow-up: What happens if you write to the database inside a `readOnly` transaction?* Behavior
is implementation-specific — some databases/JPA providers throw an exception, others silently
allow it depending on configuration; it should never be relied upon either way.

## MySQL / Database Design

**Q26: Why aren't `employees` and `departments` connected by a foreign key in this schema?**
A: `Employee.department` is a fixed enum (a closed set of valid categories), while `Department`
is a separate table for HR-editable *metadata* about each category. Linking them with a real FK
would require migrating the enum into a proper relationship — documented as an intentional
simplification in the README.
*Follow-up: What's the real tradeoff of leaving it this way?* Data integrity between the two isn't
enforced by the database — `DepartmentServiceImpl`'s deletion guard does a best-effort name match
instead of a guaranteed-correct FK constraint check.

**Q27: Why is `email` marked `unique = true` at the column level even though "required" isn't enforced there?**
A: Uniqueness is a correctness constraint (two employees can never legitimately share an email),
appropriate to enforce at the database level regardless of validation. "Required" (`NOT NULL`) was
deliberately left off to avoid `ddl-auto=update` failing against a table with rows from an earlier,
simpler schema version — see the entity's own code comment.

**Q28: What does `spring.jpa.hibernate.ddl-auto=update` do, and why is it risky in production?**
A: On startup, Hibernate compares your entity classes to the actual database schema and
auto-applies additive changes (new columns/tables) — convenient in development, but it never
generates a real migration history, and can behave unpredictably on complex schema changes. A
real production setup would use a migration tool (Flyway/Liquibase) instead.

## Spring Security

**Q29: Why is CSRF protection disabled in `SecurityConfig`?**
A: CSRF attacks exploit the browser automatically attaching cookies to cross-site requests. This
API doesn't use cookie-based session auth at all — every request must explicitly carry a JWT in
an `Authorization` header, which a malicious site can't force a browser to attach automatically.
That removes the specific mechanism CSRF protection exists to prevent.

**Q30: What does `SessionCreationPolicy.STATELESS` mean, and why use it here?**
A: It tells Spring Security to never create or use an `HttpSession` to track logged-in users. All
identity comes from the JWT on each request, which fits a token-based API — no server-side session
state to manage, scale, or invalidate.

**Q31: What's the difference between `hasRole('ADMIN')` and `hasAnyRole('ADMIN','HR')` in `@PreAuthorize`?**
A: `hasRole('ADMIN')` requires exactly the `ROLE_ADMIN` authority. `hasAnyRole(...)` requires at
least one of the listed roles — used on `EmployeeController`'s CRUD methods since both ADMIN and
HR are allowed to manage employees, while `DepartmentController`'s write methods use the
single-role form since only ADMIN can create/edit/delete departments.

**Q32: Why does `EmployeeControllerTest` need to explicitly `@Import(SecurityConfig.class)`?**
A: `@WebMvcTest` only auto-configures the controller layer and a handful of Spring MVC-related
beans by default — it does **not** automatically pick up custom `@Configuration` classes like
`SecurityConfig`. Without the explicit import, `@PreAuthorize` checks wouldn't actually be
enforced in the test, and the "forbidden"/"unauthenticated" test cases would give false confidence.

**Q33: What does `DaoAuthenticationProvider` do in `SecurityConfig`?**
A: It's the component that actually verifies a username/password pair during login — it loads the
user via `CustomUserDetailsService`, then uses the configured `PasswordEncoder` to check the
submitted password against the stored BCrypt hash.

## JWT

**Q34: What three things does the JWT in this project actually contain?**
A: The subject (user's email), a custom `role` claim, and standard issued-at/expiration
timestamps — all signed with HMAC-SHA256 using the server's secret key. No password or other
sensitive data is ever included in the token.

**Q35: What happens if someone tampers with a JWT's payload (e.g. changes `role` to `ADMIN`)?**
A: The signature, computed over the original payload, would no longer match the modified
payload. `Jwts.parserBuilder().setSigningKey(...).parseClaimsJws(token)` would throw a
`SignatureException`, which `JwtAuthenticationFilter` catches and treats as "not authenticated" —
the request proceeds unauthenticated rather than trusting the tampered claim.

**Q36: Why does `JwtUtil.isTokenValid()` catch exceptions instead of letting them propagate?**
A: `jjwt`'s parsing itself throws `ExpiredJwtException` for an expired token — you can't reliably
check "is it expired?" *after* parsing if parsing itself already failed. Catching and returning
`false` treats "expired," "malformed," and "tampered" uniformly as "not valid," which is exactly
the semantics callers need. (This was a real bug found and fixed while writing `JwtUtilTest`.)

**Q37: Why is the JWT secret loaded via `@Value("${app.jwt.secret}")` instead of hardcoded?**
A: A hardcoded secret in source control means anyone with repository access (including in git
history, forever) could forge valid tokens for any user, including admins. Loading it from
configuration means the real production secret only ever exists in that environment's config,
never in the codebase.

**Q38: Why is there no token refresh mechanism in this project?**
A: It's a documented, deliberate scope limitation (see README "Future Improvements") — the token
simply expires after `JWT_EXPIRATION_MS` and the user logs in again. A refresh-token flow (a
separate, longer-lived token used only to mint new access tokens) is the standard next step for
a production system with a longer session-continuity requirement.

## React Integration

**Q39: How does the frontend attach the JWT to every API request without repeating code?**
A: `axiosClient.js` registers a request interceptor that reads the token from `localStorage` and
sets the `Authorization` header on every outgoing request automatically — no individual service
call (`EmployeeService.getEmployees()`, etc.) needs to handle this itself.

**Q40: What does the response interceptor in `axiosClient.js` do, and why?**
A: If any API call comes back with `401`, it clears the stored token/user and redirects to
`/login` — handling "your session is no longer valid" consistently in one place, rather than
every page needing its own 401-handling logic.

**Q41: How does `ProtectedRoute` decide whether to render a page or redirect?**
A: It reads `isAuthenticated` from `AuthContext`; if false, it renders `<Navigate to="/login">`,
preserving the originally-requested location in route state so `LoginPage` can send the user back
after a successful login. If `allowedRoles` is passed and the user's role isn't included, it
redirects to `/dashboard` instead.
*Follow-up: Is this a real security boundary?* No — it's a UX convenience only. The backend's
`@PreAuthorize` checks are the actual security boundary; a determined user could bypass
`ProtectedRoute` entirely and the API would still correctly reject unauthorized requests.

**Q42: Why did the project upgrade from react-router-dom v5 to v6?**
A: v6 replaced the `<Switch>`/`this.props.history` (paired with class components) pattern with
`<Routes>`/`<Route element={}>` and hook-based navigation (`useNavigate`, `useParams`), which is
the current standard and pairs naturally with the functional-component rewrite of the rest of the
frontend.

**Q43: How does `EmployeeForm` get reused between the Create and Edit pages?**
A: It accepts `initialValues` (empty for create, pre-populated for edit) and an `onSubmit`
callback — the pages own the actual API call and navigation-on-success logic, while the form
component owns only field state and client-side shape.

## Project Architecture

**Q44: Why did the original tutorial project have no service layer at all?**
A: It's a minimal teaching example focused on demonstrating the Controller → Repository → JPA →
MySQL flow for a beginner audience — adding a service layer for a 3-field CRUD app would have
been more ceremony than the lesson needed. It becomes necessary once real business rules
(duplicate checks, authorization, code generation) exist to enforce.

**Q45: Why is `EmployeeMapper` a separate class instead of the entity/DTO doing the conversion themselves?**
A: Keeping conversion logic out of both the entity and the DTO keeps each focused on a single
concern — the entity models persistence, the DTO models the API shape, and the mapper is the only
place that needs to know both. It also makes the conversion independently testable.

**Q46: Why does `AuthServiceImpl.register()` always assign `Role.EMPLOYEE`, ignoring any role the client might send?**
A: If registration accepted a client-supplied role, anyone could self-register as `ADMIN` and gain
full system access — a critical privilege-escalation vulnerability. The only ways to get ADMIN
access are the startup bootstrap seed or an existing ADMIN promoting you via `UserController`.

**Q47: What problem does `AdminBootstrap` solve?**
A: A chicken-and-egg problem: if registration only ever creates EMPLOYEE accounts, and promoting
someone to ADMIN requires an existing ADMIN, how does the *very first* ADMIN account get created?
`AdminBootstrap` seeds exactly one, on first startup, only if no ADMIN exists yet.

## Testing

**Q48: Why does `EmployeeServiceImplTest` use Mockito instead of a real database?**
A: It's testing the service's *business logic* (duplicate-email detection, not-found handling) in
isolation — a real database would make the test slower, require setup/teardown, and couple the
test to infrastructure that has nothing to do with the logic actually being verified.

**Q49: What's the difference between `@WebMvcTest` and `@SpringBootTest` in this project's tests?**
A: `@WebMvcTest(EmployeeController.class)` loads only the web layer (fast, no database) — used in
`EmployeeControllerTest`. `@SpringBootTest` (used only in the original `contextLoads()` test)
boots the *entire* application context, including a real database connection — slower, but
verifies the whole app actually wires together and starts.

**Q50: Why test `EmployeeRequestDto` validation directly with a `Validator`, separately from the controller test?**
A: It isolates "are the validation *rules themselves* correct" from "does the controller *wire up*
validation correctly." Testing both matters: the DTO test would catch a wrong regex on the phone
pattern; the controller test would catch someone forgetting to add `@Valid` to a new endpoint.

**Q51: What real bug did writing tests for this project actually catch?**
A: `JwtUtil.isTokenValid()` called `extractEmail()` first, but `jjwt` throws `ExpiredJwtException`
*during* parsing for an expired token — meaning the method would have thrown an unhandled
exception instead of cleanly returning `false` for an expired token. `JwtUtilTest`'s expiry test
exposed this, and it was fixed by catching `JwtException` in `isTokenValid()`.

## Git / GitHub

**Q52: Why does this project's `CHANGELOG.md` exist as a separate file rather than relying on git commit history?**
A: Git history is precise but low-level (individual commits); `CHANGELOG.md` groups changes by
project *phase* with the reasoning behind each change, which is far more useful for someone
(including a future you) trying to understand *why* the project evolved the way it did, not just *what* changed line-by-line.

**Q53: If you were setting this project up for a team, what's one Git practice you'd add that isn't visible in the code itself?**
A: A `.gitignore` covering `target/`, `node_modules/`, and any real `.env` file — none of which
should ever be committed — combined with `.env.example` files (already present in this project)
so the required configuration shape is documented without exposing real secrets.
