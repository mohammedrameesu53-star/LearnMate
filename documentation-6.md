# LearnMate — Project Overview & Architecture Reference

> **Purpose**: Concise, comprehensive context snapshot designed to onboard AI assistants (e.g. Claude) or developers without exceeding token limits.

---

## 1. Executive Summary & Tech Stack

**LearnMate** is a decoupled, role-based Learning Management System (LMS) with real-time collaboration and AI tutoring. It supports three distinct user roles: **Student**, **Mentor**, and **Admin**.

### Tech Stack
* **Backend Framework**: Django 6.0.x & Django REST Framework (DRF) 3.17.x
* **Real-time WebSockets**: Django Channels + Daphne ASGI Server (`channels_redis` layer)
* **Background Processing**: Celery Workers & Celery Beat (Redis message broker)
* **AI Integration**: OpenAI / AI Service integration (`backend/apps/ai`)
* **Database**: PostgreSQL (Production) / SQLite (`db.sqlite3` for Development)
* **Frontend Framework**: React 19.x + Vite 8.x + React Router DOM v7
* **Styling**: Tailwind CSS v4
* **API Client**: Axios 1.18.x with request/response interceptors for JWT auto-refresh

---

## 2. Directory Structure

```
learnmate-2/
├── backend/
│   ├── config/              # Django settings, ASGI/WSGI, root URL routing, Celery config
│   ├── apps/
│   │   ├── accounts/        # User model, Auth APIs, JWT, OTP, MFA (TOTP)
│   │   ├── profiles/        # Student & Mentor profile management
│   │   ├── courses/         # Courses, Modules, Lessons, Resources, Enrollments, Progress
│   │   ├── chat/            # WebSockets direct/group chat, message history
│   │   ├── adminpanel/      # Admin analytics, user management, course moderation endpoints
│   │   └── ai/              # AI Tutor API endpoint & service integration
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── api.js           # Axios instance with auth interceptors
    │   ├── context/         # AuthContext (state & token management)
    │   ├── pages/
    │   │   ├── auth/        # Login, Register, Verify OTP, MFA pages
    │   │   ├── dashboards/  # Role-based dashboards (Student, Mentor, Admin)
    │   │   ├── courses/     # Catalog, Detail, Classroom/Player views
    │   │   └── chat/        # Real-time messaging UI
    │   └── components/      # Navbar, Sidebar, ProtectedRoutes, UI elements
    └── package.json
```

---

## 3. Core Features & Role Capabilities

| Role | Key Features |
| :--- | :--- |
| **Student** | Browse/Search courses, Enroll, Video/Lesson player, Track course progress, Real-time chat (Mentors/Peers), AI Tutor chatbot, Profile management |
| **Mentor** | Create & edit courses, Manage modules & video lessons, Attach learning materials, View student enrollments & course metrics, Direct chat with students |
| **Admin** | User management (activate/deactivate, role assignment), Course moderation & approval, Platform analytics & metrics, Audit logs |

---

## 4. Backend Database Schemas & App Models

### `accounts` App
* **`User`** (`AbstractUser`, UUID PK): `email` (login identifier), `role` (`student` | `mentor` | `admin`), `is_verified` (Boolean), `mfa_enabled` (Boolean), `mfa_secret` (TOTP seed).
* **`OTP`**: `user`, `code` (6 digits), `otp_type` (`email_verification`, `login`, `password_reset`), `created_at`, `is_used`.

### `profiles` App
* **`StudentProfile`**: `user` (1-to-1), `headline`, `bio`, `avatar`, `interests`, `github_url`, `linkedin_url`.
* **`MentorProfile`**: `user` (1-to-1), `headline`, `expertise`, `years_of_experience`, `bio`, `avatar`, `is_approved`.

### `courses` App
* **`Course`**: `title`, `slug`, `description`, `instructor` (`User`), `thumbnail`, `category`, `level` (`beginner`, `intermediate`, `advanced`), `is_published`, `created_at`.
* **`Module`**: `course` (FK), `title`, `order`.
* **`Lesson`**: `module` (FK), `title`, `content`, `video_url`, `duration`, `order`, `is_free_preview`.
* **`LessonResource`**: `lesson` (FK), `title`, `file`/`url`.
* **`Enrollment`**: `student` (`User`), `course` (FK), `enrolled_at`, `completed`.
* **`LessonProgress`**: `student` (`User`), `lesson` (FK), `completed` (Boolean), `updated_at`.

