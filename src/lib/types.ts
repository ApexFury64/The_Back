export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  score?: number;
  issue?: string;
  trend?: string;
}

export interface TeacherClass {
  id: string;
  name: string;
  subject: string;
  students: number;
  avgScore: number;
  nextClass: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  duration: number;
  totalMarks: number;
  questions: any[];
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  status: string;
  description?: string;
  submitted?: number;
  total?: number;
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
  progress: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  videoUrl?: string;
}

export interface School {
  id: string;
  name: string;
  city: string;
  students: number;
  plan: string;
  aiUsage: number;
  status: string;
}

export interface DashboardData {
  error?: string;
  [key: string]: any;
}
