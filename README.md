# IAMS - Intelligent Academic Management System

The Intelligent Academic Management System (IAMS) is a modern, full-stack application designed to streamline the academic, administrative, and financial operations of educational institutions. Built with the MERN stack (MongoDB, Express, React, Node.js), it offers a robust, multi-tenant architecture with granular role-based access control.It even has an AI assistant to help students with their academic queries.

## 🚀 Key Features by Role

The system is built around 5 distinct roles, ensuring everyone has access only to what they need.

### 1. Super Admin
The ultimate system controller, typically the IT administrator.
- **Institution Management**: Create and manage isolated educational institutions.
- **Manager Provisioning**: Appoint 'Managers' (e.g., Principals or Deans) to oversee specific institutions.
- **Audit Logging**: View system-wide audit logs to track who performed what action.

### 2. Manager
The operational head of an institution.
- **Academic Setup**: Create and manage Batches (e.g., 2023-2027), Branches (e.g., Computer Science), and Semesters.
- **Subject Management**: Define the curriculum by adding subjects to specific semesters.
- **Staff & Student Management**: Enroll students and create accounts for Teachers and Class Teachers.
- **Financial Operations**: Define fee structures and assign fees to batches.
- **Announcements**: Broadcast important notices to the entire institution.

### 3. Class Teacher
A teacher with additional administrative responsibilities for a specific branch/batch.
- **Teacher Assignment**: Assign normal Teachers to specific subjects within their assigned branch.
- **Student Management**: Oversee the students in their assigned branch.
- **Class-wide Announcements**: Send announcements specific to their branch.
- *Includes all regular Teacher privileges.*

### 4. Teacher
Academic staff responsible for delivering courses.
- **My Classes**: View the subjects they have been assigned to teach.
- **Attendance**: Mark daily or lecture-wise attendance for students in their assigned subjects.
- **Marks Management**: Upload and manage internal/external marks for their designated subjects.

### 5. Student
The end-users consuming the academic services.
- **Dashboard**: View personal academic profiles including assigned batch and branch.
- **Attendance Tracking**: Monitor complete attendance records subject-wise.
- **Fee Status**: View total fees, paid amounts, and due balances.
- **Results**: Check published marks and grades.
- **AI Assistant**: A secure, context-aware AI chatbot built into the platform to help students navigate the system and answer academic queries.

## 🏗️ Technical Architecture

### Frontend (React + Vite)
- **Framework**: React 18 powered by Vite for lightning-fast HMR and optimized builds.
- **Styling**: Tailwind CSS for a modern, responsive, and custom utility-first design system.
- **Routing**: `react-router-dom` with lazy-loading (`Suspense`) to split chunks based on user roles, ensuring users only download the code they are authorized to see.
- **State & Context**: Context API for global state management (e.g., AuthContext).

### Backend (Node.js + Express)
- **Architecture**: MVC (Model-View-Controller) pattern enhanced with a robust Service layer separating business logic from HTTP routing.
- **Security**:
  - JWT (JSON Web Tokens) with a short-lived Access Token and long-lived Refresh Token strategy.
  - Granular Role-Based Access Control (RBAC) middleware protecting specific routes.
- **Database**: MongoDB (via Mongoose).
  - Designed for multi-tenancy: Every core entity tracks its owning `institution` ID to ensure data isolation.
  - Complex relationships: e.g., Subjects belong to Semesters, which belong to Branches, which belong to Batches.

## 🛡️ Security & Scalability

- **Multi-Tenancy**: The database schema ensures that one institution's data is completely invisible to another, allowing the platform to serve multiple schools/colleges from a single deployment.
- **Audit Trails**: Critical actions (like promoting a semester or deactivating a user) generate immutable audit logs.
- **Soft Deletes**: Entities like Users, Batches, and Branches utilize `isActive` or `isArchived` flags instead of hard deletion to maintain data integrity and historical records.

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
