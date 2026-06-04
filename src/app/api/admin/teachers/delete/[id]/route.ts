import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: teacherId } = await context.params;
    const schoolId = (session.user as any).schoolId;

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher || teacher.role !== 'TEACHER' || teacher.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Teacher not found or unauthorized' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: teacherId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
