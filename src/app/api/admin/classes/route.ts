import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classRooms = await prisma.classRoom.findMany({
      where: { schoolId },
      include: {
        students: { select: { id: true } },
        classTeacher: { select: { name: true } },
      }
    });

    // Group by standard (grade)
    const grouped = classRooms.reduce((acc: any, curr: any) => {
      const grade = parseInt(curr.standard, 10) || 0;
      if (!acc[curr.standard]) {
        acc[curr.standard] = {
          id: `grade-${curr.standard}`,
          name: `Class ${curr.standard}`,
          grade: grade,
          sections: []
        };
      }
      acc[curr.standard].sections.push({
        id: curr.id,
        name: curr.section,
        students: curr.students,
        classTeacher: curr.classTeacher,
        sectionSubjects: [] // We don't have SectionSubject model anymore
      });
      return acc;
    }, {} as Record<string, any>);

    const classes = Object.values(grouped).sort((a: any, b: any) => b.grade - a.grade);

    return NextResponse.json({ classes });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
