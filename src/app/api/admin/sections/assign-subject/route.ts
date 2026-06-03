import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const assignSubjectSchema = z.object({
  sectionId: z.string().min(1),
  subjectId: z.string().optional(),
  teacherId: z.string().min(1),
  subjectName: z.string().optional(),
  adminEmail: z.string().email().optional()
}).refine(data => data.subjectId || data.subjectName, {
  message: "Either subjectId or subjectName must be provided",
  path: ["subjectId"]
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = assignSubjectSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }
    
    const { sectionId, subjectId, teacherId, subjectName, adminEmail } = parsed.data;

    const admin = await prisma.user.findUnique({
      where: { email: adminEmail || session.email }
    });
    if (!admin || !admin.schoolId) return NextResponse.json({ error: 'Admin or school not found' }, { status: 404 });

    let finalSubjectId = subjectId;

    // Inline subject creation if subjectName is provided without an ID
    if (!finalSubjectId && subjectName) {
      // Check if it already exists
      let subject = await prisma.subject.findFirst({
        where: { name: subjectName, schoolId: admin.schoolId }
      });
      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            name: subjectName,
            code: subjectName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
            color: 'teal',
            standard: 1, // Default, can be refined later
            schoolId: admin.schoolId
          }
        });
      }
      finalSubjectId = subject.id;
    }

    // Upsert the SectionSubject to update teacher if one already exists for this section+subject combo
    const sectionSubject = await prisma.sectionSubject.upsert({
      where: {
        sectionId_subjectId: {
          sectionId,
          subjectId: finalSubjectId
        }
      },
      update: {
        teacherId
      },
      create: {
        sectionId,
        subjectId: finalSubjectId,
        teacherId
      }
    });

    return NextResponse.json({ success: true, sectionSubject });
  } catch (error) {
    console.error('Error assigning subject teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
