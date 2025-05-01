# Task Management System - Requirements Specification

## Project Overview

The project is a Task Management System (TMS) that allows users to manage tasks and projects efficiently. It includes a React-based frontend and an Express.js-based backend. The system supports user authentication, task and project management, and user preferences.

## Functional Requirements

### 1. User Authentication

**Registration:**
- Users can register with a username, email, and password
- Passwords are hashed before storage
- Duplicate usernames or emails are not allowed

**Login:**
- Users can log in using their email and password
- A JWT token is issued upon successful login

**Profile Management:**
- Users can update their username, email, and password
- Changing the password requires the current password for verification
- Duplicate usernames or emails are not allowed during updates

**Logout:**
- Users can log out, which clears the token from local storage

### 2. Task Management

**Create Task:**
- Users can create tasks with the following attributes:
  - Title (required)
  - Description
  - Status (todo, in-progress, completed)
  - Priority (low, medium, high)
  - Due Date
  - Associated Project (optional)

**View Tasks:**
- Users can view all their tasks in either a list or grid view
- Tasks can be filtered by:
  - Status
  - Priority
  - Associated Project
- Tasks can be sorted by:
  - Due Date
  - Priority
  - Status
  - Created Date

**Edit Task:**
- Users can update task details, including title, description, status, priority, due date, and associated project

**Delete Task:**
- Users can delete tasks

### 3. Project Management

**Create Project:**
- Users can create projects with the following attributes:
  - Name (required)
  - Description
  - Status (planning, in-progress, completed, on-hold)
  - Deadline

**View Projects:**
- Users can view all their projects in either a list or grid view
- Projects can be filtered by status
- Projects can be sorted by:
  - Deadline
  - Status
  - Created Date

**Edit Project:**
- Users can update project details, including name, description, status, and deadline

**Delete Project:**
- Users can delete projects

**View Project Tasks:**
- Users can view all tasks associated with a specific project

### 4. Dashboard

**Statistics:**
- Display the total number of tasks and projects
- Show the number of completed tasks and active projects
- Calculate and display the task completion rate

**Recent Items:**
- Display the 5 most recent tasks
- Display the 3 most recent projects

### 5. User Preferences

- Users can customize the following preferences:
  - Theme (light, dark, system)
  - Default task view (list, grid)
  - Default project view (list, grid)
  - Default task sort (dueDate, priority, createdAt)
  - Default project sort (deadline, status, createdAt)
- Preferences are saved in local storage and applied automatically

## Non-Functional Requirements

### 1. Performance

- The system should handle up to 100 concurrent users without significant performance degradation
- API responses should be returned within 500ms under normal load

### 2. Security

- Passwords must be hashed using bcrypt
- JWT tokens must be used for authentication and should expire after 24 hours
- Sensitive data (e.g., JWT secret, database URI) must be stored in environment variables

### 3. Scalability

- The backend should be designed to support future features like team collaboration and notifications

### 4. Usability

- The UI should be responsive and work seamlessly on desktop and mobile devices
- Error messages should be user-friendly and descriptive

### 5. Maintainability

- The codebase should follow best practices for modularity and readability
- ESLint should be used to enforce coding standards

## System Architecture

### 1. Frontend

- Framework: React
- State Management: Context API
- Routing: React Router
- Styling: CSS Modules
- Build Tool: Vite

**Key Components:**
- Dashboard: Displays user statistics and recent items
- Tasks: Manages tasks with filtering, sorting, and CRUD operations
- Projects: Manages projects with filtering, sorting, and CRUD operations
- Profile: Allows users to update their profile and preferences
- Auth: Handles login and registration

### 2. Backend

- Framework: Express.js
- Database: MongoDB
- Authentication: JWT

**Key Features:**
- Middleware for authentication and error handling
- RESTful APIs for tasks, projects, and user management
- Models for User, Task, and Project

## API Endpoints

### 1. Authentication

- POST /api/auth/register: Register a new user
- POST /api/auth/login: Log in a user
- GET /api/auth/me: Get the current user's details
- PUT /api/auth/profile: Update the user's profile

### 2. Tasks

- GET /api/tasks: Get all tasks for the current user
- POST /api/tasks: Create a new task
- GET /api/tasks/:id: Get a specific task by ID
- PUT /api/tasks/:id: Update a task by ID
- DELETE /api/tasks/:id: Delete a task by ID

### 3. Projects

- GET /api/projects: Get all projects for the current user
- POST /api/projects: Create a new project
- GET /api/projects/:id: Get a specific project by ID
- PUT /api/projects/:id: Update a project by ID
- DELETE /api/projects/:id: Delete a project by ID
- GET /api/projects/:id/tasks: Get all tasks for a specific project

## Data Models

### 1. User

- username: String (required, unique)
- email: String (required, unique)
- password: String (hashed)
- timestamps: CreatedAt, UpdatedAt

### 2. Task

- title: String (required)
- description: String
- status: Enum (todo, in-progress, completed)
- priority: Enum (low, medium, high)
- dueDate: Date
- completed: Boolean (default: false)
- project: Reference to Project
- user: Reference to User
- timestamps: CreatedAt, UpdatedAt

### 3. Project

- name: String (required)
- description: String
- status: Enum (planning, in-progress, completed, on-hold)
- startDate: Date (default: now)
- deadline: Date
- user: Reference to User
- timestamps: CreatedAt, UpdatedAt

## Other Requirements

### 1. Frontend

- Hosted on a static hosting service like Vercel or Netlify
- Build command: npm run build

### 2. Backend

- Hosted on a cloud platform like Heroku or AWS
- Environment variables:
  - MONGODB_URI: MongoDB connection string
  - JWT_SECRET: Secret key for JWT

## Future Enhancements

- Add team collaboration features
- Implement notifications for task deadlines
- Add support for file attachments in tasks and projects
- Integrate analytics for user activity

This document outlines the requirements and architecture of the Task Management System. It serves as a reference for developers, testers, and stakeholders.
