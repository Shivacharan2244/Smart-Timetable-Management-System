# Smart Timetable Management System

An intelligent, full-stack college timetable management portal designed for academic institutions to generate, visualize, manage, and track class timetables, live classes, faculty assignments, and institutional meetings.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Secure JWT authentication with dedicated dashboards for **Admin** and **Faculty**.
- **Interactive Timetable Matrix**: Visual weekly schedule grid mapped by academic year, semester, department, and section.
- **Automated Timetable Ingestion**: Upload institutional PDF timetables with automated table parsing and database ingestion.
- **Live Class Tracking**: Real-time status updates (Scheduled, In-Progress, Completed, Rescheduled, Cancelled) with direct Google Meet integration.
- **Meeting Management**: Schedule departmental and institutional faculty meetings with room conflict detection.
- **Conflict Prevention Engine**: Intelligent validation to prevent faculty, room, and time slot double-booking.
- **Department & Academic Structure**: Comprehensive management for Departments, Academic Years, Semesters, Sections, Subjects, and Rooms.
- **Instant Alerts & Notifications**: System-wide notifications for schedule updates, cancellations, and announcements.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.3.4 (Java 21+)
- **Security**: Spring Security & JSON Web Token (JWT)
- **Persistence**: Spring Data JPA & Hibernate ORM
- **Database**: MySQL 8.0+
- **PDF Processing**: Apache PDFBox
- **Build Tool**: Apache Maven

### Frontend
- **Framework**: React 19 + Vite 8
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: Modern responsive CSS design system

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 21 or higher
- **Node.js**: v18 or higher & npm
- **Database**: MySQL server running on port 3306

### Database Configuration
Ensure MySQL has a database named `smart_timetable_db`:
```sql
CREATE DATABASE smart_timetable_db;
```
Configure your database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_timetable_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

### Running the Application

#### Option A: Running with Docker (Recommended for Containerized Setup)
Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running on your system, then run:
```bash
docker compose up --build
```
This boots up:
- **MySQL Container**: Port 3306 with initialized `smart_timetable_db`
- **Backend Container**: Port 8081 with Spring Boot application
- **Frontend Container**: Port 5173 with Nginx reverse proxy to API

To stop containers:
```bash
docker compose down
```

#### Option B: Running Locally

1. **Start the Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   *(On Windows: `.\mvnw.cmd spring-boot:run`)*
   The backend API runs at `http://localhost:8081/api`.

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend runs at `http://localhost:5173`.

Alternatively, from the project root:
```bash
npm run dev      # Starts Vite frontend
npm run backend  # Starts Spring Boot backend
```

---

## 🔐 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gmail.com` | `admin123` |
| **Faculty** | `faculty@gmail.com` | `faculty123` |
