# TechWing AI Tutor — Project Context & Build Log

> **Last Updated**: 2026-05-23  
> **Status**: Phase 1 — Foundation Build  
> **Platform**: AI-Powered Educational SaaS

---

## 📋 Project Overview

**TechWing AI Tutor** is a production-ready, AI-powered educational SaaS platform designed to replace traditional tuition systems. It provides a complete AI learning ecosystem for schools, students, parents, and teachers.

### Core Concept
- Multi-tenant platform serving thousands of schools
- AI-first architecture with Gemini API + RAG
- Complete replacement for traditional tuition
- Supports 5 user roles with strict RBAC

---

## 🏗️ Architecture

### Tech Stack — Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14+ (App Router) | Framework, SSR, API Routes |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling (user requested) |
| shadcn/ui | Latest | Component library |
| Framer Motion | Latest | Animations |
| Zustand | Latest | Client state management |
| TanStack Query | Latest | Server state / data fetching |
| Recharts | Latest | Charts & analytics |
| Lucide React | Latest | Icon system |

### Tech Stack — Backend (Phase 2+)
| Technology | Purpose |
|-----------|---------|
| Next.js API Routes | API layer (Phase 1) |
| Express.js | Microservices (Phase 3+) |
| Prisma ORM | Database ORM (Implemented SQLite for local prototype) |
| PostgreSQL | Primary database (Planned) |
| Redis | Caching, sessions |
| ChromaDB | Vector database for RAG |
| LangChain.js | AI orchestration |
| Gemini API | LLM backbone |

### Design System
- **Theme**: Glassmorphic — inspired by reference image
- **Primary BG**: `#0a1628` (deep navy) → `#0d2137` → `#134e5e`
- **Glass Cards**: `rgba(255,255,255,0.05)` + `backdrop-blur`
- **Accent Teal**: `#00d4aa`
- **Accent Cyan**: `#0ea5e9`  
- **Accent Coral**: `#f97066`
- **Font**: Inter (body) + JetBrains Mono (code)
- **Dark/Light mode** via CSS variables + `next-themes`

---

## 👥 User Roles & Access

