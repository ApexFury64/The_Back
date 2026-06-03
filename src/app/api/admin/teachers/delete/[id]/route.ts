import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: teacherId } = await context.params;

    // Verify teacher exists and belongs to admin's school
    const admin = await prisma.user.findUnique({ where: { email: session.email } });
    if (!admin || !admin.schoolId) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher || teacher.role !== 'teacher' || teacher.schoolId !== admin.schoolId) {
      return NextResponse.json({ error: 'Teacher not found or unauthorized' }, { status: 404 });
    }

    // Delete the teacher
    await prisma.user.delete({
      where: { id: teacherId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
