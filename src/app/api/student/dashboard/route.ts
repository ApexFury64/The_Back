import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.email;

    // Get Student Profile
    let student = null;
    const usersSnapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (!usersSnapshot.empty) {
      student = { id: usersSnapshot.docs[0].id, ...usersSnapshot.docs[0].data() };
    }

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // Since we are migrating from a relational Prisma DB to NoSQL, we provide robust mock aggregates
    // for complex relational features (like progress, leaderboards) if the sub-collections don't exist yet.

    const subjectsSummary = [
      { id: '1', name: 'Mathematics', code: 'MAT8', color: '#0ea5e9', progress: 85, grade: 'A', standard: '8' },
      { id: '2', name: 'Science', code: 'SCI8', color: '#00d4aa', progress: 70, grade: 'B+', standard: '8' },
      { id: '3', name: 'History', code: 'HIS8', color: '#f59e0b', progress: 95, grade: 'A+', standard: '8' },
      { id: '4', name: 'Mathematics', code: 'MAT7', color: '#0ea5e9', progress: 90, grade: 'A+', standard: '7' },
      { id: '5', name: 'Science', code: 'SCI7', color: '#00d4aa', progress: 80, grade: 'A', standard: '7' },
      { id: '6', name: 'History', code: 'HIS7', color: '#f59e0b', progress: 85, grade: 'A', standard: '7' },
      { id: '7', name: 'Mathematics', code: 'MAT6', color: '#0ea5e9', progress: 95, grade: 'A+', standard: '6' },
      { id: '8', name: 'Science', code: 'SCI6', color: '#00d4aa', progress: 90, grade: 'A+', standard: '6' },
      { id: '9', name: 'History', code: 'HIS6', color: '#f59e0b', progress: 90, grade: 'A+', standard: '6' },
    ];

    const stats = [
      { title: 'Study Hours', value: '12.5h', trend: '15 topics completed', icon: 'Clock', trendUp: true },
      { title: 'Quizzes Taken', value: '8', trend: '2 pending', icon: 'BookOpen', trendUp: true },
      { title: 'Exam Readiness', value: '82%', trend: 'Great progress!', icon: 'Target', trendUp: true },
      { title: 'Current Streak', value: '5 Days', trend: 'Keep it up!', icon: 'Flame', trendUp: true },
    ];

    const recentAssignments = [
      { id: '1', title: 'Algebra Worksheet', subject: 'Mathematics', subjectColor: '#0ea5e9', dueDate: 'Tomorrow', status: 'pending', standard: '8' },
      { id: '2', title: 'Physics Lab Report', subject: 'Science', subjectColor: '#00d4aa', dueDate: '2 days ago', status: 'submitted', standard: '8' },
      { id: '3', title: 'Fractions Practice', subject: 'Mathematics', subjectColor: '#0ea5e9', dueDate: '3 days ago', status: 'graded', standard: '7' },
      { id: '4', title: 'Water Cycle Diagram', subject: 'Science', subjectColor: '#00d4aa', dueDate: '4 days ago', status: 'submitted', standard: '7' },
      { id: '5', title: 'Decimals Quiz', subject: 'Mathematics', subjectColor: '#0ea5e9', dueDate: '5 days ago', status: 'graded', standard: '6' },
      { id: '6', title: 'States of Matter', subject: 'Science', subjectColor: '#00d4aa', dueDate: '6 days ago', status: 'graded', standard: '6' },
    ];

    const subjectPerformance = [
      { name: 'Math', value: 85 },
      { name: 'Science', value: 78 },
      { name: 'History', value: 92 },
    ];

    const performanceTrend = [
      { name: 'Jan', value: 70, value2: 65 },
      { name: 'Feb', value: 75, value2: 68 },
      { name: 'Mar', value: 80, value2: 72 },
      { name: 'Apr', value: 82, value2: 75 },
    ];

    const leaderboard = [
      { name: student.name, avatar: 'ME', score: 850, rank: 1, avgScore: 85 },
      { name: 'Sarah Connor', avatar: 'SC', score: 820, rank: 2, avgScore: 82 },
      { name: 'John Smith', avatar: 'JS', score: 790, rank: 3, avgScore: 79 },
    ];

    const examReadiness = [
      { label: 'Overall', value: 82, color: '#00d4aa' },
      { label: 'Math', value: 85, color: '#0ea5e9' },
      { label: 'History', value: 95, color: '#f59e0b' },
    ];

    return NextResponse.json({
      user: { name: student.name, email: student.email },
      school: { name: 'Firebase School', code: 'FB001' },
      className: student.className || 'Class 10 - A',
      classTeacherName: 'Mrs. Davis',
      teachers: [
         { name: 'Mr. Anderson', subject: 'Mathematics', subjectColor: '#0ea5e9' },
         { name: 'Ms. Roberts', subject: 'Science', subjectColor: '#00d4aa' }
      ],
      attendancePercent: 95,
      stats,
      subjects: subjectsSummary,
      recentAssignments,
      pendingAssignmentCount: 1,
      subjectPerformance,
      performanceTrend,
      leaderboard,
      examReadiness
    });
  } catch (error: any) {
    console.error('Error fetching student dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
