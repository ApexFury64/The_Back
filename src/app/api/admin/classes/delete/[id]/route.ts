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

    const { id: classId } = await context.params;
    const schoolId = (session.user as any).schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 403 });
    }

    const classRoom = await prisma.classRoom.findUnique({
      where: { id: classId }
    });

    if (!classRoom || classRoom.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Class not found or unauthorized' }, { status: 404 });
    }

    // Unassign students from this class section first to avoid relational constraint issues
    await prisma.user.updateMany({
      where: { classId: classId, schoolId },
      data: { classId: null }
    });

    // Delete classRoom (assignments and other relations with cascade delete will automatically delete)
    await prisma.classRoom.delete({
      where: { id: classId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
