import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, teacherId, adminEmail } = body;

    if (!sectionId || !teacherId || !adminEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!admin || !admin.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the Section with the new Class Teacher
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: { classTeacherId: teacherId },
      include: { classTeacher: true }
    });

    return NextResponse.json({ success: true, section: updatedSection });
  } catch (error) {
    console.error('Error assigning class teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
