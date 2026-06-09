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

    const email = session.user?.email as string;
    const teacher = await prisma.user.findUnique({
      where: { email },
      include: { taughtClasses: true }
    });

    if (!teacher || !teacher.schoolId) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get live classes
    const dbLiveClasses = await prisma.liveClass.findMany({
      where: { teacherId: teacher.id },
      orderBy: { startTime: 'asc' }
    });

    const formattedLiveClasses = dbLiveClasses.map((c: any) => {
      const dateString = c.startTime.toISOString().split('T')[0];
      const startString = c.startTime.toTimeString().slice(0, 5);
      const endString = c.endTime.toTimeString().slice(0, 5);

      return {
        id: c.id,
        title: c.title,
        class: c.className || "Class",
        subject: c.subjectName || "Subject",
        date: dateString,
        startTime: startString,
        endTime: endString,
        meetingLink: c.meetingUrl
      };
    });

    // Get section subjects that this teacher is assigned to (reused from assignments route)
    const baseConditions: any[] = [
      { classTeacherId: teacher.id },
      { assignments: { some: { teacherId: teacher.id } } }
    ];

    if (teacher.schoolId) {
      const settingKey = `section_subject_teachers_${teacher.schoolId}`;
      const setting = await prisma.setting.findUnique({ where: { key: settingKey } });
      if (setting) {
        try {
          const mappings: Record<string, string> = JSON.parse(setting.value);
          const assignedClassIds: string[] = [];
          for (const [key, val] of Object.entries(mappings)) {
            if (val === teacher.id) {
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
          console.error('Error parsing settings for teacher live classes:', e);
        }
      }
    }

    const classes = await prisma.classRoom.findMany({
      where: {
        OR: baseConditions
      }
    });

    const subjects = await prisma.subject.findMany({ where: { schoolId: teacher.schoolId } });
    const sectionSubjects: any[] = [];
    const addedKeys = new Set<string>();

    if (teacher.schoolId) {
      const settingKey = `section_subject_teachers_${teacher.schoolId}`;
      const setting = await prisma.setting.findUnique({ where: { key: settingKey } });
      if (setting) {
        try {
          const mappings: Record<string, string> = JSON.parse(setting.value);
          for (const [key, val] of Object.entries(mappings)) {
            if (val === teacher.id) {
              const [cId, sId] = key.split('_');
              const targetClass = classes.find(cr => cr.id === cId);
              const targetSubject = subjects.find(sub => sub.id === sId);
              if (targetClass && targetSubject) {
                const comboKey = `${targetClass.id}_${targetSubject.id}`;
                if (!addedKeys.has(comboKey)) {
                  addedKeys.add(comboKey);
                  sectionSubjects.push({
                    id: comboKey,
                    section: { name: targetClass.section, class: { name: `Class ${targetClass.standard}` } },
                    subject: { name: targetSubject.name }
                  });
                }
              }
            }
          }
        } catch (e) {
          console.error('Error parsing settings for live classes combo:', e);
        }
      }
    }

    const classTeacherRooms = classes.filter(c => c.classTeacherId === teacher.id);
    classTeacherRooms.forEach(c => {
      subjects.filter(s => s.standard === c.standard).forEach(s => {
        const comboKey = `${c.id}_${s.id}`;
        if (!addedKeys.has(comboKey)) {
          addedKeys.add(comboKey);
          sectionSubjects.push({
            id: comboKey,
            section: { name: c.section, class: { name: `Class ${c.standard}` } },
            subject: { name: s.name }
          });
        }
      });
    });

    return NextResponse.json({ liveClasses: formattedLiveClasses, sectionSubjects });
  } catch (error: any) {
    console.error('Error fetching teacher live classes:', error);
    return NextResponse.json({ error: 'Failed to fetch live classes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user?.email as string;
    const teacher = await prisma.user.findUnique({ where: { email } });

    if (!teacher || !teacher.schoolId) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, sectionSubjectId, date, startTime, endTime, meetingLink } = body;

    if (!title || !sectionSubjectId || !date || !startTime || !endTime || !meetingLink) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [classId, subjectId] = sectionSubjectId.split('_');

    const classroom = await prisma.classRoom.findUnique({ where: { id: classId } });
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });

    const className = classroom ? `${classroom.name}` : "Class";
    const subjectName = subject ? `${subject.name}` : "Subject";

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    const liveClass = await prisma.liveClass.create({
      data: {
        title,
        startTime: start,
        endTime: end,
        schoolId: teacher.schoolId,
        teacherId: teacher.id,
        meetingUrl: meetingLink,
        className,
        subjectName
      }
    });

    return NextResponse.json({ success: true, liveClass });
  } catch (error: any) {
    console.error('Error creating live class:', error);
    return NextResponse.json({ error: 'Failed to schedule live class' }, { status: 500 });
  }
}
