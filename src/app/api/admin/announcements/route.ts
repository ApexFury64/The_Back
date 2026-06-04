import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user?.email;
    const admin = await prisma.user.findUnique({ where: { email: email as string } });
    if (!admin || !admin.schoolId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const announcements = await prisma.announcement.findMany({
      where: { schoolId: admin.schoolId },
      include: { author: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const createAnnouncementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const email = session.user?.email as string;
    const admin = await prisma.user.findUnique({ where: { email } });
    if (!admin || !admin.schoolId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { title, content, priority } = parsed.data;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority || 'medium',
        schoolId: admin.schoolId,
        authorId: admin.id
      },
      include: { author: { select: { name: true, role: true } } }
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
