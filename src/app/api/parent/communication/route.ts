import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('parentEmail') || session.email;

    const parent = await prisma.user.findUnique({ where: { email } });
    if (!parent || !parent.schoolId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const announcements = await prisma.announcement.findMany({
      where: { schoolId: parent.schoolId },
      include: { author: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
