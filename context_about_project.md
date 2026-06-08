# AI Tutor — Project Context and Architecture Documentation

This document serves as the single source of truth for the **AI Tutor** platform architecture, codebase structure, styling design tokens, database schema, and recent feature updates. Use this context when onboarding new developer agents or planning future feature implementations.

---

## 1. Project Overview & Technology Stack

**AI Tutor** is a multi-tenant, AI-powered educational platform designed for schools, admins, teachers, students, and parents.

* **Frontend Framework**: Next.js 16.2.6 (App Router + Turbopack)
* **Runtime**: React 19.2.4 & ReactDOM 19.2.4
* **Database & ORM**: PostgreSQL database connected via Prisma ORM (`@prisma/client`) with Neon serverless postgres adapter support
* **Authentication**: NextAuth.js (`next-auth`) with custom credentials login and role-based session handling
* **Styling**: Vanilla Tailwind CSS v4 + PostCSS with customized custom glassmorphism style classes
* **State Management**: Zustand store (`src/lib/store.ts`) for managing global client states (e.g. active sidebar tabs, school names, user role states)
* **Animation & Visuals**: Framer Motion for premium micro-animations and transitions; Lottie-Web for vector JSON animations
* **Icons**: Lucide React (`lucide-react`)
* **Toasts**: Sonner (`sonner`)

---

## 2. User Roles & Permission Matrices

The platform handles five distinct user roles defined in `prisma/schema.prisma` via the `Role` enum:

1. **`SUPERADMIN`**:
   - Manages schools (create/update schools, inspect system-wide diagnostics, audit logs).
   - Global dashboard access under `/super-admin/`.
2. **`SCHOOLADMIN`**:
   - Manages classes, sections, subjects, faculty registry, and student directory.
   - Assigns subjects to sections and delegates Class Teachers.
   - Operations reside under `/admin/` (e.g., `/admin/classes`, `/admin/students`, `/admin/teachers`).
3. **`TEACHER`**:
   - Views assigned classes, creates assignments, uploads study materials, posts announcements.
   - Tracks syllabus progress and student quiz performances.
   - Dashboards located under `/teacher/`.
4. **`STUDENT`**:
   - Consumes assignments, completes quizzes, chats with the personalized AI Tutor, accesses ebooks, and schedules study plans.
   - Sidebar contains a collapsible syllabus roadmap tree.
   - Interfaces situated under `/student/`.
5. **`PARENT`**:
   - Monitors their children's grades, syllabus completion rates, and test scores.
   - Direct communication line with teachers.
   - Dashboards placed under `/parent/`.

---

## 3. Database Schema Overview (`prisma/schema.prisma`)

Key database entities and relationships include:

```mermaid
erDiagram
    School ||--o{ User : registers
    School ||--o{ ClassRoom : operates
    School ||--o{ Subject : offers
    ClassRoom ||--o{ User : contains_students
    ClassRoom ||--|| User : assigned_class_teacher
    User ||--o{ User : parent_child_relation
    User ||--o{ Assignment : submits
    User ||--o{ TopicProgress : syllabus_progress
```

* **User Model**:
  - Contains role, email, password, profile particulars (`phone`, `employeeId`, `primarySubject`), and multi-tenant links (`schoolId`, `classId`, `parentId`).
  - Contains self-relation `ParentChild` (`parentId` mapping to a parent user record, and `children` mapping array of students).
* **ClassRoom Model**:
  - Maps to a single `School`.
  - Defines the specific standard (grade) and section (e.g., standard "8", section "A").
  - Linked to a `classTeacher` (`User` record of role `TEACHER`).
* **Subject Model**:
  - Represents study subjects offered to standard/grades.
  - Topics, chapters, and competencies fall under subjects.

---

## 4. Key Directory Structure

* `/src/app/`: The Next.js App Router root directory.
  - `/src/app/api/`: REST APIs for school dashboard components, resetting passwords, class creation, assigning subjects, and student onboarding.
  - `/src/app/admin/`: Admin console views (classes, student directory, teacher registry, settings).
  - `/src/app/teacher/`: Faculty workspaces.
  - `/src/app/student/`: Student hub including AI Tutor chatbot (`/student/ai-tutor`).
  - `/src/app/parent/`: Parent interface panels.
  - `/src/app/super-admin/`: Superadmin settings and moderation.
* `/src/components/`: Reusable react UI widgets.
  - `layout/`: App Shell wrappers, sidebars, header navigation.
  - `ui/`: Standardized tabs, custom alerts, modal containers.
