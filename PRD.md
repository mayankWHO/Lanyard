# Product Requirements Document (PRD)

## Lanyard – AI-Powered Execution Intelligence Platform
---

## 1. Product Overview
**Product Name:** Lanyard
**Version:** 1.0.0
**Product Type:** Full‑stack Project Execution & Intelligence Platform

Lanyard is an AI‑assisted project execution platform designed to help teams not just _manage_ work, but finish projects successfully. The system combines structured project management, opinionated execution rules, and contextual AI intelligence to detect risks early, reduce planning friction, and continuously improve how teams execute.

Unlike traditional project management tools that focus on task tracking, Lanyard focuses on **execution health, decision clarity, and outcome prediction**.

---

## 2. Target Users
- **System Admins:** Own platform-level configuration and global governance
- **Project Admins (Leads / Managers):** Plan work, manage execution, resolve risks
- **Team Members (Contributors):** Execute tasks, update progress, collaborate
---

## 3. Core Backend Capabilities
### 3.1 Authentication Routes (`/api/v1/auth/`)
- `POST /register`  – Register a new user
- `POST /login`  – User authentication
- `POST /logout`  – User logout (requires authentication)
- `GET /current-user`  – Get current user info (requires authentication)
- `POST /change-password`  – Change password (requires authentication)
- `POST /refresh-token`  – Refresh access token
- `GET /verify-email/:verificationToken`  – Email verification
- `POST /forgot-password`  – Request password reset
- `POST /reset-password/:accessToken`  – Reset forgotten password
- `POST /resend-email-verification`  – Resend verification email (requires authentication)
### 3.2 Project Routes (`/api/v1/projects/`)
- `GET /`  – List user projects
- `POST /`  – Create project
- `GET /:projectId`  – Get project details
- `PUT /:projectId`  – Update project (Admin only)
- `DELETE /:projectId`  – Delete project (Admin only)
- `GET /:projectId/members`  – List project members
- `POST /:projectId/members`  – Add member (Admin only)
- `PUT /:projectId/members/:userId`  – Update member role (Admin only)
- `DELETE /:projectId/members/:userId`  – Remove member (Admin only)
### 3.3 Task & Subtask Routes (`/api/v1/tasks/`)
- `GET /:projectId`  – List project tasks
- `POST /:projectId`  – Create task (Admin / Project Admin)
- `GET /:projectId/t/:taskId`  – Get task details
- `PUT /:projectId/t/:taskId`  – Update task
- `DELETE /:projectId/t/:taskId`  – Delete task
- `POST /:projectId/t/:taskId/subtasks`  – Create subtask
- `PUT /:projectId/st/:subTaskId`  – Update subtask
- `DELETE /:projectId/st/:subTaskId`  – Delete subtask
### 3.4 Note Routes (`/api/v1/notes/`)
- `GET /:projectId`  – List project notes
- `POST /:projectId`  – Create note (Admin only)
- `GET /:projectId/n/:noteId`  – Get note details
- `PUT /:projectId/n/:noteId`  – Update note (Admin only)
- `DELETE /:projectId/n/:noteId`  – Delete note (Admin only)
### 3.5 System Health
- `GET /api/v1/healthcheck/`  – System health status
### 3.6 Permission Matrix
| Feature | Admin | Project Admin | Member |
| ----- | ----- | ----- | ----- |
| Create Project | ✓ | ✗ | ✗ |
| Update/Delete Project | ✓ | ✗ | ✗ |
| Manage Project Members | ✓ | ✗ | ✗ |
| Create/Update/Delete Tasks | ✓ | ✓ | ✗ |
| View Tasks | ✓ | ✓ | ✓ |
| Update Subtask Status | ✓ | ✓ | ✓ |
| Create/Delete Subtasks | ✓ | ✓ | ✗ |
| Create/Update/Delete Notes | ✓ | ✗ | ✗ |
| View Notes | ✓ | ✓ | ✓ |
### 3.7 Data Models


**User Roles:**



- `admin` - Full system access
- `project_admin` - Project-level administrative access


- `member` - Basic project member access


**Task Status:**



