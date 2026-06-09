import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const teacherId = (session?.user as any)?.id;

    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'TEACHER' || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseConditions: any[] = [
      { classTeacherId: teacherId },
      { assignments: { some: { teacherId } } }
    ];

    if (schoolId) {
      const settingKey = `section_subject_teachers_${schoolId}`;
      const setting = await prisma.setting.findUnique({ where: { key: settingKey } });
      if (setting) {
        try {
          const mappings: Record<string, string> = JSON.parse(setting.value);
          const assignedClassIds: string[] = [];
          for (const [key, val] of Object.entries(mappings)) {
            if (val === teacherId) {
              const [classId] = key.split('_');
              if (classId) {
                assignedClassIds.push(classId);
              }
            }
          }
          if (assignedClassIds.length > 0) {
            baseConditions.push({ id: { in: assignedClassIds } });
          }
        } catch (e) {
          console.error('Error parsing section subject teachers settings for students:', e);
        }
      }
    }

    const classRooms = await prisma.classRoom.findMany({
      where: {
        OR: baseConditions
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
        students: curr.students.map((student: any) => {
          const avgScore = Math.floor(Math.random() * 40) + 60;
          const attendancePercent = Math.floor(Math.random() * 20) + 80;
          let issue = 'On track';
          if (avgScore < 70) {
            issue = 'Low score';
          } else if (attendancePercent < 85) {
            issue = 'Low attendance';
          }
          return {
            id: student.id,
            name: student.name || 'Unknown Student',
            email: student.email,
            avgScore,
            attendancePercent,
            issue,
            trend: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 5)}% this week` : `-${Math.floor(Math.random() * 5)}% this week`
          };
        })
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
