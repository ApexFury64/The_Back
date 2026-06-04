import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const addEventSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["ai", "self-study"]),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addEventSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const { title, type, startTime, endTime } = parsed.data;

    const sessionEvent = await prisma.studySession.create({
      data: {
        studentId: userId,
        title,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });

    return NextResponse.json({ success: true, event: sessionEvent });
  } catch (error) {
    console.error('Error adding study session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
