# Interview Guide — Understanding This Project

Written for someone learning Java/Spring Boot who needs to be able to explain this project
confidently, not just say it "uses Spring Boot." Every concept below is tied to an actual file
in this codebase, not a generic textbook definition.

## 1. The Big Picture

This is a **layered** application. Each layer has exactly one job, and only talks to the layer
directly below it:

```
React (browser)
   |  HTTP request (JSON)
   v
Controller   -- "What did the client ask for? What HTTP status do I send back?"
   |
   v
Service      -- "What are the business rules? (e.g. no duplicate emails)"
   |
   v
Repository   -- "How do I get/save this in the database?"
   |
   v
Hibernate/JPA -- translates Java objects to SQL
   |
   v
MySQL
```

**Why layers, instead of one giant class?** Because each layer can be understood, tested, and
changed independently. If you need to change how "duplicate email" is detected, you only touch
`EmployeeServiceImpl`. If you need to change the URL structure, you only touch
`EmployeeController`. Neither change risks breaking the other.

## 2. Request Lifecycle — A Concrete Walkthrough

Let's trace exactly what happens when a user clicks "Save" on the Add Employee form.

1. **React** (`EmployeeCreatePage.jsx`) calls `EmployeeService.createEmployee(values)`.
2. **Axios** (`axiosClient.js`) sends a `POST` to `/api/v1/employees` with the form data as JSON,
   and an interceptor automatically attaches `Authorization: Bearer <token>`.
3. Spring's **`JwtAuthenticationFilter`** runs first, on every request. It reads that header,
   validates the token, and — if valid — tells Spring Security "this request is from
   `ada@example.com`, role ADMIN."
4. Spring Security's authorization check runs next (`@PreAuthorize("hasAnyRole('ADMIN','HR')")`
   on the controller method). If the role doesn't match, the request stops here with a 403 —
   the controller method body never even runs.
5. **`EmployeeController.createEmployee()`** receives the request. `@Valid` triggers Bean
   Validation on the incoming `EmployeeRequestDto` *before* the method body runs. If validation
   fails, Spring throws `MethodArgumentNotValidException` and the method body never runs either.
6. If validation passes, the controller calls `employeeService.createEmployee(dto)`.
7. **`EmployeeServiceImpl`** checks the business rule (does this email already exist?), and if
   it's clear, asks the `EmployeeMapper` to convert the DTO into an `Employee` entity, generates
   an employee code, and calls `employeeRepository.save(employee)`.
8. **Spring Data JPA** turns that `save()` call into an `INSERT` statement. **Hibernate** is the
   underlying engine doing the Java-object-to-SQL translation.
9. The saved entity (now with a database-generated `id`) comes back up through the mapper (as a
   response DTO), through the service, through the controller, and Spring serializes it to JSON
   for the HTTP response.
10. Axios resolves the promise; React updates the UI.

## 3. Why Each Layer Exists

**Why does Controller exist?**
It's the only layer that knows about HTTP — status codes, headers, request/response bodies. If
you added a second API style tomorrow (say, GraphQL), you'd write a new controller layer but
reuse the exact same service layer untouched. That's the point of separating it.

**Why does Service exist?**
Business rules live here — "an employee's email must be unique," "an admin's password must be
BCrypt-hashed," "you can't delete a department with employees in it." These rules apply
regardless of whether the request came from HTTP, a scheduled job, or a test. Putting them in
the controller would mean re-writing the same checks anywhere else you needed them.

**Why does Repository exist?**
It isolates "how do I talk to the database" from "what should happen." `EmployeeRepository`
doesn't know or care what a duplicate-email check is — it just knows how to find, save, and
delete `Employee` rows. This is also the layer you'd swap out if you ever migrated databases.

## 4. What JPA and Hibernate Actually Do

**JPA (Jakarta Persistence API)** is a *specification* — a set of Java interfaces and
annotations (`@Entity`, `@Id`, `@Column`) that describe how a Java class maps to a database
table. JPA itself doesn't do anything; it's a contract.

