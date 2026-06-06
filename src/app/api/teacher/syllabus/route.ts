import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

async function getAssignedSubjectIds(teacherId: string, schoolId: string): Promise<string[]> {
  // 1. Fetch classrooms where the teacher is assigned
  const classRooms = await prisma.classRoom.findMany({
    where: {
      OR: [
        { classTeacherId: teacherId },
        { assignments: { some: { teacherId } } }
      ]
    },
    select: { id: true }
  });

  // 2. Fetch the subject-teacher assignments mapping from global Settings
  const settingKey = `section_subject_teachers_${schoolId}`;
  const setting = await prisma.setting.findUnique({ where: { key: settingKey } });
  let assignedSubjectIds: string[] = [];

  if (setting) {
    try {
      const mappings: Record<string, string> = JSON.parse(setting.value);
      // Find subject IDs where the teacher matches
      for (const [key, val] of Object.entries(mappings)) {
        if (val === teacherId) {
          // key is of the form `${classId}_${subjectId}`
          const parts = key.split('_');
          if (parts.length === 2 && parts[1]) {
            assignedSubjectIds.push(parts[1]);
          }
        }
      }
    } catch (e) {
      console.error('Error parsing section subject teachers settings:', e);
    }
  }

  // 3. Fallback: Check if the teacher has any explicit assignments records linking them to subjects
  const directAssignments = await prisma.assignment.findMany({
    where: { teacherId, schoolId },
    select: { subjectId: true }
  });
  directAssignments.forEach(da => {
    assignedSubjectIds.push(da.subjectId);
  });

  // 4. Fallback 2: Check by primarySubject name matching (case-insensitive)
  const teacherUser = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { primarySubject: true }
  });

  let primarySubjectIds: string[] = [];
  if (teacherUser?.primarySubject) {
    const matchingSubjects = await prisma.subject.findMany({
      where: {
        schoolId,
        name: { equals: teacherUser.primarySubject, mode: 'insensitive' }
      },
      select: { id: true }
    });
    matchingSubjects.forEach(ms => {
      primarySubjectIds.push(ms.id);
    });
  }

  // De-duplicate all target subject IDs
  return Array.from(new Set([...assignedSubjectIds, ...primarySubjectIds]));
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;
    const teacherId = (session?.user as any)?.id;

    if (!session || userRole !== 'TEACHER' || !schoolId || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const finalSubjectIds = await getAssignedSubjectIds(teacherId, schoolId);

    // Fetch only the assigned subjects
    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        id: { in: finalSubjectIds }
      },
      include: {
        topics: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: [
        { standard: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ subjects });
  } catch (error: any) {
    console.error('Error fetching teacher syllabus:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;
    const teacherId = (session?.user as any)?.id;

    if (!session || userRole !== 'TEACHER' || !schoolId || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subjectId, topics, clearExisting } = await request.json();

    if (!subjectId || !Array.isArray(topics)) {
      return NextResponse.json({ error: 'Missing subjectId or topics array' }, { status: 400 });
    }

    // Verify subject belongs to the school
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId }
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Verify subject is assigned to this teacher
    const finalSubjectIds = await getAssignedSubjectIds(teacherId, schoolId);
    if (!finalSubjectIds.includes(subjectId)) {
      return NextResponse.json({ error: 'Unauthorized: You are not assigned to this subject' }, { status: 403 });
    }

    // Process in transaction
    const result = await prisma.$transaction(async (tx) => {
      if (clearExisting) {
        // Delete existing topics
        await tx.topic.deleteMany({
          where: { subjectId }
        });
      }

      // Find highest order if not clearing
      let startOrder = 1;
      if (!clearExisting) {
        const lastTopic = await tx.topic.findFirst({
          where: { subjectId },
          orderBy: { order: 'desc' }
        });
        if (lastTopic) {
          startOrder = lastTopic.order + 1;
        }
      }

      // Create new topics
      const created = [];
      for (let i = 0; i < topics.length; i++) {
        const t = topics[i];
        if (!t.title) continue;

        const topic = await tx.topic.create({
          data: {
            subjectId,
            title: t.title,
            description: t.description || '',
            icon: t.icon || 'BookOpen',
            order: t.order !== undefined && t.order !== null ? parseInt(t.order) : (startOrder + i)
          }
        });
        created.push(topic);
      }

      return created;
    });

    return NextResponse.json({ success: true, count: result.length, topics: result });
  } catch (error: any) {
    console.error('Error updating syllabus:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;
    const teacherId = (session?.user as any)?.id;

    if (!session || userRole !== 'TEACHER' || !schoolId || !teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      return NextResponse.json({ error: 'Missing topicId parameter' }, { status: 400 });
    }

    // Verify the topic's subject belongs to this school
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        subject: true
      }
    });

    if (!topic || topic.subject.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Topic not found or unauthorized' }, { status: 404 });
    }

    // Verify subject is assigned to this teacher
    const finalSubjectIds = await getAssignedSubjectIds(teacherId, schoolId);
    if (!finalSubjectIds.includes(topic.subjectId)) {
      return NextResponse.json({ error: 'Unauthorized: You are not assigned to this subject' }, { status: 403 });
    }

    await prisma.topic.delete({
      where: { id: topicId }
    });

    return NextResponse.json({ success: true, message: 'Topic deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
