import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;

    if (!session || userRole !== 'TEACHER' || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbLiveClasses = await prisma.liveClass.findMany({
      where: { teacherId },
      orderBy: { startTime: 'asc' }
    });

    const classes = dbLiveClasses.map((c: any) => {
      const durationMs = c.endTime.getTime() - c.startTime.getTime();
      const durationMins = Math.round(durationMs / 60000);
      return {
        id: c.id,
        title: c.title,
        time: c.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: durationMins,
        status: c.startTime > new Date() ? 'scheduled' : 'completed',
        meetingUrl: c.meetingUrl
      };
    });

    return NextResponse.json(classes);
  } catch (error: any) {
    console.error('Error fetching live classes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'TEACHER' || !teacherId || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, time, duration, meetingUrl } = body;

    // Parse time (e.g. "10:00") and create startTime/endTime today
    const now = new Date();
    const [hours, minutes] = (time || "10:00").split(':');
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
    const endTime = new Date(startTime.getTime() + (parseInt(duration || "60") * 60000));

    const liveClass = await prisma.liveClass.create({
      data: {
        schoolId,
        teacherId,
        title: title || 'Untitled Class',
        startTime,
        endTime,
        meetingUrl: meetingUrl || 'https://meet.google.com/new'
      }
    });

    return NextResponse.json({ success: true, liveClass });
  } catch (error: any) {
    console.error('Error creating live class:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
