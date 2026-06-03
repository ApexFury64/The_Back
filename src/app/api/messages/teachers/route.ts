import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'parent' && session.role !== 'student' && session.role !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For MVP, just return all teachers in the same school
    const teachers = await prisma.user.findMany({
      where: {
        schoolId: session.schoolId,
        role: 'teacher'
      },
      select: {
        id: true,
        name: true,
        primarySubject: true
      }
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
