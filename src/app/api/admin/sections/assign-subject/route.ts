import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const assignSubjectSchema = z.object({
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  subjectId: z.string().optional(),
  subjectName: z.string().optional(),
  teacherId: z.string().optional(),
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
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    
    const { classId, sectionId, subjectId, subjectName, teacherId } = parsed.data;
    const targetClassId = classId || sectionId;

    if (!targetClassId) {
      return NextResponse.json({ error: 'Missing classId or sectionId' }, { status: 400 });
    }

    const schoolId = (session.user as any).schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Get the class to know its standard
    const classRoom = await prisma.classRoom.findUnique({ where: { id: targetClassId } });
    if (!classRoom || classRoom.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    let finalSubjectId = subjectId;
    let resolvedSubjectName = subjectName;

    if (finalSubjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: finalSubjectId } });
      if (subject) {
        resolvedSubjectName = subject.name;
      }
    } else if (subjectName) {
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
      resolvedSubjectName = subject.name;
    }

    // Update teacher's primary subject to store this teaching assignment relation
    if (teacherId && resolvedSubjectName) {
      const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
      if (teacher && teacher.schoolId === schoolId && teacher.role === 'TEACHER') {
        await prisma.user.update({
          where: { id: teacherId },
          data: { primarySubject: resolvedSubjectName }
        });
      }
    }

    return NextResponse.json({ success: true, subjectId: finalSubjectId, classId: targetClassId });
  } catch (error) {
    console.error('Error assigning subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
