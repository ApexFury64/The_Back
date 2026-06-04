import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any)?.role;
    if (role !== 'PARENT' && role !== 'STUDENT' && role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = (session.user as any).schoolId;

    const teachers = await prisma.user.findMany({
      where: {
        schoolId,
        role: 'TEACHER'
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
