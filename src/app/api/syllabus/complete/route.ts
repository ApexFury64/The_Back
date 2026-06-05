import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const completeSyllabusSchema = z.object({
  topicId: z.string()
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;
    const studentId = (session?.user as { id?: string })?.id;

    if (!session || userRole !== 'STUDENT' || !studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = completeSyllabusSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { topicId } = result.data;

    const topicProgress = await prisma.topicProgress.upsert({
      where: {
        topicId_studentId: {
          topicId,
          studentId
        }
      },
      update: {
        status: 'completed'
      },
      create: {
        topicId,
        studentId,
        status: 'completed'
      }
    });

    return NextResponse.json({ success: true, topicProgress });
  } catch (error: unknown) {
    console.error('Error completing syllabus:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to complete topic' }, { status: 500 });
  }
}
