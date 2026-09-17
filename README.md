<div align="center">

# NexHR

### Modern Full-Stack Human Resource Management System

A secure and scalable HR platform for managing employees, attendance, leave requests, documents, and organizational operations from one centralized dashboard.

<br />

![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Language-Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<br />

[Features](#-features) •
[Architecture](#-system-architecture) •
[Installation](#-installation-and-setup) •
[API](#-api-overview) •
[Deployment](#-deployment) •
[Author](#-author)

</div>

---

## About NexHR

**NexHR** is a full-stack Human Resource Management System designed to digitize and simplify everyday HR operations.

Traditional HR workflows often involve spreadsheets, disconnected records, manual attendance tracking, and difficult-to-manage leave processes. NexHR brings these activities into a unified platform with a modern interface, secure authentication, structured APIs, and a centralized relational database.

The application is built with:

- **React.js** for a responsive and interactive frontend
- **Spring Boot** for RESTful backend services
- **Spring Security and JWT** for authentication and authorization
- **MySQL** for persistent data storage
- **JPA/Hibernate** for database interaction

NexHR is designed to demonstrate real-world full-stack development practices, including frontend-backend integration, role-based access, CRUD operations, document handling, and environment-based configuration.

---

## Why NexHR?

NexHR focuses on solving common HR management challenges:

| Challenge | NexHR Solution |
|---|---|
| Scattered employee information | Centralized employee database |
| Manual attendance records | Digital attendance management |
| Unorganized leave requests | Structured leave workflow |
| Difficult document access | Employee document management |
| Unauthorized system access | JWT authentication and role-based authorization |
| Disconnected HR operations | Unified dashboard and modular architecture |

---

## ✨ Features

### 🔐 Authentication and Authorization

- Secure login functionality
- JWT-based authentication
- Protected routes and API endpoints
- Role-based access control
- Separate administrative and employee access
- Secure handling of authentication credentials
- Token-based communication between frontend and backend

### 👥 Employee Management

- Create employee records
- View all employees
- View detailed employee profiles
- Update employee information
- Delete employee records
- Search and filter employees
- Manage employee contact and professional details
- Maintain department and designation information

### 📊 HR Dashboard

- Centralized HR overview
- Employee statistics
- Attendance information
- Leave-related summaries
- Quick access to major HR modules
- Organized navigation for administrative operations

### 🕒 Attendance Management

- Record employee attendance
- Track attendance status
- Manage check-in and check-out information
- View attendance records
- Access attendance history
- Support attendance-related HR workflows

### 📝 Leave Management

- Submit leave requests
- View submitted leave requests
- Track leave request status
- Approve or reject leave requests
- Manage leave balances
- Maintain leave history
- Support structured employee leave workflows

### 📁 Document Management

- Upload employee documents
- Associate documents with employees
- Store important HR files
- View available documents
- Download documents when authorized
- Maintain organized employee document records

### 🔔 Notifications

- Display important system updates
- Show relevant HR notifications
- Provide updates related to leave and administrative actions
- Improve communication between users and HR administrators

### 📚 API Documentation

- RESTful backend APIs
- Swagger/OpenAPI integration
- Interactive API documentation
- Easier development and API testing
- Clear separation between frontend and backend responsibilities

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | Component-based user interface |
| JavaScript | Application logic |
| HTML5 | Page structure |
| CSS3 | Styling and layout |
| Bootstrap / Custom CSS | Responsive UI design |
| Axios | HTTP requests |
| React Router | Client-side routing |

### Backend

| Technology | Purpose |
|---|---|
| Java | Backend programming language |
| Spring Boot | Backend application framework |
| Spring Web | REST API development |
| Spring Data JPA | Database access |
| Hibernate | ORM and persistence |
| Spring Security | Application security |
| JWT | Authentication and authorization |
| Maven | Dependency management and build automation |

### Database and Tools

| Technology | Purpose |
|---|---|
| MySQL | Relational database |
| MySQL Workbench | Database management |
| Swagger / OpenAPI | API documentation |
| Postman | API testing |
| Git | Version control |
| GitHub | Source code hosting |
| VS Code / IntelliJ IDEA | Development environment |

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │       End User          │
                         │   Admin / Employee      │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     React Frontend      │
                         │                         │
                         │  Dashboard              │
                         │  Employee Management    │
                         │  Attendance             │
                         │  Leave Management       │
                         │  Documents              │
                         │  Notifications          │
                         └────────────┬────────────┘
                                      │
                                      │ HTTP / REST API
                                      │ JWT Authorization
                                      ▼
                         ┌─────────────────────────┐
                         │    Spring Boot API      │
                         │                         │
                         │  Controllers            │
                         │  Services               │
                         │  Repositories           │
                         │  Security               │
                         │  Validation             │
                         │  Business Logic         │
                         └────────────┬────────────┘
                                      │
                                      │ JPA / Hibernate
                                      ▼
                         ┌─────────────────────────┐
                         │       MySQL Database    │
                         │                         │
                         │  Users                  │
                         │  Employees              │
                         │  Attendance             │
                         │  Leave Requests         │
                         │  Leave Balances         │
                         │  Documents              │
                         │  Notifications          │
                         └─────────────────────────┘
```

---

## 🧩 Application Modules

```text
NexHR
│
├── Authentication Module
│   ├── Login
│   ├── JWT Token Handling
│   └── Role-Based Access
│
├── Employee Module
│   ├── Add Employee
│   ├── View Employees
│   ├── Update Employee
│   └── Delete Employee
│
├── Attendance Module
│   ├── Attendance Records
│   ├── Check-In / Check-Out
│   └── Attendance History
│
├── Leave Module
│   ├── Apply for Leave
│   ├── Leave Approval
│   ├── Leave Rejection
│   └── Leave Balance
│
├── Document Module
│   ├── Upload Documents
│   ├── View Documents
│   └── Download Documents
│
├── Notification Module
│   └── HR Notifications
│
└── Dashboard Module
    └── HR Statistics and Summaries
```

---

## 📂 Project Structure

```text
NexHR/
│
├── react-frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── assets/
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── springboot-backend/
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── ...
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   │
│   │   └── test/
│   │
│   ├── pom.xml
│   ├── .env.example
│   └── uploads/
│
├── .gitignore
└── README.md
```

> The exact package names and internal folders may vary according to the implementation.

---

## 🔄 Application Workflow

```text
User opens the application
          │
          ▼
Authentication page
          │
          ▼
Credentials submitted
          │
          ▼
Spring Boot validates credentials
          │
          ▼
JWT token generated
          │
          ▼
Frontend stores authentication state
          │
          ▼
Protected dashboard becomes accessible
          │
          ▼
User performs HR operations
          │
          ▼
React sends REST API request
          │
          ▼
Spring Boot validates token and permissions
          │
          ▼
Business logic is executed
          │
          ▼
MySQL data is created / updated / retrieved
          │
          ▼
Response is returned to React
          │
          ▼
UI updates with the latest information
```

---

## 🔒 Security Implementation

NexHR follows a security-oriented architecture for protecting application data and restricted operations.

### Security Measures

- JWT-based authentication
- Protected API endpoints
- Role-based authorization
- Authentication filters
- Secure password handling
- CORS configuration
- Environment-based configuration
- Restricted document access
- Separation of authentication and business logic
- Server-side validation of requests

### Environment Security

Sensitive configuration values are not committed to the repository.

Examples of sensitive values include:

```text
Database passwords
JWT signing secrets
Administrator passwords
Production credentials
Private API keys
```

The repository contains `.env.example` files with placeholder values only.

---

## 🗃️ Database Design

The system uses MySQL as its relational database.

The database is responsible for storing and managing information related to:

- Users
- Employees
- Departments
- Attendance records
- Leave requests
- Leave balances
- Documents
- Notifications

The backend uses Spring Data JPA and Hibernate to map Java entities to relational database tables.

---

## 🚀 Installation and Setup

### Prerequisites

Install the following before running the project:

- Java JDK 17 or later
- Node.js
- npm
- MySQL Server
- MySQL Workbench
- Git
- Maven or Maven Wrapper

Verify your installations:

```bash
java -version
node -v
npm -v
mysql --version
```

---

### 1. Clone the Repository

```bash
git clone https://github.com/DhruvTalati/NexHR.git
```

Navigate into the project:

```bash
cd NexHR
```

---

### 2. Create the MySQL Database

Open MySQL Workbench or the MySQL command line.

Create the database:

```sql
CREATE DATABASE employee_management_system;
```

---

### 3. Configure the Backend

Navigate to the backend folder:

```bash
cd springboot-backend
```

Create a local `.env` file using `.env.example` as a reference.

Example:

```env
DB_URL=jdbc:mysql://localhost:3306/employee_management_system
DB_USERNAME=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD

JWT_SECRET=YOUR_LONG_RANDOM_JWT_SECRET
JWT_EXPIRATION_MS=86400000

CORS_ALLOWED_ORIGIN=http://localhost:3000

ADMIN_EMAIL=admin@ems.local
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD

FILE_STORAGE_LOCATION=./uploads/documents
MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=12MB
```

> Do not commit the real `.env` file to GitHub.

---

### 4. Run the Backend

From the `springboot-backend` directory:

#### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

#### macOS / Linux

```bash
./mvnw spring-boot:run
```

#### Using installed Maven

```bash
mvn spring-boot:run
```

The backend will run at:

```text
http://localhost:8080
```

---

### 5. Open Swagger Documentation

If Swagger is enabled, open:

```text
http://localhost:8080/swagger-ui/index.html
```

Alternative path:

```text
http://localhost:8080/swagger-ui.html
```

Swagger can be used to inspect and test the available REST APIs.

---

### 6. Configure the Frontend

Open a new terminal and navigate to the frontend:

```bash
cd react-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:8080
```

> Use the exact environment variable name expected by the frontend implementation.

---

### 7. Start the Frontend

```bash
npm start
```

The frontend will generally run at:

```text
http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `DB_URL` | Yes | MySQL JDBC connection URL |
| `DB_USERNAME` | Yes | MySQL database username |
| `DB_PASSWORD` | Yes | MySQL database password |
| `JWT_SECRET` | Yes | Secret used for signing JWT tokens |
| `JWT_EXPIRATION_MS` | No | JWT expiration time in milliseconds |
| `CORS_ALLOWED_ORIGIN` | Yes | Frontend URL allowed by CORS |
| `ADMIN_EMAIL` | No | Initial administrator email |
| `ADMIN_PASSWORD` | Yes | Initial administrator password |
| `FILE_STORAGE_LOCATION` | No | Storage location for uploaded documents |
| `MAX_FILE_SIZE` | No | Maximum size of an individual file |
| `MAX_REQUEST_SIZE` | No | Maximum size of a multipart request |

### Frontend Environment Variables

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Base URL of the Spring Boot backend |

---

## 📡 API Overview

The backend exposes REST APIs for the major application modules.

| API Module | Operations |
|---|---|
| Authentication | Login and authentication |
| Employees | Create, read, update, and delete employees |
| Attendance | Record and retrieve attendance |
| Leaves | Apply, view, approve, and reject leave requests |
| Leave Balances | View and manage leave balances |
| Documents | Upload, view, and download documents |
| Notifications | Retrieve system notifications |
| Users | Manage users and roles |

The complete API documentation can be accessed through Swagger after starting the backend.

---

## 🧪 Testing

The APIs can be tested using:

- Swagger UI
- Postman
- Browser developer tools
- Frontend integration testing

Recommended testing areas:

- Login with valid credentials
- Login with invalid credentials
- Protected route access
- Employee CRUD operations
- Attendance creation and retrieval
- Leave request submission
- Leave approval and rejection
- Document upload and access
- Unauthorized API requests
- Invalid or missing request data

---

## 🌍 Deployment Architecture

NexHR can be deployed using separate services for the frontend, backend, and database.

```text
                         ┌──────────────────────┐
                         │   React Frontend      │
                         │   Vercel / Hosting    │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS REST API
                                    ▼
                         ┌──────────────────────┐
                         │  Spring Boot Backend │
                         │  Render / Cloud Host │
                         └──────────┬───────────┘
                                    │
                                    │ Database Connection
                                    ▼
                         ┌──────────────────────┐
                         │    MySQL Database    │
                         │ Railway / Cloud DB   │
                         └──────────────────────┘
```

### Production Configuration

For deployment:

- Configure production environment variables in the hosting platform
- Set the frontend API URL to the deployed backend URL
- Configure backend CORS for the deployed frontend domain
- Use a production database
- Use a strong JWT secret
- Never commit production credentials
- Configure persistent storage for uploaded documents when required
- Use HTTPS in production

---

## 📸 Screenshots

Add screenshots of the application below.

Recommended screenshots:

1. Login page
2. Admin dashboard
3. Employee management page
4. Add employee form
5. Employee profile
6. Attendance management
7. Leave management
8. Document management
9. Notifications
10. Swagger API documentation

Example:

```markdown
![NexHR Dashboard](screenshots/dashboard.png)
```

---

## 📈 Future Enhancements

Planned improvements for NexHR include:

- Employee self-service portal
- Payroll management
- Recruitment and applicant tracking
- Performance management
- Employee appraisal system
- Advanced HR analytics
- PDF and Excel report generation
- Email notifications
- Calendar integration
- Automated attendance integration
- Cloud-based document storage
- Audit logs
- Two-factor authentication
- Multi-organization support
- Improved mobile responsiveness

---

## 🎯 Key Learning Outcomes

This project demonstrates practical knowledge of:

- Full-stack web application development
- React component architecture
- RESTful API development
- Spring Boot application design
- Spring Security
- JWT authentication
- Role-based authorization
- MySQL database integration
- JPA and Hibernate
- CRUD operations
- File upload handling
- Frontend-backend communication
- Environment-based secret management
- API documentation with Swagger
- Git and GitHub
- Deployment architecture

---

## 🤝 Contributing

Contributions and suggestions are welcome.

### Contribution Steps

1. Fork the repository.
2. Clone your fork.

```bash
git clone https://github.com/YOUR_USERNAME/NexHR.git
```

3. Create a feature branch.

```bash
git checkout -b feature/your-feature-name
```

4. Make your changes.
5. Commit your changes.

```bash
git commit -m "Add: your feature description"
```

6. Push the branch.

```bash
git push origin feature/your-feature-name
```

7. Open a Pull Request.

---

## 📄 License

This project is intended for educational, portfolio, and demonstration purposes.

A formal open-source license may be added in the future.

---

## 👨‍💻 Author

<div align="center">

### Dhruv Talati

B.Tech Information Technology Student  
Full-Stack Developer

**Specializing in:** React.js • Java • Spring Boot • MySQL • REST APIs

<br />

[![GitHub](https://img.shields.io/badge/GitHub-DhruvTalati-181717?style=for-the-badge&logo=github)](https://github.com/DhruvTalati)

</div>

---

<div align="center">

### ⭐ If you find NexHR useful, consider starring the repository!

Built with dedication using React, Spring Boot, Java, and MySQL.

</div>
