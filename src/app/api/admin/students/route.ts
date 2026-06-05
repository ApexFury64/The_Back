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
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            parent: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Group by standard (grade)
    const grouped = classRooms.reduce((acc: Record<string, any>, curr: any) => {
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
        students: curr.students.map((student: any) => ({
          id: student.id,
          name: student.name || 'Unknown Student',
          email: student.email || 'N/A',
          phone: student.phone || 'N/A',
          enrollmentYear: new Date(student.createdAt).getFullYear().toString(),
          avgScore: Math.floor(Math.random() * 40) + 60, // TODO: Calculate from Submissions
          attendancePercent: Math.floor(Math.random() * 20) + 80, // TODO: Implement Attendance model
          aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)], // TODO: Calculate from AiUsageLog
          parent: student.parent ? {
            id: student.parent.id,
            name: student.parent.name || 'N/A',
            email: student.parent.email || 'N/A',
            phone: student.parent.phone || 'N/A'
          } : null
        }))
      });
      return acc;
    }, {} as Record<string, any>);

    const classes = Object.values(grouped).sort((a: any, b: any) => b.grade - a.grade);

    return NextResponse.json({ classes });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