**Hibernate** is the actual implementation that fulfills that contract. When you call
`employeeRepository.save(employee)`, it's Hibernate that generates the actual `INSERT INTO
employees (...) VALUES (...)` SQL, sends it to MySQL, and maps the result back into a Java
object.

**Spring Data JPA** sits one layer above both: it's what lets you write an *interface*
(`EmployeeRepository extends JpaRepository<Employee, Long>`) with no implementation at all, and
have Spring generate the implementation for you at startup — including turning method names like
`findByEmail(String email)` into real SQL queries.

## 5. What Spring Boot Does

Spring Boot's main job is removing configuration boilerplate. Plain Spring requires you to wire
up a `DataSource`, an `EntityManagerFactory`, a `TransactionManager`, an embedded server, etc.,
by hand. Spring Boot's **auto-configuration** looks at what's on your classpath (e.g. MySQL
driver + `spring-boot-starter-data-jpa`) and configures all of that for you with sensible
defaults, which you can then override in `application.properties`.

## 6. Dependency Injection

Every class in this project's service/controller layers receives its dependencies through its
**constructor**, not by creating them itself:

```java
public class EmployeeServiceImpl implements EmployeeService {
    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
}
```

Spring's IoC (Inversion of Control) container creates one instance of `EmployeeRepository` and
hands it to `EmployeeServiceImpl` automatically at startup. **Why does this matter?** It makes
testing trivial — in `EmployeeServiceImplTest`, we pass in a *mock* repository instead of a real
one, so the test never touches an actual database. If the class created its own repository
internally (`new EmployeeRepositoryImpl()`), that would be impossible.

**Why constructor injection instead of `@Autowired` on a field?** A class with constructor
injection literally cannot be instantiated without its dependencies — the compiler enforces it.
Field injection lets you create a half-broken object that fails later, at runtime, when you
first try to use the null field.

## 7. REST APIs

REST just means: resources (like an employee) are identified by URLs (`/employees/5`), and the
HTTP verb describes the action (`GET` = read, `POST` = create, `PUT` = update, `DELETE` = remove).
Status codes communicate outcome: `200`/`201`/`204` for success, `400`/`404`/`409` for client
errors, `500` for server errors. This project follows that convention consistently — see the
API endpoint table in the README.

## 8. DTOs (Data Transfer Objects)

`EmployeeRequestDto` and `EmployeeResponseDto` exist so the API's public contract is decoupled
from the database schema. Two concrete reasons this matters here:

- `EmployeeRequestDto` has no `id`, `employeeCode`, `createdAt`, or `updatedAt` fields — a client
  literally cannot set them, even by including them in the JSON body, because the DTO has no
  setter for them. This closes off a whole class of "client tries to fake server-managed data" bugs.
- If we ever add a field to the entity that's internal-only (say, a soft-delete flag), it never
  leaks into the API response unless we explicitly add it to `EmployeeResponseDto`.

## 9. Entity Relationships

This project deliberately has **no `@ManyToOne`/`@OneToMany` relationships** between `Employee`
and `Department` — `Employee.department` is an enum, and `Department` (the management entity) is
only loosely connected to it by name matching. This was a conscious simplification (documented
in the README's Known Limitations), not an oversight — it avoids a real foreign-key migration
while still letting HR manage department descriptions.

## 10. JWT Authentication

A JWT (JSON Web Token) is a signed, self-contained blob of data. When you log in, the server
creates a token containing your email and role, signs it with a secret key
(`app.jwt.secret`), and hands it to you. On every subsequent request, you send that token back;
the server re-verifies the signature (proving it wasn't tampered with) and reads your identity
straight out of the token — **without needing to store any session state on the server**. That's
why this is called "stateless" authentication.

## 11. Spring Security

Spring Security is the framework doing the actual authentication/authorization work.
`SecurityConfig` wires together:
- A `PasswordEncoder` (BCrypt) for hashing
- A `JwtAuthenticationFilter` that runs on every request to check for a valid token
- Authorization rules (`authorizeHttpRequests`) saying which URLs need authentication at all
- `@PreAuthorize` annotations on individual controller methods for fine-grained role checks

## 12. BCrypt

BCrypt is a one-way hashing algorithm designed specifically for passwords — it's deliberately
slow (to resist brute-force attacks) and automatically incorporates a random "salt" so that two
users with the same password get completely different hashes. We never store or log a plaintext
password anywhere — see `AuthServiceImpl.register()`, where `passwordEncoder.encode(...)` is
called immediately.

## 13. Exception Handling

`GlobalExceptionHandler` (`@RestControllerAdvice`) is a single class that catches exceptions
thrown *anywhere* in the controller/service layers and converts them into a consistent JSON
error shape. Without it, every controller method would need its own try/catch, and an unhandled
exception would leak a raw stack trace to the client — a real information-disclosure risk.

## 14. Validation

`@Valid` on a controller parameter tells Spring: "before running this method, check every
`@NotBlank`/`@Email`/`@Positive` annotation on the incoming DTO, and if any fail, throw
`MethodArgumentNotValidException` automatically." Combined with `GlobalExceptionHandler`, this
means invalid input never reaches business logic at all.

## 15. Pagination

`GET /employees?page=0&size=10` doesn't return the whole table — it returns one page of it, plus
metadata (total pages, total elements) so the frontend can build page-number buttons. Spring
Data's `Pageable`/`Page<T>` do the heavy lifting; `PageResponseDto` just gives the API a
consistent JSON shape for it.

## 16. Transactions

`@Transactional` on `EmployeeServiceImpl` methods means: if anything inside the method throws an
exception, every database change made so far in that method is rolled back — you never end up
with half-saved data. `@Transactional(readOnly = true)` on read methods is a hint to Hibernate
that lets it skip some bookkeeping it would otherwise do for a method that might write.

## 17. CORS

Browsers block a webpage on `localhost:3000` from calling an API on `localhost:8080` unless the
API explicitly allows it — that's CORS (Cross-Origin Resource Sharing). `CorsConfig` allows
exactly one origin (from `CORS_ALLOWED_ORIGIN`), not a wildcard, because our requests carry an
`Authorization` header — allowing literally any origin to send credentialed requests would be a
real security hole.

## 18. Environment Variables

Nothing sensitive (`DB_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD`) is hardcoded in this codebase —
Spring reads them via `${VAR_NAME:default}` syntax in `application.properties`, falling back to a
development-only default if the variable isn't set. This means the real secrets never end up in
source control, and different environments (local, staging, production) can use different values
without touching code.

## What Would Happen If... (removal test)

A good way to check you actually understand a class is to ask what breaks if it's deleted:

- **Remove `EmployeeMapper`**: the service would have to manually copy fields between DTO and
  entity inline, scattered across every method — easy to introduce a field-copy bug.
- **Remove `GlobalExceptionHandler`**: every uncaught exception becomes a raw 500 with Spring
  Boot's default (and inconsistent) error page/JSON.
- **Remove `JwtAuthenticationFilter`**: no request could ever be recognized as authenticated —
  everything protected would 401/403 permanently.
- **Remove `@Transactional` from `updateEmployee`**: if the save fails partway through a more
  complex operation, you could end up with inconsistent data instead of a clean rollback.
- **Remove `EmployeeRequestDto`/`EmployeeResponseDto`** (use the entity directly): a client could
  set `id`, `employeeCode`, `createdAt` directly in a request body — server-managed fields would
  no longer be protected.