### `chat` App
* **`ChatRoom`**: `is_group` (Boolean), `name`, `created_at`.
* **`GroupMember`**: `room` (FK), `user` (FK), `role` (`admin`/`member`), `joined_at`.
* **`Message`**: `room` (FK), `sender` (`User`), `content`, `timestamp`, `is_read`.

### `ai` App
* **Services**: `AIService` - calls AI providers (e.g. OpenAI/Gemini) to provide AI tutoring responses to student queries.

---

## 5. Security & Authentication Flow

1. **Authentication**: JWT token rotation via SimpleJWT (`/api/accounts/token/`, `/api/accounts/token/refresh/`).
2. **Email Verification & OTP**: 6-digit temporal OTP sent via Brevo SMTP on registration.
3. **MFA (TOTP)**: 2FA support using `pyotp` and QR code base64 generation. When enabled, login requires a 6-digit TOTP code.
4. **Role-Based Permissions**: Custom DRF permissions (`IsStudent`, `IsMentor`, `IsAdmin`, `IsCourseInstructor`) guard API endpoints.

---

## 6. HTTP REST API Summary

### Accounts & Auth (`/api/accounts/`)
* `POST /register/` - Student / Mentor registration
* `POST /verify-otp/` - Email verification via OTP
* `POST /resend-otp/` - Resend verification email
* `POST /login/` - Login (returns JWTs or MFA prompt)
* `POST /mfa/setup/` & `/mfa/verify/` - TOTP 2FA setup/verification
* `POST /token/refresh/` - Obtain new access token

### Profiles (`/api/profiles/`)
* `GET/PUT /student/me/` - Retrieve / update active student profile
* `GET/PUT /mentor/me/` - Retrieve / update active mentor profile

### Courses (`/api/courses/`)
* `GET /` - List published courses (filterable by category, level, query)
* `GET /{slug}/` - Detailed course view with module/lesson breakdown
* `POST /` - Create course (Mentor/Admin)
* `POST /{id}/enroll/` - Enroll student in course
* `POST /lessons/{id}/complete/` - Mark lesson progress

### Real-Time Chat (`/api/chat/`) & WebSockets
* `GET /rooms/` - List user chat conversations
* `GET /rooms/{id}/messages/` - Load chat message history
* `WebSocket /ws/chat/{room_id}/?token=<JWT>` - Live messaging connection

### Admin Panel (`/api/adminpanel/`)
* `GET /users/` & `PATCH /users/{id}/` - Manage platform users & roles
* `GET /courses/` & `PATCH /courses/{id}/approve/` - Moderate course submissions
* `GET /analytics/` - Platform statistics (total users, enrollments, active courses)

### AI Tutor (`/api/ai/`)
* `POST /chat/` - Student prompt -> AI tutor response (`{"message": "..."}`)

---

## 7. Frontend Client State & Page Map

* **`AuthContext`**: Global authentication state, current user payload, JWT storage, role access methods.
* **`api.js`**: Centralized Axios client with request header injection (`Authorization: Bearer <token>`) and automatic token refresh logic.

### Key Routes
* `/login`, `/register`, `/verify-otp` - Auth pages
* `/dashboard/student` - Student home (enrolled courses, progress, recommendations)
* `/dashboard/mentor` - Mentor home (course creation, content management, analytics)
* `/dashboard/admin` - Admin overview (user & course moderation, metrics)
* `/courses` & `/courses/:slug` - Course catalog & detail view
* `/learn/:courseSlug/lesson/:lessonId` - Interactive lesson classroom player
* `/ai-tutor` - Interactive AI Tutor chat interface
* `/chat` - Direct & group messaging interface

---

## 8. Asynchronous Tasks (Celery & Beat)

* **Email Dispatch**: Background delivery of OTP codes and welcome emails (`accounts.tasks.send_otp_email`).
* **Reminder Schedules**: Celery Beat cron tasks for course inactivity reminders and periodic summary notifications.

---

## 9. Quick Development Commands

```bash
# Backend (Django Dev Server)
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Celery Worker (In separate terminal)
celery -A config worker --loglevel=info

# Frontend (Vite Dev Server)
cd frontend
npm install
npm run dev
```

---

*This document contains all essential technical architecture details of **LearnMate** needed for immediate context loading in new AI sessions.*
