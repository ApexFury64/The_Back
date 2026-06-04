import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'teacher') {
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
    const classes = teacher.taughtClasses;
    const subjects = await prisma.subject.findMany({ where: { schoolId: teacher.schoolId } });

    const sectionSubjects: any[] = [];
    classes.forEach(c => {
      subjects.filter(s => s.standard === c.standard).forEach(s => {
        sectionSubjects.push({
          id: `${c.id}_${s.id}`, // Custom composite ID for the dropdown
          section: { name: c.section, class: { name: `Class ${c.standard}` } },
          subject: { name: s.name }
        });
      });
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
    if (!session || (session.user as any)?.role !== 'teacher') {
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
