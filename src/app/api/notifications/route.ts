import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user?.email;
    if (!email) {
      return NextResponse.json({ error: 'User email not found in session' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { role: true, schoolId: true }
    });

    if (!user || !user.schoolId) {
      return NextResponse.json({ notifications: [] });
    }

    // Fetch announcements targeted at the user's role or 'all'
    const announcements = await prisma.announcement.findMany({
      where: {
        schoolId: user.schoolId,
        OR: [
          { targetAudience: { equals: 'all', mode: 'insensitive' } },
          { targetAudience: { contains: user.role, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Format announcements as notifications
    const formatted = announcements.map(a => {
      let type = 'info';
      if (a.priority === 'high') {
        type = 'alert';
      } else if (a.priority === 'medium') {
        type = 'warning';
      }

      return {
        id: a.id,
        title: a.title,
        message: a.content,
        time: new Date(a.createdAt).toLocaleDateString() + ' ' + new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: type
      };
    });

    return NextResponse.json({ notifications: formatted });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
