import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user?.email as string;
    const parent = await prisma.user.findUnique({ where: { email } });
    if (!parent || !parent.schoolId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const announcements = await prisma.announcement.findMany({
      where: { 
        schoolId: parent.schoolId,
        OR: [
          { targetAudience: 'all' },
          { targetAudience: { contains: 'PARENT' } }
        ]
      },
      include: { author: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
