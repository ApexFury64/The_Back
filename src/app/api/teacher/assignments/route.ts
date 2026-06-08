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
      include: {
        taughtClasses: true
      }
    });

    if (!teacher || !teacher.schoolId) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: {
          include: { students: true }
        },
        subject: true,
        submissions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedAssignments = assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      class: a.class.name,
      subject: a.subject.name,
      dueDate: a.dueDate.toISOString().split('T')[0],
      submitted: a.submissions.length,
      total: a.class.students.length,
      status: a.submissions.length > 0 ? 'completed' : 'pending',
      createdAt: a.createdAt.getTime()
    }));

    // For creating an assignment, a teacher needs a list of classes and subjects they can assign to.
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
          console.error('Error parsing settings for teacher assignments:', e);
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

    // 1. Process explicit subject-teacher assignments from Settings
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
          console.error('Error parsing settings for teacher assignments combo:', e);
        }
      }
    }

    // 2. Process class teacher classroom assignments (all subjects for their standard)
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

    // 3. Fallback: Include any classroom/subject combinations from previous assignments
    formattedAssignments.forEach(a => {
      const dbAssignment = assignments.find(da => da.id === a.id);
      if (dbAssignment) {
        const comboKey = `${dbAssignment.classId}_${dbAssignment.subjectId}`;
        if (!addedKeys.has(comboKey)) {
          addedKeys.add(comboKey);
          sectionSubjects.push({
            id: comboKey,
            section: { name: dbAssignment.class.section, class: { name: `Class ${dbAssignment.class.standard}` } },
            subject: { name: dbAssignment.subject.name }
          });
        }
      }
    });

    return NextResponse.json({ assignments: formattedAssignments, sectionSubjects });
  } catch (error: any) {
    console.error('Error fetching teacher assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
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
    const { title, description, dueDate, sectionSubjectId } = body;

    if (!title || !dueDate || !sectionSubjectId) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [classId, subjectId] = sectionSubjectId.split('_');

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        schoolId: teacher.schoolId,
        classId,
        subjectId,
        teacherId: teacher.id
      }
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
