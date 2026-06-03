import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createClassSchema = z.object({
  name: z.string().min(1),
  grade: z.union([z.string(), z.number()]),
  sections: z.array(z.string()).optional(),
  adminEmail: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createClassSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }
    
    const { name, grade, sections, adminEmail } = parsed.data;

    // Find the admin to get their schoolId
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!admin || !admin.schoolId) {
      return NextResponse.json({ error: 'Unauthorized or school not found' }, { status: 403 });
    }

    // Check if class with this name already exists in the school
    const existingClass = await prisma.class.findFirst({
      where: {
        name,
        schoolId: admin.schoolId
      }
    });

    if (existingClass) {
      return NextResponse.json({ error: 'Class with this name already exists' }, { status: 409 });
    }

    // Create Class and Sections in a transaction
    const sectionNames = Array.isArray(sections) && sections.length > 0 ? sections : ['A']; // Default to section A if none provided

    const newClass = await prisma.class.create({
      data: {
        name,
        grade: parseInt(String(grade)),
        schoolId: admin.schoolId,
        sections: {
          create: sectionNames.map(secName => ({ name: secName }))
        }
      },
      include: {
        sections: true
      }
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