-  `todo` - Task not started
- `in_progress` - Task currently being worked on
- `done` - Task completed
---

## 4. Frontend Product Scope
### 4.1 Frontend Architecture
- **Framework:** React + TypeScript (or Next.js)
- **State Management:** React Query + lightweight global store
- **Authentication:** JWT with silent refresh
- **Authorization:** UI-level permission gating aligned with backend RBAC
- **Design System:** Component-driven, accessibility-first
---

### 4.2 Core Screens & UX Flows
#### 4.2.1 Authentication & Account Flow
- Login / Register / Email Verification
- Password reset & recovery
- Clear verification and role-state messaging
---

#### 4.2.2 Global Dashboard
**Purpose:** Immediate execution awareness across all projects

**Features:**

- Project cards with:
    - Completion percentage
    - Risk indicator (AI-generated)
    - Member count

- “My Tasks” quick access
- Overloaded user warnings
---

#### 4.2.3 Project Workspace
Tabbed interface:

- **Overview:** Execution summary, risks, key notes
- **Tasks:** Kanban + List views
- **Notes:** Structured documentation & decisions
- **Members:** Role and workload visibility (Admin only)
---

#### 4.2.4 Task Management Experience
- Kanban drag-and-drop workflow (Todo → In Progress → Done)
- Inline task editing
- Subtask checklists with progress calculation
- File preview & attachment handling
- Personal “Assigned to Me” view
---

#### 4.2.5 Notes & Knowledge UI
- Markdown editor
- Pin important notes
- AI-generated summaries
- Decision highlighting
---

## 5. AI Intelligence Layer 
The AI layer extends the existing REST architecture and follows the **same route-specification format** used across the backend. All AI endpoints are deterministic and domain-scoped and return structured JSON outputs that integrate directly into core workflows.

### 5.1 AI Task Intelligence Routes (`/api/v1/ai/tasks/`)
- `POST /breakdown`  – Generate task intent, definition of done, and suggested subtasks
- `POST /refine`  – Improve task clarity, detect ambiguity, and suggest missing details
- `POST /suggest-assignee`  – Suggest optimal assignee based on workload and history 
---

### 5.2 AI Project Intelligence Routes (`/api/v1/ai/projects/`)
- `GET /:projectId/summary`  – Generate project execution summary and recommendations
- `GET /:projectId/risk`  – Compute execution risk score with explanations
- `GET /:projectId/workload`  – Analyze contributor workload and bottlenecks
- `POST /:projectId/postmortem`  – Generate AI-driven project postmortem
---

### 5.3 AI Notes & Decision Intelligence Routes (`/api/v1/ai/notes/`)
- `POST /summarize`  – Summarize notes and extract action items
- `POST /extract-decisions`  – Identify and log key project decisions automatically
---

### 5.1 AI Task Intelligence Routes
#### Generate Task Breakdown & Intent
```
POST /api/v1/ai/tasks/breakdown
```
**Purpose:** Convert vague tasks into executable plans.

**Capabilities:**

- Generate task intent (goal, expected outcome, definition of done)
- Propose ordered subtasks
- Improve task clarity at creation time
---

#### Refine Existing Task
```
POST /api/v1/ai/tasks/refine
```
**Purpose:** Detect ambiguity, missing details, or poorly scoped tasks and suggest improvements.

---

### 5.2 Project Execution Intelligence Routes
#### Project Execution Summary
```
GET /api/v1/ai/projects/:projectId/summary
```
**Generates:**

- Completion overview
- Blocked or stagnating tasks
- Workload imbalance
- Recommended corrective actions
---

#### Execution Risk Scoring
```
GET /api/v1/ai/projects/:projectId/risk
```
**Outputs:**

- Risk level (Low / Medium / High)
- Numeric risk score
- Human-readable explanations
This endpoint acts as the **core execution health signal** across dashboards and project views.

---

### 5.3 Notes & Decision Intelligence Routes
#### Notes Summarization & Action Extraction
```
POST /api/v1/ai/notes/summarize
```
**Capabilities:**

- Summarize long-form notes
- Extract action items
- Identify key decisions
---

