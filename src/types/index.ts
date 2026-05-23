/* ============================================
   TechWing AI Tutor — Type Definitions
   ============================================ */

export type UserRole = "student" | "parent" | "teacher" | "admin" | "super-admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  schoolId?: string;
  schoolName?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  logo?: string;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  plan: "free" | "basic" | "pro" | "enterprise";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
}

export interface StudentProfile extends User {
  role: "student";
  studentId: string;
  classId: string;
  className: string;
  section: string;
  grade: number;
  rollNumber: string;
  parentId?: string;
  subjects: Subject[];
  examReadiness: number;
  streak: number;
  totalStudyHours: number;
  quizzesCompleted: number;
}

export interface ParentProfile extends User {
  role: "parent";
  phone: string;
  children: StudentProfile[];
}

export interface TeacherProfile extends User {
  role: "teacher";
  employeeId: string;
  department: string;
  subjects: Subject[];
  classes: ClassInfo[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  icon?: string;
  color: string;
  progress?: number;
  grade?: string;
  score?: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: number;
  section: string;
  studentCount: number;
  subjects: Subject[];
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "overdue";
  score?: number;
  maxScore?: number;
  type: "homework" | "project" | "quiz" | "test";
}

export interface ExamResult {
  id: string;
  examName: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank?: number;
  totalStudents?: number;
  date: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // minutes
  date: string;
  type: "ai-tutor" | "self-study" | "quiz" | "revision";
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  subject?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  schoolId: string;
}

export interface AnalyticsData {
  label: string;
  value: number;
  change?: number;
  changeType?: "increase" | "decrease";
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface SidebarItem {
  label: string;
  icon: string;
  href: string;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface DashboardStats {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: string;
  color: string;
}
