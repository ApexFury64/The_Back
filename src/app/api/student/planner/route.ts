import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const studentId = (session?.user as any)?.id;
    const classId = (session?.user as any)?.classId;

    if (!session || userRole !== 'STUDENT' || !studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get study sessions
    const studySessions = await prisma.studySession.findMany({
      where: { studentId }
    });

    // 2. Get upcoming assignments for their class
    const assignments = classId ? await prisma.assignment.findMany({
      where: { classId, dueDate: { gte: new Date() } }
    }) : [];

    // Combine and format
    const events = [
      ...studySessions.map(s => ({
        id: s.id,
        title: s.title,
        date: s.startTime.toISOString().split('T')[0],
        type: s.type // 'ai' or 'self-study'
      })),
      ...assignments.map(a => ({
        id: `assignment-${a.id}`,
        title: `Due: ${a.title}`,
        date: a.dueDate.toISOString().split('T')[0],
        type: 'assignment'
      }))
    ];

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching planner events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
