import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('adminEmail') || session.email;

    const admin = await prisma.user.findUnique({ where: { email } });
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

import { z } from 'zod';

const createAnnouncementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  adminEmail: z.string().email().optional()
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }

    const { title, content, priority, adminEmail } = parsed.data;
    const email = adminEmail || session.email;

    const admin = await prisma.user.findUnique({ where: { email } });
    if (!admin || !admin.schoolId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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
