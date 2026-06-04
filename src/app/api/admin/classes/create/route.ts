import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createClassSchema = z.object({
  name: z.string().min(1),
  grade: z.union([z.string(), z.number()]),
  sections: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createClassSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    
    const { name, grade, sections } = parsed.data;
    const schoolId = (session.user as any).schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 403 });
    }

    const standard = String(grade);
    const sectionNames = Array.isArray(sections) && sections.length > 0 ? sections : ['A'];

    // Create one ClassRoom per section
    const created = [];
    for (const sec of sectionNames) {
      const existing = await prisma.classRoom.findFirst({
        where: { schoolId, standard, section: sec }
      });
      if (existing) continue;

      const classRoom = await prisma.classRoom.create({
        data: {
          schoolId,
          name: `Class ${standard} - ${sec}`,
          standard,
          section: sec,
        }
      });
      created.push(classRoom);
    }

    return NextResponse.json({ success: true, classes: created });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
