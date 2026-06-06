import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const removeStudentSchema = z.object({
  studentId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = removeStudentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { studentId } = parsed.data;
    const schoolId = (session.user as any).schoolId;

    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: 'STUDENT',
        schoolId
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found in school' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { classId: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing student from section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