#### Decision Extraction
```
POST /api/v1/ai/notes/extract-decisions
```
**Purpose:** Automatically build and maintain a project decision log.

---

### 5.4 Workload & Time Intelligence Routes
#### Workload Analysis
```
GET /api/v1/ai/projects/:projectId/workload
```
**Infers:**

- Contributor load
- Task aging patterns
- Execution bottlenecks
This operates without explicit time tracking.

---

### 5.5 Project Retrospective Intelligence
#### Generate Project Postmortem
```
POST /api/v1/ai/projects/:projectId/postmortem
```
**Generates:**

- What went well
- What caused delays
- Structural execution issues
- Actionable improvements
---

### 5.2 Task Intent & Semantic Layer
Each task stores:

- Goal (why it exists)
- Expected outcome
- Definition of done
AI assists in generating and validating these fields.

---

### 5.3 Project Execution Summary (AI)
**Generates:**

- Overall progress summary
- Blockers & risks
- Team workload imbalance
Displayed on project overview and dashboard.

---

### 5.4 Execution Risk Engine
**Continuously evaluates:**

- Long-stagnant tasks
- Unassigned critical work
- Overloaded contributors
- Blocker language in notes
**Outputs:**

- Risk score (Low / Medium / High)
- Human-readable explanations
---

### 5.5 AI Notes Digest & Decision Extraction
- Summarizes long notes into actionable points
- Extracts architectural/execution decisions
- Builds a project decision log automatically
---

### 5.6 Passive Time Intelligence
Without explicit time tracking, AI infers:

- Task ageing
- State transition delays
- Context switching patterns
Provides insights without micromanagement.

---

### 5.7 Project Postmortem Generator
On project completion or closure, AI generates:

- What went well
- What caused delays
- Structural improvements
- Execution anti-patterns
---

## 6. AI Route Permission Matrix
All AI endpoints are protected by authentication and enforce role-based access control consistent with core backend rules. AI actions that affect project-wide insights or historical analysis are restricted to elevated roles.

| AI Capability | Admin | Project Admin | Member |
| ----- | ----- | ----- | ----- |
| Generate task breakdown (`POST /ai/tasks/breakdown`  | ✓ | ✓ | ✓ |
| Refine task (`POST /ai/tasks/refine`) | ✓ | ✓ | ✓ |
| Suggest assignee (`POST /ai/tasks/suggest-assignee`) | ✓ | ✓ | ✗ |
| Project execution summary (`GET /ai/projects/:projectId/summary`) | ✓ | ✓ | ✓ |
| Execution risk scoring (`GET /ai/projects/:projectId/risk`) | ✓ | ✓ | ✗ |
| Workload analysis (`GET /ai/projects/:projectId/workload`) | ✓ | ✓ | ✗ |
| Notes summarization (`POST /ai/notes/summarize`) | ✓ | ✓ | ✓ |
| Decision extraction (`POST /ai/notes/extract-decisions`) | ✓ | ✓ | ✗ |
| Generate project postmortem (`POST /ai/projects/:projectId/postmortem`) | ✓ | ✓ | ✗ |
---

## 6. Opinionated Execution Rules
- Soft limit on tasks per assignee
- Warning for tasks without subtasks
- Mandatory definition of done for critical tasks
- Flag projects with no notes or decisions
---

## 7. Security & Compliance
- JWT-based authentication with refresh tokens
- Role-based authorization middleware
- Input validation on all endpoints
- Email verification for account security
- Secure password reset functionality
- File upload security with Multer middleware
- CORS configuration for cross-origin requests
### 7.1 File Management
- Support for multiple file attachments on tasks
- Files stored in public/images directory
- File metadata tracking (URL, MIME type, size)
- Secure file upload handling
---

## 8. Success Metrics
- Reduction in stalled tasks
- Improved project completion rate
- Reduced planning time per task
- High adoption of AI-generated subtasks
- Actionable insights generated per project
- Secure user authentication and authorization system
- Complete project lifecycle management
- Hierarchical task and subtask organization
- Role-based access control implementation
- File attachment capability for enhanced collaboration
- Email notification system for user verification and password reset
- Comprehensive API documentation through endpoint structure
---