| Role | Login Method | Tenant Scope |
|------|-------------|-------------|
| Student | Student ID + Password | School-specific |
| Parent | Phone + OTP | School-specific (child's school) |
| Teacher | Email + Password | School-specific |
| School Admin | Email + Password | School-specific |
| Super Admin | Email + Password + 2FA | Platform-wide |

---

## 🗂️ Folder Structure

```
g:\TechWing\AI Tutor\ai-tutor\
├── prisma/                     # Database schema
│   └── schema.prisma
├── public/                     # Static assets
│   └── assets/
├── src/
│   ├── app/
│   │   ├── (landing)/          # Public landing page
│   │   ├── (auth)/             # Login/register
│   │   ├── (dashboard)/        # Protected dashboards
│   │   │   ├── student/        # Student dashboard + sub-pages
│   │   │   ├── parent/         # Parent dashboard
│   │   │   ├── teacher/        # Teacher dashboard
│   │   │   ├── admin/          # School admin dashboard
│   │   │   └── super-admin/    # Platform admin dashboard
│   │   ├── api/                # API routes
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── layout/             # Sidebar, Navbar, etc.
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── charts/             # Chart components
│   │   ├── ai/                 # AI chat interface
│   │   └── landing/            # Landing page sections
│   ├── lib/
│   │   ├── auth/               # JWT, RBAC middleware
│   │   ├── db/                 # Prisma client
│   │   ├── ai/                 # AI service (Phase 2)
│   │   ├── mock-data/          # Mock data for Phase 1
│   │   ├── utils/              # Helper functions
│   │   └── constants/          # App-wide constants
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types/interfaces
├── tailwind.config.ts
├── next.config.js/ts
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema (Multi-Tenant)

### Core Entity Relationships
```
School (tenant root)
├── User (role: student | parent | teacher | admin)
│   ├── StudentProfile
│   ├── ParentProfile → links to StudentProfile(s)
│   └── TeacherProfile
├── Class
│   ├── Section
│   ├── Subject
│   └── ClassEnrollment (student ↔ class)
├── Syllabus → Subject
├── Material (PDFs, notes) → Subject
├── Assignment → Class + Subject
├── Exam / Quiz → Class + Subject
├── Attendance → Student + Class
├── Announcement
└── AI Tables
    ├── AIConversation → Student
    ├── AIMessage → AIConversation
    ├── StudySession → Student
    └── PerformanceMetric → Student + Subject
```

### Multi-Tenancy Strategy
- **Row-level isolation** via `schoolId` foreign key on all tables
- API middleware enforces `WHERE schoolId = currentUser.schoolId`
- Super Admin bypasses tenant filter

---

## 🎨 Design Decisions

1. **Glassmorphism over flat design**: Matches modern SaaS aesthetics and reference image
2. **shadcn/ui**: Accessible, customizable, tree-shakeable components
3. **App Router**: Future-proof, supports RSC, layouts, parallel routes
4. **Zustand over Redux**: Simpler API, less boilerplate, sufficient for our needs
5. **Mock data first**: Enables full UI development without backend dependency
6. **Monolith → Microservices**: Start with Next.js API routes, extract later for scale

---

## 📊 API Routes (Phase 1)

```
Auth:
  POST /api/auth/login
  POST /api/auth/register
  POST /api/auth/logout
  GET  /api/auth/me

Student:
  GET  /api/students/dashboard
  GET  /api/students/subjects
  GET  /api/students/analytics
  GET  /api/students/assignments
  POST /api/students/ai-chat

Parent:
  GET  /api/parents/child-progress
  GET  /api/parents/reports
  GET  /api/parents/activity

Teacher:
  GET  /api/teachers/classes
  GET  /api/teachers/students
  POST /api/teachers/materials
  POST /api/teachers/assignments

Admin:
  GET  /api/admin/overview
  CRUD /api/admin/students
  CRUD /api/admin/teachers
  CRUD /api/admin/classes

Super Admin:
  GET  /api/super-admin/schools
  GET  /api/super-admin/analytics
  GET  /api/super-admin/system
```

---

## 🚀 Phased Delivery

| Phase | Scope | Status |
|-------|-------|--------|
| **1** | Landing + Auth + 5 Dashboards + Design System | ✅ Completed |
| **1.5**| Database Migration (SQLite + Prisma) & Student Portal APIs | ✅ Completed |
| **2** | AI Tutor (Gemini + RAG + ChromaDB) + Real AI Features | 🔄 Next Phase |
| **3** | Analytics Engine + Cheating Detection + Notifications | ⏳ Planned |
| **4** | Live Classes (Google Meet) + WebSockets | ⏳ Planned |
| **5** | Multilingual + WhatsApp/Email + Production Hardening | ⏳ Planned |

---

## 📝 Build Log

### Session 1 — 2026-05-23

#### Step 1: Project Initialization
- Created Next.js 14+ project with App Router, TypeScript, Tailwind CSS, ESLint
- Directory: `g:\TechWing\AI Tutor\ai-tutor\`
- Package manager: npm

#### Step 2: Design System Setup
- Tailwind config with custom glassmorphic color palette
- Global CSS with glass utilities, animations, typography
- shadcn/ui initialization

#### Step 3: Core Components
- GlassCard, StatCard, Sidebar, Navbar, ThemeToggle
- Dashboard layout wrapper
- Chart components with glassmorphic styling

#### Step 4: Landing Page ✅
- 10 section premium landing page with Framer Motion animations
- Hero: animated counters, dashboard preview with bar chart animation
- AI Chat Demo: interactive chat preview showing math tutoring
- Feature grid, testimonials, pricing tiers, FAQ accordion, CTA
- Mobile-responsive with hamburger menu

#### Step 5: Auth System ✅
- Login page with 5-role tab selector (Student, Parent, Teacher, Admin, Super Admin)
- Student: Student ID + Password with show/hide toggle
- Parent: Phone + 6-digit OTP input
- Teacher/Admin/Super Admin: Email + Password
- Loading spinner on submit, auto-redirect to dashboard

#### Step 6: Student Dashboard ✅
- 4 stat cards (Study Hours, Quizzes, Exam Readiness, Streak)
- Performance trend area chart + subject bar chart
- Quick AI Tutor chat widget with recent conversations
- Exam readiness radial progress (3 subjects)
- Subject list with progress bars and grades
- Assignments list with status badges
- Class leaderboard (top 5)

#### Step 7: Parent Dashboard ✅
- 4 stat cards (Grade, Study Hours, Attendance, Assignments)
- Weekly study activity chart
- Weak subject alerts with severity badges
- Subject performance with progress bars
- AI insight query ("Ask AI About Your Child") with suggested questions
- Daily activity timeline
- Assignment status tracker

#### Step 8: Teacher Dashboard ✅
- 4 stat cards (Students, Classes, Pending Reviews, Avg Score)
- Class performance trend chart
- Class management grid (4 classes with student count/avg score)
- AI Teaching Tools panel (Generate Papers, Create Quiz, Upload, Live Class)
- Weak students alert panel
- Upcoming live classes

#### Step 9: School Admin Dashboard ✅
- 4 stat cards (Students, Teachers, Classes, AI Sessions)
- Quick action buttons (Add Student, Add Teacher, Announcement, Settings)
- School performance area chart + attendance bar chart
- Student enrollment table with search and AI usage badges
- Announcements panel with priority badges
- School overview info panel

#### Step 10: Super Admin Dashboard ✅
- 4 stat cards (Schools, Users, AI Tokens, Revenue)
- Platform growth area chart (schools + users)
- Schools management table (5 schools with plan/status/AI usage bars)
- System health indicators (6 metrics: API, DB, AI, Storage, Redis, WebSocket)
- Platform metrics panel (DAU, queries, response time, storage, subscriptions)
- Audit log with color-coded entries

#### Build Verification ✅
- `npm run build` — **SUCCESS** (15.2s compile, 0 errors)
- All 8 routes generated as static pages
- TypeScript type checking passed
- Next.js 16.2.6 with Turbopack

---

### Session 2 — Backend Infrastructure & Real-Time Student Portal

#### Step 1: Database Setup
- Installed Prisma ORM and configured SQLite (`dev.db`).
- Designed the full educational data model: `User`, `Subject`, `Module`, `Topic`, `TopicProgress`, `Quiz`, `Question`, `QuizAttempt`, `Assignment`, `AssignmentSubmission`.
- Created a singleton `PrismaClient` to handle database connections efficiently in Next.js development.

#### Step 2: Seeding Data
- Replaced mock JSON arrays with a real `prisma/seed.ts` script.
- Populated the database with "Arjun Reddy" as a student.
- Created fully relational subjects (Math, Science), units, topics, and multi-question quizzes with correct answers stored securely.

#### Step 3: API Route Implementation
- **Quizzes**: `GET /api/quizzes`, `GET /api/quizzes/[id]`, `POST /api/quizzes/submit` (secure backend grading).
- **Assignments**: `GET /api/assignments`, `POST /api/assignments/upload` (handling `multipart/form-data` and writing physical files to `/public/uploads`).
- **Syllabus**: `GET /api/syllabus` (fetching topic progress), `POST /api/syllabus/complete` (completing topics and automatically unlocking the next sequential topic).

#### Step 4: Frontend API Integration
- Entirely rewrote `StudentQuizzesPage` to load questions individually from the API and submit attempts for a backend-calculated score.
- Rewrote `StudentAssignmentsPage` to replace simulated uploads with a native `<input type="file">` sending form data to the server.
- Rewrote `StudentSubjectsPage` and the AI Tutor sidebar (`SyllabusAccordion`) to stream live completion statuses directly from the SQLite database.

---

## 🔐 Security Considerations

- JWT tokens with short expiry + refresh tokens
- RBAC middleware on all API routes
- Tenant isolation enforced at API layer
- Input sanitization on all forms
- CSRF protection via SameSite cookies
- Rate limiting on auth endpoints (Phase 3)
- Content Security Policy headers (Phase 5)
- **Quiz Integrity**: Correct answers are kept strictly on the backend (`/api/quizzes/submit`) and are stripped from the frontend payloads.

---

## 🔗 Key Dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "framer-motion": "^11.x",
  "@prisma/client": "^5.x",
  "@tanstack/react-query": "^5.x",
  "recharts": "^2.x",
  "lucide-react": "^0.x",
  "next-themes": "^0.x"
}
```
