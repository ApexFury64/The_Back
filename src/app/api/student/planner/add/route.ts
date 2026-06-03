import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const addEventSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["ai", "self-study"]),
  startTime: z.string().min(1), // ISO date string
  endTime: z.string().min(1),   // ISO date string
  studentEmail: z.string().email()
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = addEventSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }

    const { title, type, startTime, endTime, studentEmail } = parsed.data;

    const student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student || student.role !== 'student') return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const sessionEvent = await prisma.studySession.create({
      data: {
        studentId: student.id,
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
