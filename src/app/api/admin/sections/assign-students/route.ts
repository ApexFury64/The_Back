import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const assignStudentsSchema = z.object({
  sectionId: z.string().min(1),
  studentIds: z.array(z.string()).min(1),
  adminEmail: z.string().email()
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = assignStudentsSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }

    const { sectionId, studentIds, adminEmail } = parsed.data;

    // Verify admin belongs to the school
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    // Update the students
    await prisma.user.updateMany({
      where: {
        id: { in: studentIds },
        role: 'student',
        schoolId: admin.schoolId
      },
      data: {
        sectionId: sectionId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
