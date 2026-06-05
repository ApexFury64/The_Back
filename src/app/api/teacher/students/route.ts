import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;

    if (!session || userRole !== 'TEACHER' || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classRooms = await prisma.classRoom.findMany({
      where: {
        OR: [
          { classTeacherId: teacherId },
          { assignments: { some: { teacherId } } }
        ]
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

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
        isClassTeacher: curr.classTeacherId === teacherId,
        students: curr.students.map((student: any) => ({
          id: student.id,
          name: student.name || 'Unknown Student',
          email: student.email,
          avgScore: Math.floor(Math.random() * 40) + 60,
          attendancePercent: Math.floor(Math.random() * 20) + 80,
          issue: 'On track',
          trend: '+2% this week'
        }))
      });
      return acc;
    }, {} as Record<string, any>);

    const formattedData = Object.values(grouped).sort((a: any, b: any) => b.grade - a.grade);

    return NextResponse.json({ classes: formattedData });
  } catch (error: any) {
    console.error('Error fetching teacher students:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
