import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user?.email;

    // Get Student Profile
    const student = await prisma.user.findUnique({
      where: { email: email as string },
      include: {
        school: true,
        class: {
          include: {
            classTeacher: true
          }
        }
      }
    });

    if (!student || !student.schoolId || !student.classId) {
      return NextResponse.json({ error: 'Student, school, or class not found' }, { status: 404 });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        schoolId: student.schoolId,
        standard: student.class?.standard
      }
    });

    const recentAssignments = await prisma.assignment.findMany({
      where: {
        schoolId: student.schoolId,
        classId: student.classId,
      },
      include: {
        subject: true,
        submissions: {
          where: { studentId: student.id }
        }
      },
      orderBy: { dueDate: 'desc' },
      take: 5
    });

    // Transform assignments for the frontend
    const formattedAssignments = recentAssignments.map(assignment => {
      const submission = assignment.submissions[0];
      return {
        id: assignment.id,
        title: assignment.title,
        subject: assignment.subject.name,
        subjectColor: assignment.subject.color,
        dueDate: assignment.dueDate.toISOString(),
        status: submission ? submission.status : 'pending',
        standard: assignment.subject.standard
      };
    });

    const pendingAssignmentCount = formattedAssignments.filter(a => a.status === 'pending').length;

    const subjectsSummary = subjects.map(sub => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      color: sub.color,
      progress: 0, // Calculate dynamically later
      grade: 'N/A',
      standard: sub.standard
    }));

    const stats = [
      { title: 'Study Hours', value: '0h', trend: 'Just started', icon: 'Clock', trendUp: true },
      { title: 'Quizzes Taken', value: '0', trend: '0 pending', icon: 'BookOpen', trendUp: true },
      { title: 'Exam Readiness', value: '0%', trend: 'Needs focus', icon: 'Target', trendUp: true },
      { title: 'Current Streak', value: '1 Day', trend: 'Keep it up!', icon: 'Flame', trendUp: true },
    ];

    const subjectPerformance = subjects.map(sub => ({
      name: sub.name,
      value: 0
    }));

    return NextResponse.json({
      user: { name: student.name, email: student.email },
      school: { name: student.school?.name, code: student.school?.code },
      className: student.class?.name,
      classTeacherName: student.class?.classTeacher?.name || 'Unassigned',
      teachers: [], // fetch class teachers if needed
      attendancePercent: 100,
      stats,
      subjects: subjectsSummary,
      recentAssignments: formattedAssignments,
      pendingAssignmentCount,
      subjectPerformance,
      performanceTrend: [],
      leaderboard: [],
      examReadiness: []
    });
  } catch (error: any) {
    console.error('Error fetching student dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
