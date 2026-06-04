import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const assignSubjectSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().optional(),
  subjectName: z.string().optional(),
}).refine(data => data.subjectId || data.subjectName, {
  message: "Either subjectId or subjectName must be provided",
  path: ["subjectId"]
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = assignSubjectSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    
    const { classId, subjectId, subjectName } = parsed.data;
    const schoolId = (session.user as any).schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Get the class to know its standard
    const classRoom = await prisma.classRoom.findUnique({ where: { id: classId } });
    if (!classRoom || classRoom.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    let finalSubjectId = subjectId;

    if (!finalSubjectId && subjectName) {
      let subject = await prisma.subject.findFirst({
        where: { name: subjectName, schoolId }
      });
      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            name: subjectName,
            code: subjectName.substring(0, 3).toUpperCase() + classRoom.standard,
            color: '#0ea5e9',
            standard: classRoom.standard,
            schoolId
          }
        });
      }
      finalSubjectId = subject.id;
    }

    return NextResponse.json({ success: true, subjectId: finalSubjectId, classId });
  } catch (error) {
    console.error('Error assigning subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
