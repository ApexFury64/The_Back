import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;
    const teacherId = (session?.user as any)?.id;

    if (!session || userRole !== 'TEACHER' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all subjects for the school so the teacher can view/manage
    const subjects = await prisma.subject.findMany({
      where: { schoolId },
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

    if (!session || userRole !== 'TEACHER' || !schoolId) {
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

    if (!session || userRole !== 'TEACHER' || !schoolId) {
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

    await prisma.topic.delete({
      where: { id: topicId }
    });

    return NextResponse.json({ success: true, message: 'Topic deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
