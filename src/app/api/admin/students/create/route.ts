import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  classId: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createStudentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    
    const { name, email, classId } = parsed.data;
    const schoolId = (session.user as any).schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 403 });
    }

    // Verify class belongs to this school
    const classRoom = await prisma.classRoom.findFirst({
      where: { id: classId, schoolId }
    });
    if (!classRoom) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if email already exists (case-insensitive)
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const defaultPassword = await bcrypt.hash('demo123', 10);

    const newStudent = await prisma.user.create({
      data: {
        name,
        email,
        password: defaultPassword,
        role: 'STUDENT',
        schoolId,
        classId
      }
    });

    return NextResponse.json({ success: true, student: { id: newStudent.id, name: newStudent.name, email: newStudent.email } });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
