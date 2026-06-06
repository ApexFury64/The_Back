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
      for (const [key, val] of Object.entries(mappings)) {
        if (val === teacherId) {
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

  return Array.from(new Set([...assignedSubjectIds, ...primarySubjectIds]));
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

    const { topicId, ebookHtml, ebookVideoUrl } = await request.json();

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

    // Update topic eBook fields
    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        ebookHtml: ebookHtml !== undefined ? ebookHtml : null,
        ebookVideoUrl: ebookVideoUrl !== undefined ? ebookVideoUrl : null
      }
    });

    return NextResponse.json({ success: true, topic: updatedTopic });
  } catch (error: any) {
    console.error('Error updating eBook content:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
