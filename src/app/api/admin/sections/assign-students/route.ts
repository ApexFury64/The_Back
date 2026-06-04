import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const assignStudentsSchema = z.object({
  classId: z.string().min(1),
  studentIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = assignStudentsSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { classId, studentIds } = parsed.data;
    const schoolId = (session.user as any).schoolId;

    await prisma.user.updateMany({
      where: {
        id: { in: studentIds },
        role: 'STUDENT',
        schoolId
      },
      data: {
        classId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
