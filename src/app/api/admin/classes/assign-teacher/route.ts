import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classRoomId, teacherId } = body;

    if (!classRoomId || !teacherId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const schoolId = (session.user as any).schoolId;

    // Verify teacher belongs to same school
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.schoolId !== schoolId || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Teacher not found in your school' }, { status: 404 });
    }

    const updatedClass = await prisma.classRoom.update({
      where: { id: classRoomId },
      data: { classTeacherId: teacherId },
      include: { classTeacher: true }
    });

    return NextResponse.json({ success: true, class: updatedClass });
  } catch (error) {
    console.error('Error assigning class teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
