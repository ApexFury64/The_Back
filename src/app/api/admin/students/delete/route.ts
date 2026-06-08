import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const deleteStudentSchema = z.object({
  studentId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = deleteStudentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { studentId } = parsed.data;

    // Verify the student belongs to this school
    const student = await prisma.user.findFirst({
      where: { id: studentId, role: 'STUDENT', schoolId },
      include: { parent: { select: { id: true } } },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found in your school' }, { status: 404 });
    }

    // Delete parent account first (if linked), then the student
    if (student.parent) {
      await prisma.user.delete({ where: { id: student.parent.id } });
    }

    await prisma.user.delete({ where: { id: studentId } });

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