* `/src/lib/`: Common libraries.
  - `auth.ts`: NextAuth configuration, credentials provider, token callback intercepts.
  - `prisma.ts`: Prisma database client initialization.
  - `store.ts`: Zustand hook store.
* `/prisma/`: Database migration definitions and seeds.

---

## 5. System Dashboards & Feature Maps

### 5.1 Platform Admin (Super Admin) Dashboard (`/super-admin`)
Designed for platform owners to administer schools, global systems, and content moderation:
* **Dashboard Overview (`/super-admin`)**: Displays KPIs including overall school counts, active platform subscriptions, total active students, and average AI response latency.
* **School Management (`/super-admin/schools` & `/super-admin/schools/[id]`)**: CRUD controls for school clients. Allows creating schools, generating unique code credentials, and modifying database tenants.
* **Global System Health (`/super-admin/system`)**: Displays server diagnostics, active database pooling connections, API metrics, and resource logs.
* **AI System Controls (`/super-admin/ai-system`)**: Monitors global LLM tokens, lets admins update central base system prompts, and monitors LLM cost trends.
* **Moderation Hub (`/super-admin/moderation`)**: Inspects content flagged by AI filters in student-teacher chat rooms and handles user account suspensions.

### 5.2 School Admin Dashboard (`/admin`)
Operational hub for managing school tenants, academic setups, and personnel:
* **Dashboard Overview (`/admin`)**: Summary of school metrics (total pupil enrollment, registered teacher logs, quick system notices).
* **Academic Workspace (`/admin/classes`)**: Master-detail workspace for standard/grade configuration:
  - **Class Standard Registry**: Build classes (e.g. Class 9, Class 10) and initialize their sections (A, B, C).
  - **Subject Management**: Define standards' subjects (name, code, display color tags).
  - **Class Teacher Assignment**: Form modals to assign school faculty to standard-section nodes.
* **Student Directory (`/admin/students`)**: Roster datatables supporting filter tabs (by standard, section, status). Incorporates a slide-over detail drawer displaying student profile information and their connected parent's contact records. Supports parent creation simultaneously.
* **Teacher Directory (`/admin/teachers`)**: Registry of school teachers, listing contact cards, primary subject specialities, and assigned teaching matrix.
* **School Announcements (`/admin/announcements`)**: Publish announcements targeting students, teachers, or parents directly.

### 5.3 Teacher Dashboard (`/teacher`)
Workspace for teachers to coordinate student syllabus roadmaps, grades, and resources:
* **Dashboard Overview (`/teacher`)**: Focuses on pending assignment grading items, class attendance averages, and upcoming schedule slots.
* **My Classes (`/teacher/classes`)**: Summary lists of standard-section groups assigned to the logged-in teacher.
* **Materials Manager (`/teacher/materials`)**: PDF/Doc resource coordinator allowing materials upload tagged with specific subject nodes.
* **Assignments Workspace (`/teacher/assignments`)**: Post school homework, review students' files submissions, return grades, and provide feedback.
* **AI Faculty Tools (`/teacher/ai-tools`)**: Automated helper utilizing LLMs to generate study syllabus notes and draft mock exam questionnaires.
* **Syllabus Progress (`/teacher/syllabus`)**: Dynamic interactive checklist of curriculum checkpoints. Checks off completed chapters, updating the students' maps.
* **Live Classes Coordinator (`/teacher/live-classes`)**: Launch video rooms.

### 5.4 Student Dashboard (`/student`)
Gamified AI learning space for students:
* **Dashboard Overview (`/student`)**: Displays streaking counters, quiz coins, syllabus progress charts, and daily task recommendations.
* **AI Tutor Chat (`/student/ai-tutor`)**: Dialogue portal to converse with the school's AI model. Includes a collapsible sidebar tree containing the syllabus checkpoint nodes.
* **Subjects Explorer (`/student/subjects`)**: Displays subject checkpoints, learning materials, and completed chapter badges.
* **Quizzes Portal (`/student/quizzes`)**: Interactive mock exams.
* **Assignments Tracker (`/student/assignments`)**: Homework log with digital file upload support.
* **Study Planner (`/student/study-planner`)**: Add and track targets.
* **Leaderboard (`/student/leaderboard`)**: Scoreboard ranking students by streak points.

### 5.5 Parent Dashboard (`/parent`)
Portal for parents to track children's progress:
* **Dashboard Overview (`/parent`)**: Consolidated overview showing children profile cards, notifications feed, and quick buttons.
* **Child Progress Tracker (`/parent/child-progress`)**: View details of a child's subject progress charts, streak statuses, and homework completions.
* **Performance Reports (`/parent/reports`)**: Printable report card metrics.
* **Activity Logs (`/parent/activity`)**: Real-time event log mapping child actions.
* **Communication Hub (`/parent/communication`)**: Open messenger links directly to the child's class and subject teachers.

