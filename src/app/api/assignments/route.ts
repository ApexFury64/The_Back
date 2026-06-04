import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || session.user?.email;

    if (!userEmail) {
       return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail as string },
      include: { class: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'STUDENT') {
       // If teacher, maybe they hit this by accident, return empty
       if (user.role === 'TEACHER') {
          const assignments = await prisma.assignment.findMany({
            where: { teacherId: user.id },
            include: { subject: true, class: true }
          });
          // map it
          return NextResponse.json(assignments.map(a => ({
             ...a,
             class: a.class.name
          })));
       }
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        schoolId: user.schoolId as string,
        classId: user.classId as string,
      },
      include: {
        subject: true,
        submissions: {
          where: { studentId: user.id }
        }
      },
      orderBy: { dueDate: 'desc' }
    });

    const formattedAssignments = assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate.toISOString(),
      class: user.class?.name || 'Unknown',
      subject: a.subject,
      submissions: a.submissions
    }));

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}
