import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user?.email;

    const teacherData = await prisma.user.findUnique({
      where: { email: email as string },
      include: {
        school: true,
        taughtClasses: {
          include: {
            students: true
          }
        },
        assignments: {
          orderBy: { dueDate: 'desc' },
          take: 5,
          include: {
            class: true,
            subject: true,
            submissions: true
          }
        }
      }
    });

    if (!teacherData || !teacherData.schoolId) {
      return NextResponse.json({ error: 'Teacher or school not found' }, { status: 404 });
    }

    const teacher = { name: teacherData.name || 'Teacher', email: teacherData.email, employeeId: teacherData.id.slice(0, 8) };

    const recentHomework = teacherData.assignments.map(a => ({
      id: a.id,
      title: a.title,
      class: a.class.name,
      subject: a.subject.name,
      dueDate: a.dueDate.toISOString(),
      submissions: a.submissions.length
    }));

    const baseConditions: any[] = [
      { classTeacherId: teacherData.id },
      { assignments: { some: { teacherId: teacherData.id } } }
    ];

    if (teacherData.schoolId) {
      const settingKey = `section_subject_teachers_${teacherData.schoolId}`;
      const setting = await prisma.setting.findUnique({ where: { key: settingKey } });
      if (setting) {
        try {
          const mappings: Record<string, string> = JSON.parse(setting.value);
          const assignedClassIds: string[] = [];
          for (const [key, val] of Object.entries(mappings)) {
            if (val === teacherData.id) {
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
          console.error('Error parsing settings for dashboard:', e);
        }
      }
    }

    const assignedClassRooms = await prisma.classRoom.findMany({
      where: {
        OR: baseConditions
      },
      include: {
        students: true
      }
    });

    const totalStudents = assignedClassRooms.reduce((acc, c) => acc + c.students.length, 0);

    const teacherStats = [
      { title: 'Total Students', value: totalStudents.toString(), trend: `Across ${assignedClassRooms.length} classes`, icon: 'Users', trendUp: true },
      { title: 'Avg Class Score', value: '84%', trend: 'Good performance', icon: 'TrendingUp', trendUp: true },
      { title: 'Pending Grades', value: '0', trend: 'Needs attention', icon: 'FileCheck', trendUp: false },
      { title: 'Classes Assigned', value: assignedClassRooms.length.toString(), trend: 'Subject teacher', icon: 'School', trendUp: true },
    ];

    const performanceData = [
      { name: 'Week 1', value: 75, value2: 70 },
      { name: 'Week 2', value: 78, value2: 75 },
      { name: 'Week 3', value: 80, value2: 76 },
      { name: 'Week 4', value: 85, value2: 80 },
      { name: 'Week 5', value: 82, value2: 79 },
    ];
    
    const teacherClasses = assignedClassRooms.map(c => ({
      id: c.id,
      name: c.name,
      grade: parseInt(c.standard) || 0,
      sections: [c.section],
      students: c.students.length,
      subjects: [{ name: 'Assigned Subject', color: '#0ea5e9' }] // Simplified
    }));

    const weakStudents = [
      { name: 'Charlie Brown', class: '10-A', score: 55, issue: 'Critically low scores', trend: '-5% this week' },
      { name: 'Ethan Hunt', class: '8-A', score: 72, issue: 'Below average performance', trend: '-3% this week' }
    ];

    // Fetch school announcements targeted at Teachers or all
    const announcements = await prisma.announcement.findMany({
      where: {
        schoolId: teacherData.schoolId,
        OR: [
          { targetAudience: { equals: 'all', mode: 'insensitive' } },
          { targetAudience: { contains: 'TEACHER', mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      teacher,
      school: { name: teacherData.school?.name, code: teacherData.school?.code },
      teacherStats,
      performanceData,
      teacherClasses,
      weakStudents,
      recentHomework,
      classTeacherSections: [],
      students: [],
      announcements,
    });
  } catch (error: any) {
    console.error('Error fetching teacher dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch teacher dashboard data' }, { status: 500 });
  }
}