---

## 6. System Interlinking and Routing Logic

1. **Login Redirects (`/login` -> Role Targets)**:
   - NextAuth handles authentication callbacks. The dashboard router reads the session token's `role` property and performs client-side redirects to respective landing directories (`/super-admin`, `/admin`, `/teacher`, `/student`, `/parent`).
2. **Unified Academic Navigation Rule (School Admin Sub-routes)**:
   - To make the School Admin portal feel cohesive, the navigation panel in `Sidebar.tsx` groups `/admin/classes`, `/admin/students`, and `/admin/teachers` under a single **Academic Workspace** menu link. When the administrator navigates to `/admin/students` or `/admin/teachers`, the "Academic Workspace" sidebar option remains highlighted active.
3. **Zustand State Store Hydration (`src/lib/store.ts`)**:
   - The Zustand store hydrates user state from NextAuth sessions and holds tenant variables (`schoolId`, `schoolName`, `userStandard`) to ensure synchronized query state.
   - Sibling pages share a `refreshKey` state trigger: calling `triggerRefresh()` updates the index, forcing refetch queries across sibling components to prevent data staleness.
4. **Database Cascade Deletion Policies**:
   - Deleting a `School` cascades to delete all users, classes, subjects, materials, and quizzes.
   - Deleting a standard/class cascades to delete its `ClassRoom` sections and assignments.

---

## 7. Design Theme and Contrast Rules (Style Guide)

The platform is designed around a high-end, premium **Glassmorphism Theme** that relies heavily on translucent backdrops and subtle borders:

* **Dark Mode**: Uses deep dark-blue and navy gradients (`bg-navy-950`, `bg-black/40`, `border-white/5` border grids).
* **Light Mode (WCAG AA Compliant)**: 
  - Adapts to a soft, modern light aesthetic. Contrast issues have been audited and resolved to meet WCAG AA guidelines.
  - Buttons: Secondary/action buttons use robust dark text contrast (`text-teal-700`, `text-slate-800`) on light translucent cards.
  - Modals & Forms: Form input borders use elevated contrast (`border-black/10` in light theme, `border-white/10` in dark theme). Text options inside select elements use high-contrast foreground states (`text-slate-800` vs `text-white`) to ensure readability.
  - Custom UI elements (`.glass-card`, `.glass-input`, `.glass-button`) have adaptive CSS vars styled inside [globals.css](file:///c:/Users/TECHWING/Downloads/AI%20Tutor/AI%20Tutor/ai-tutor/src/app/globals.css).

---

## 8. Recent Overhauls & Important Implementations

If you are continuing work on this repository, pay close attention to the following recent implementations:

1. **Simultaneous Student & Parent Account Creation**:
   - The "Add Student" modal in [page.tsx](file:///c:/Users/TECHWING/Downloads/AI%20Tutor/AI%20Tutor/ai-tutor/src/app/admin/students/page.tsx) allows admins to input custom passwords and register parent accounts (parent name, email, phone, and password).
   - The API endpoint [route.ts](file:///c:/Users/TECHWING/Downloads/AI%20Tutor/AI%20Tutor/ai-tutor/src/app/api/admin/students/create/route.ts) hashes credentials and automates parent account insertion. If a parent email already exists in the system (e.g. for a sibling), it links the sibling to the existing parent record without duplicate creation.
2. **Global Class Teacher Selection Dropdown**:
   - Inside [page.tsx](file:///c:/Users/TECHWING/Downloads/AI%20Tutor/AI%20Tutor/ai-tutor/src/app/admin/classes/page.tsx), the dropdown to assign class teachers has been fixed to list all school-wide faculty members (`teachers` registry). Previously, it restricted selection strictly to teachers assigned to sections' specific subjects, which caused the dropdown to render empty for empty sections.
3. **Collapsible Syllabus Navigation**:
   - In the student dashboard page, the syllabus navigation panel was updated with smooth collapsible controls to optimize viewport space during chats with the AI Tutor.

---

## 9. Running and Testing Locally

* **Run local development server**:
  ```bash
  npm run dev
  ```
* **Execute TypeScript compiles**:
  ```bash
  npx tsc --noEmit
  ```
* **Verify Next.js production builds**:
  ```bash
  npm run build
  ```
* **Apply Database modifications**:
  ```bash
  npx prisma generate
  npx prisma db push
  ```
