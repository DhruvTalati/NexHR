# NexHR - Human Resource Management System

<p align="center">
  <strong>A secure and scalable Human Resource Management System built with Java and Spring Boot.</strong>
</p>

<p align="center">
  NexHR centralizes employee information, HR operations, authentication, leave management, attendance, and organizational workflows into a single application.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17%2B-orange?style=for-the-badge&logo=openjdk" alt="Java"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=for-the-badge&logo=springboot" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/MySQL-8.x-blue?style=for-the-badge&logo=mysql" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Spring%20Security-JWT-success?style=for-the-badge" alt="Spring Security"/>
  <img src="https://img.shields.io/badge/Maven-Build-red?style=for-the-badge&logo=apachemaven" alt="Maven"/>
  <img src="https://img.shields.io/badge/REST-API-informational?style=for-the-badge" alt="REST API"/>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Project Objectives](#project-objectives)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Application Modules](#application-modules)
- [Authentication and Authorization](#authentication-and-authorization)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Testing the APIs](#testing-the-apis)
- [Deployment](#deployment)
- [Production Configuration](#production-configuration)
- [Security Practices](#security-practices)
- [Error Handling](#error-handling)
- [Challenges and Solutions](#challenges-and-solutions)
- [Future Enhancements](#future-enhancements)
- [Learning Outcomes](#learning-outcomes)
- [Project Demonstration](#project-demonstration)
- [Author](#author)

---

## Overview

NexHR is a Human Resource Management System developed to simplify and digitize essential HR activities.

Traditional HR processes frequently depend on spreadsheets, emails, paper forms, and disconnected systems. These approaches can result in duplicated records, delayed approvals, inconsistent information, and limited visibility into employee-related operations.

NexHR provides a centralized platform for managing HR-related information and workflows through a secure backend architecture and RESTful APIs.

The backend is developed using **Java and Spring Boot** and uses **MySQL** for persistent data storage. The application follows a layered architecture that separates request handling, business logic, database operations, and security concerns.

### Main Technologies

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- JWT Authentication
- MySQL
- Maven
- REST APIs

---

## Problem Statement

Organizations need a reliable and centralized system to manage employee-related information and HR operations.

Manual or disconnected processes can create challenges such as:

- Difficulty maintaining employee records
- Lack of centralized HR information
- Time-consuming leave approval workflows
- Limited attendance visibility
- Repeated manual data entry
- Inconsistent access control
- Security risks caused by unprotected resources
- Difficulty integrating different HR operations

NexHR addresses these challenges by providing a structured, role-based, and API-driven HR management platform.

---

## Project Objectives

The main objectives of NexHR are:

- To centralize employee and HR-related information
- To implement secure user authentication
- To provide role-based access control
- To expose reusable RESTful APIs
- To manage relational data using MySQL
- To follow a maintainable layered architecture
- To implement input validation and exception handling
- To separate sensitive configuration from source code
- To prepare the application for cloud deployment
- To demonstrate real-world backend development practices

---

## Features

### Authentication

- User registration
- User login
- JWT token generation
- JWT token validation
- Secure password storage
- Protected API endpoints
- Authentication failure handling

### Authorization

- Role-based access control
- Restricted administrative operations
- User-specific resource access
- Protected routes using Spring Security

### Employee Management

- Create employee records
- View employee details
- Update employee information
- Delete or deactivate employee records
- Search and retrieve employees
- Maintain employee-related information

### Department Management

- Create departments
- View departments
- Update department details
- Associate employees with departments
- Organize employees based on departments

### Leave Management

- Apply for leave
- Select leave type
- Submit leave reason
- Specify leave duration
- View leave history
- Track leave request status
- Approve or reject leave requests

### Attendance Management

- Record attendance
- Store attendance dates
- Track check-in and check-out information
- View attendance history
- Maintain employee attendance records

### Recruitment Management

- Manage job openings
- Store candidate information
- Track applications
- Maintain recruitment statuses
- Organize hiring-related data

### RESTful API

- Standard HTTP methods
- JSON-based request and response format
- Structured API endpoints
- Integration support for frontend applications
- API testing through Postman

### Validation and Error Handling

- Request validation
- Meaningful HTTP status codes
- Centralized exception handling
- Invalid request handling
- Resource-not-found handling
- Database error handling

---

## User Roles

NexHR can support different users based on their responsibilities.

### HR Administrator

The HR administrator can access privileged HR operations, such as:

- Managing employee records
- Managing departments
- Reviewing leave requests
- Managing recruitment information
- Viewing HR-related statistics
- Accessing administrative resources

### Employee

An employee can access permitted employee-related operations, such as:

- Logging into the system
- Viewing personal information
- Applying for leave
- Viewing leave status
- Viewing attendance information
- Accessing employee-specific resources

> Access permissions depend on the authorization rules implemented in the application.

---

## Technology Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Java | Core programming language |
| Spring Boot | Backend application framework |
| Spring Web | REST API development |
| Spring Data JPA | Data-access abstraction |
| Hibernate | ORM implementation |
| Spring Security | Authentication and authorization |
| JWT | Stateless token-based authentication |
| Maven | Dependency management and build automation |

### Database

| Technology | Purpose |
|------------|---------|
| MySQL | Relational database |
| JPA | Persistence specification |
| Hibernate | Entity-to-table mapping |
| SQL | Database querying and management |

### Development and Deployment Tools

| Tool | Purpose |
|------|---------|
| IntelliJ IDEA / Eclipse / VS Code | Development |
| Postman | API testing |
| Git | Version control |
| GitHub | Source-code hosting |
| Render | Backend deployment |
| Railway | Cloud MySQL hosting |

---

## System Architecture

NexHR follows a layered architecture to maintain separation of concerns and improve code maintainability.

```text
                         Frontend / API Client
                                  |
                                  v
                         REST Controller Layer
                                  |
                                  v
                            Service Layer
                                  |
                                  v
                          Repository Layer
                                  |
                                  v
                            MySQL Database
```

### Architecture Flow

```text
HTTP Request
     |
     v
Controller
     |
     v
Service
     |
     v
Repository
     |
     v
Database
     |
     v
Repository
     |
     v
Service
     |
     v
Controller
     |
     v
HTTP Response
```

### Controller Layer

The controller layer is responsible for handling incoming HTTP requests and returning HTTP responses.

Responsibilities:

- Define API endpoints
- Receive request data
- Validate request payloads
- Call service methods
- Return appropriate HTTP responses

Controllers should focus on request handling rather than containing complex business logic.

### Service Layer

The service layer contains the application's business logic.

Responsibilities:

- Apply business rules
- Process application workflows
- Validate business conditions
- Coordinate repository operations
- Manage transactions where required

For example, leave approval rules should be processed in the service layer.

### Repository Layer

The repository layer communicates with the database.

Responsibilities:

- Save records
- Retrieve records
- Update records
- Delete records
- Execute database queries

Spring Data JPA reduces repetitive database-access code.

### Entity Layer

The entity layer represents database tables using Java classes.

Example:

```java
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
```

### Security Layer

The security layer handles:

- User authentication
- JWT validation
- Password verification
- Request authorization
- Protected endpoint access

---

## Application Modules

The application is organized into functional modules.

```text
NexHR
│
├── Authentication
│   ├── Registration
│   ├── Login
│   ├── JWT Generation
│   └── JWT Validation
│
├── Employee Management
│   ├── Create Employee
│   ├── View Employee
│   ├── Update Employee
│   └── Delete Employee
│
├── Department Management
│   ├── Create Department
│   ├── View Departments
│   └── Employee Assignment
│
├── Leave Management
│   ├── Apply Leave
│   ├── View Leave Requests
│   ├── Approve Leave
│   └── Reject Leave
│
├── Attendance Management
│   ├── Record Attendance
│   ├── View Attendance
│   └── Attendance History
│
├── Recruitment Management
│   ├── Job Openings
│   ├── Candidate Records
│   └── Application Tracking
│
└── Dashboard
    ├── Employee Statistics
    ├── Leave Statistics
    └── HR Summaries
```

> This structure should be adjusted according to the modules actually implemented in the source code.

---

## Authentication and Authorization

NexHR uses JWT-based authentication for securing REST APIs.

### Authentication Flow

```text
User enters login credentials
             |
             v
Login endpoint receives credentials
             |
             v
Backend validates the credentials
             |
             v
Password is verified
             |
             v
JWT token is generated
             |
             v
Token is returned to the client
             |
             v
Client sends token with future requests
             |
             v
Spring Security validates the token
             |
             v
Request is authorized or rejected
```

### Login Request

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Login Response

Example response:

```json
{
  "token": "generated-jwt-token",
  "message": "Login successful"
}
```

The exact request and response structure depends on the implementation.

### Sending the JWT Token

For protected endpoints, the client sends the token using the `Authorization` header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication vs Authorization

| Concept | Meaning |
|---------|---------|
| Authentication | Verifies who the user is |
| Authorization | Verifies what the user is allowed to access |

For example:

- Login validates the user's identity.
- Role-based authorization determines whether the user can approve a leave request.

### Why JWT?

JWT is useful for REST APIs because:

- It supports stateless authentication.
- It works well with separate frontend and backend applications.
- It avoids maintaining a traditional server-side session for every request.
- It can contain user identity and role-related claims.
- It is suitable for distributed applications when implemented securely.

---

## Database Design

NexHR uses MySQL as its relational database.

A typical database structure may contain tables such as:

```text
users
employees
departments
leave_requests
attendance
job_openings
candidates
applications
```

The exact table names depend on the entities implemented in the project.

### Example Entity Relationships

```text
Department
    |
    | One-to-Many
    v
Employees
    |
    | One-to-Many
    v
Leave Requests
```

Recruitment relationship:

```text
Job Opening
    |
    | One-to-Many
    v
Applications
    |
    | Many-to-One
    v
Candidate
```

### Why MySQL?

MySQL was selected because:

- HR data is structured and relational.
- Employee and department relationships are naturally represented using relational tables.
- It supports primary keys and foreign keys.
- It supports transactions.
- It provides persistent storage.
- It integrates well with Spring Data JPA and Hibernate.
- It is widely used in enterprise applications.

### JPA and Hibernate

JPA defines a standard way to map Java objects to relational database tables.

Hibernate is the ORM implementation used to perform operations such as:

- Mapping entities to tables
- Persisting objects
- Retrieving records
- Updating records
- Managing relationships

---

## Project Structure

The backend follows a modular Spring Boot project structure.

```text
springboot-backend/
│
├── .mvn/
│   └── wrapper/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── yourpackage/
│   │   │           └── nexhr/
│   │   │               │
│   │   │               ├── NexHrApplication.java
│   │   │               │
│   │   │               ├── config/
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   └── OtherConfig.java
│   │   │               │
│   │   │               ├── controller/
│   │   │               │   ├── AuthController.java
│   │   │               │   ├── EmployeeController.java
│   │   │               │   └── ...
│   │   │               │
│   │   │               ├── service/
│   │   │               │   ├── AuthService.java
│   │   │               │   ├── EmployeeService.java
│   │   │               │   └── ...
│   │   │               │
│   │   │               ├── repository/
│   │   │               │   ├── UserRepository.java
│   │   │               │   ├── EmployeeRepository.java
│   │   │               │   └── ...
│   │   │               │
│   │   │               ├── entity/
│   │   │               │   ├── User.java
│   │   │               │   ├── Employee.java
│   │   │               │   └── ...
│   │   │               │
│   │   │               ├── dto/
│   │   │               │   ├── LoginRequest.java
│   │   │               │   ├── LoginResponse.java
│   │   │               │   └── ...
│   │   │               │
│   │   │               ├── security/
│   │   │               │   ├── JwtService.java
│   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │               │   └── ...
│   │   │               │
│   │   │               └── exception/
│   │   │                   ├── GlobalExceptionHandler.java
│   │   │                   └── ...
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │
│   └── test/
│       └── java/
│
├── .gitignore
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

### Layer Responsibilities

| Package | Responsibility |
|---------|----------------|
| `controller` | Handles HTTP requests |
| `service` | Contains business logic |
| `repository` | Communicates with the database |
| `entity` | Defines database entities |
| `dto` | Transfers request and response data |
| `security` | Handles JWT and security logic |
| `config` | Stores application configuration |
| `exception` | Handles application exceptions |

---

## API Documentation

The following endpoints represent the expected API organization.

> Verify the exact endpoint paths in the controller classes before publishing this documentation.

### Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/auth/me` | Retrieve authenticated user details |

### Employee APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/employees` | Retrieve all employees |
| `GET` | `/api/employees/{id}` | Retrieve an employee by ID |
| `POST` | `/api/employees` | Create a new employee |
| `PUT` | `/api/employees/{id}` | Update employee information |
| `DELETE` | `/api/employees/{id}` | Delete an employee |

### Department APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/departments` | Retrieve all departments |
| `GET` | `/api/departments/{id}` | Retrieve a department by ID |
| `POST` | `/api/departments` | Create a department |
| `PUT` | `/api/departments/{id}` | Update a department |
| `DELETE` | `/api/departments/{id}` | Delete a department |

### Leave APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaves` | Retrieve leave requests |
| `GET` | `/api/leaves/{id}` | Retrieve a leave request |
| `POST` | `/api/leaves` | Apply for leave |
| `PUT` | `/api/leaves/{id}` | Update leave information |
| `DELETE` | `/api/leaves/{id}` | Delete a leave request |

### Attendance APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/attendance` | Retrieve attendance records |
| `GET` | `/api/attendance/{id}` | Retrieve attendance by ID |
| `POST` | `/api/attendance` | Create an attendance record |
| `PUT` | `/api/attendance/{id}` | Update attendance |
| `DELETE` | `/api/attendance/{id}` | Delete attendance |

---

## Configuration

The application uses environment-based configuration to keep deployment-specific values and sensitive credentials outside the source code.

### Example `application.properties`

```properties
server.port=${PORT:8080}

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update

app.jwt.secret=${JWT_SECRET}
app.jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}
```

### Configuration Explanation

| Property | Description |
|----------|-------------|
| `server.port` | Uses the hosting platform's port or defaults to `8080` |
| `spring.datasource.url` | MySQL JDBC connection URL |
| `spring.datasource.username` | Database username |
| `spring.datasource.password` | Database password |
| `spring.jpa.hibernate.ddl-auto` | Controls Hibernate schema behavior |
| `app.jwt.secret` | Secret used to sign JWT tokens |
| `app.jwt.expiration-ms` | JWT expiration duration in milliseconds |

### Optional Hibernate Dialect

Hibernate can generally detect the MySQL dialect automatically.

Therefore, this property is usually unnecessary:

```properties
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

If it is already present and working, it is not generally a critical issue, but it can be removed in modern Hibernate configurations.

---

## Environment Variables

### Local Development

For local development, the application may use a local MySQL database.

Example:

```env
DB_URL=jdbc:mysql://localhost:3306/nexhr
DB_USERNAME=root
DB_PASSWORD=your_local_mysql_password

JWT_SECRET=your_long_random_secret
JWT_EXPIRATION_MS=86400000
```

### Production Environment

For production, use a cloud-hosted MySQL database such as Railway.

Example:

```env
DB_URL=jdbc:mysql://YOUR_RAILWAY_PUBLIC_HOST:YOUR_RAILWAY_PUBLIC_PORT/YOUR_DATABASE
DB_USERNAME=YOUR_RAILWAY_USERNAME
DB_PASSWORD=YOUR_RAILWAY_PASSWORD

JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET
JWT_EXPIRATION_MS=86400000
```

### Important Environment Variable Rules

- Never commit `.env` files to GitHub.
- Never hardcode production passwords.
- Never expose JWT secrets.
- Never share database credentials publicly.
- Use separate credentials for local and production environments.
- Ensure the variable names match the names used in `application.properties`.

---

## Prerequisites

Before running the application, install the following:

- Java 17 or later
- Maven or Maven Wrapper
- MySQL 8 or a compatible version
- Git
- Postman, optionally
- An IDE such as IntelliJ IDEA, Eclipse, or VS Code

### Verify Java

```bash
java -version
```

### Verify Maven

```bash
mvn -version
```

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Navigate into the backend directory:

```bash
cd springboot-backend
```

### 2. Create the MySQL Database

Open MySQL and execute:

```sql
CREATE DATABASE nexhr;
```

### 3. Configure the Database

For local development, configure your database connection using environment variables or your local configuration.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/nexhr
spring.datasource.username=root
spring.datasource.password=your_password
```

For production, use the cloud database URL provided by Railway or another MySQL hosting provider.

### 4. Install Dependencies

Using Maven Wrapper on Windows:

```bash
mvnw.cmd clean install
```

Using Maven Wrapper on Linux or macOS:

```bash
./mvnw clean install
```

Using installed Maven:

```bash
mvn clean install
```

---

## Running the Application

### Run Using Maven Wrapper

#### Windows

```bash
mvnw.cmd spring-boot:run
```

#### Linux/macOS

```bash
./mvnw spring-boot:run
```

### Run Using Maven

```bash
mvn spring-boot:run
```

### Build the Application

```bash
mvn clean package
```

### Run the Generated JAR

```bash
java -jar target/your-application-name.jar
```

The backend will normally be available at:

```text
http://localhost:8080
```

The actual port depends on the configured `server.port` value.

---

## Testing the APIs

Postman can be used to test the REST APIs.

### Recommended Testing Flow

1. Register a user.
2. Log in using the registered credentials.
3. Copy the JWT token from the login response.
4. Open a protected API endpoint.
5. Add the token to the Authorization header.
6. Send the request.
7. Verify the response.
8. Verify database changes when applicable.

### Example Public Request

```http
GET http://localhost:8080/api/employees
```

### Example Protected Request

```http
GET http://localhost:8080/api/employees
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example JSON Request

```http
POST http://localhost:8080/api/employees
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "department": "Engineering"
}
```

The exact JSON fields depend on the employee entity and DTO implemented in the project.

---

## Deployment

The backend can be deployed to Render and connected to a cloud-hosted MySQL database on Railway.

### Production Architecture

```text
                         Frontend
                            |
                            v
                    Render Spring Boot API
                            |
                            v
                    Railway MySQL Database
```

### Deployment Flow

```text
Developer
    |
    v
GitHub Repository
    |
    v
Render Build Process
    |
    v
Spring Boot Application
    |
    v
Cloud MySQL Database
```

### Deploying to Render

1. Push the backend source code to GitHub.
2. Log in to Render.
3. Create a new Web Service.
4. Connect your GitHub repository.
5. Select the backend project.
6. Configure the build command.
7. Configure the start command.
8. Add environment variables.
9. Deploy the service.
10. Review deployment logs.
11. Test the live API.

### Example Build Command

```bash
./mvnw clean package -DskipTests
```

Depending on the Render environment, the build command may need to be adjusted.

### Example Start Command

```bash
java -jar target/*.jar
```

The exact command may need to match the generated JAR filename.

### Required Render Environment Variables

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
```

### Important Database Configuration

A deployed backend cannot use your local computer's MySQL database through `localhost`.

This will not work in production:

```text
jdbc:mysql://localhost:3306/nexhr
```

For Render, use a publicly reachable cloud database:

```text
jdbc:mysql://RAILWAY_PUBLIC_HOST:RAILWAY_PUBLIC_PORT/RAILWAY_DATABASE
```

---

## Railway MySQL Configuration

Railway can be used to host the production MySQL database.

### Railway Setup

1. Open Railway.
2. Create a new project.
3. Select **Provision MySQL**.
4. Wait for the database service to become available.
5. Open the MySQL service.
6. Open the Variables or Connect section.
7. Copy the public host, port, database name, username, and password.

### JDBC URL Format

The Spring Boot JDBC URL follows this format:

```text
jdbc:mysql://HOST:PORT/DATABASE
```

Example:

```text
jdbc:mysql://your-railway-host:12345/railway
```

Replace the example values with the actual Railway connection details.

### Render Database Variables

```text
DB_URL=jdbc:mysql://YOUR_RAILWAY_PUBLIC_HOST:YOUR_RAILWAY_PUBLIC_PORT/YOUR_DATABASE
DB_USERNAME=YOUR_RAILWAY_USERNAME
DB_PASSWORD=YOUR_RAILWAY_PASSWORD
```

> Use the public Railway host and public port when the backend is hosted on Render.

---

## Migrating the Local Database

If the local MySQL database already contains data, export and import it into the cloud database.

### Export Using phpMyAdmin

1. Open phpMyAdmin:

```text
http://localhost/phpmyadmin
```

2. Select the local database.
3. Click **Export**.
4. Select **Quick** export.
5. Choose the SQL format.
6. Click **Export**.

This will download an SQL file.

### Importing the SQL File

The SQL file can be imported into the cloud database using a supported database client such as:

- MySQL Workbench
- MySQL command-line client
- Railway-compatible database tools

Example command:

```bash
mysql -h YOUR_RAILWAY_HOST -P YOUR_RAILWAY_PORT -u YOUR_RAILWAY_USERNAME -p YOUR_DATABASE_NAME < nexhr.sql
```

You will be prompted to enter the database password.

Replace all placeholders before running the command.

---

## Production Configuration

The production environment should use secure and externally managed configuration.

### Recommended Production Configuration

```properties
server.port=${PORT:8080}

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update

app.jwt.secret=${JWT_SECRET}
app.jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}
```

### Production Recommendations

- Use a dedicated database user instead of the MySQL root user.
- Use a strong JWT secret.
- Enable SSL for database connections when required.
- Avoid exposing sensitive configuration in logs.
- Restrict CORS to trusted frontend origins.
- Use HTTPS in production.
- Use database backups.
- Avoid using `ddl-auto=update` blindly in critical production systems.
- Prefer database migration tools such as Flyway or Liquibase for controlled schema changes.
- Enable monitoring and application logging.

---

## Security Practices

NexHR follows security-oriented backend practices.

### Password Hashing

Passwords should never be stored as plain text.

A password encoder such as BCrypt can be used:

```java
PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
```

### JWT Secret Protection

The JWT secret should be stored as an environment variable:

```properties
app.jwt.secret=${JWT_SECRET}
```

It should not be hardcoded in the source code.

### Protected APIs

Protected endpoints require a valid JWT token.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Input Validation

Incoming request data should be validated before processing.

Examples include:

- Required fields
- Email format
- Valid dates
- Valid IDs
- Valid leave duration
- Duplicate record prevention

### Database Security

- Use environment variables for credentials.
- Avoid using the root database user in production.
- Use strong database passwords.
- Restrict database access where possible.
- Use encrypted connections when required.
- Do not expose database credentials in GitHub.

### CORS

When the frontend and backend are hosted on different domains, CORS must be configured correctly.

For production, allow only trusted frontend origins instead of allowing all origins.

---

## Error Handling

The backend should return meaningful HTTP status codes and structured error responses.

| Status Code | Meaning |
|-------------|---------|
| `200 OK` | Request completed successfully |
| `201 Created` | Resource created successfully |
| `204 No Content` | Request succeeded without a response body |
| `400 Bad Request` | Invalid request data |
| `401 Unauthorized` | Authentication is missing or invalid |
| `403 Forbidden` | User does not have permission |
| `404 Not Found` | Requested resource does not exist |
| `409 Conflict` | Request conflicts with existing data |
| `500 Internal Server Error` | Unexpected server-side error |

### Example Error Response

```json
{
  "status": 404,
  "message": "Employee not found",
  "timestamp": "2026-09-18T12:00:00"
}
```

The actual error response structure depends on the exception-handling implementation.

---

## Challenges and Solutions

### 1. Local Database Connectivity During Deployment

#### Challenge

The application worked locally using a MySQL connection such as:

```text
jdbc:mysql://localhost:3306/nexhr
```

However, this connection failed after deployment because `localhost` on Render refers to the Render container, not the developer's local computer.

#### Solution

A cloud-hosted MySQL database was configured using Railway. The production database connection details were added to Render environment variables.

---

### 2. Protecting Sensitive Credentials

#### Challenge

Hardcoding database credentials and JWT secrets in source code creates security risks.

#### Solution

Sensitive values were externalized using environment variables:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
app.jwt.secret=${JWT_SECRET}
```

---

### 3. Cloud Port Configuration

#### Challenge

Cloud hosting platforms may assign a port dynamically through the `PORT` environment variable.

#### Solution

The application was configured using:

```properties
server.port=${PORT:8080}
```

This allows the application to use the cloud-provided port while retaining port `8080` as the local default.

---

### 4. Maintaining Separation of Concerns

#### Challenge

Putting all application logic inside controllers makes the code difficult to maintain and test.

#### Solution

The application follows a layered structure:

```text
Controller → Service → Repository → Database
```

This separation improves readability, maintainability, testing, and scalability.

---

### 5. Managing Relational Data

#### Challenge

HR systems contain relationships between employees, departments, leave requests, attendance records, and other entities.

#### Solution

MySQL, JPA, and Hibernate were used to represent relational data through entity classes and relationships.

---

## Future Enhancements

The following features can be added in future versions:

- Refresh-token authentication
- Password reset functionality
- Email notifications
- Employee document management
- Payroll management
- Performance review management
- Advanced attendance analytics
- Leave balance calculation
- Audit logs
- Pagination and sorting
- Advanced filtering and search
- Swagger/OpenAPI documentation
- Unit and integration testing
- CI/CD pipeline
- Docker containerization
- Cloud file storage
- Real-time notifications
- Multi-organization support
- Employee self-service portal
- Reporting and analytics dashboard

---

## Learning Outcomes

This project helped develop practical knowledge of:

### Java and Spring Boot

- Spring Boot application development
- REST controller creation
- Dependency injection
- Service and repository patterns
- Application configuration
- Exception handling
- Backend project organization

### Database Development

- MySQL database management
- SQL queries
- Entity relationships
- JPA and Hibernate
- CRUD operations
- Database connectivity
- Relational data modeling

### Security

- Spring Security
- JWT authentication
- Password hashing
- Role-based authorization
- Protected API endpoints
- Secure configuration management

### Deployment

- Git and GitHub
- Cloud deployment
- Render configuration
- Railway database hosting
- Environment variables
- Production debugging
- Cloud database connectivity

### Software Engineering

- Layered architecture
- Separation of concerns
- REST API design
- Maintainable project structure
- Error handling
- Configuration management
- Deployment troubleshooting

---

## Project Demonstration

### Backend

- Backend Framework: Spring Boot
- Database: MySQL
- Authentication: JWT
- API Style: REST
- Deployment: Render

### Database

- Local Development Database: MySQL
- Production Database: Railway MySQL

### API Testing

Recommended tool:

- Postman

---

## Author

**Dhruv Talati**

- GitHub: `https://github.com/DhruvTalati`


---

## License

This project is developed for educational and portfolio purposes.

You may modify and extend the project according to your requirements.
