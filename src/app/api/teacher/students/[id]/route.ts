import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (role !== 'TEACHER' && role !== 'SCHOOLADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: studentId } = await context.params;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        submissions: {
          include: {
            assignment: {
              include: {
                subject: true
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const avgScore = 85;
    const attendancePercent = 95;

    let issue = "On track";
    let aiInsight = "Student is performing well and keeping up with the curriculum.";

    const data = {
      id: student.id,
      name: student.name,
      email: student.email,
      className: student.class?.name || "Unassigned",
      sectionName: student.class?.section || "Unassigned",
      rollNo: `RL${student.id.substring(0, 4).toUpperCase()}`,
      metrics: {
        avgScore,
        attendancePercent,
        assignmentsCompleted: student.submissions.filter(a => a.status === 'submitted' || a.status === 'graded').length,
        totalAssignments: student.submissions.length,
        issue,
        aiInsight
      },
      quizzes: [],
      assignments: student.submissions.map(as => ({
        id: as.id,
        title: as.assignment.title,
        subject: as.assignment.subject.name,
        status: as.status,
        dueDate: as.assignment.dueDate,
        submittedAt: as.submittedAt
      }))
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
  }
}
