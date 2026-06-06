import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      return NextResponse.json({ error: 'Missing topicId parameter' }, { status: 400 });
    }

    // Fetch topic details
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        subject: true
      }
    });

    if (!topic || topic.subject.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Topic not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      topicId: topic.id,
      title: topic.title,
      ebookHtml: topic.ebookHtml,
      ebookVideoUrl: topic.ebookVideoUrl
    });
  } catch (error: any) {
    console.error('Error fetching eBook content:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
