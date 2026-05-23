import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userEmail, topicId } = await request.json();

    if (!userEmail || !topicId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const userId = user.id;

    // Mark current topic as completed
    await prisma.topicProgress.upsert({
      where: {
        userId_topicId: { userId, topicId }
      },
      update: { status: 'completed' },
      create: { userId, topicId, status: 'completed' }
    });

    // Find the next topic to unlock
    // 1. Get the current topic to know its module
    const currentTopic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        module: {
          include: {
            subject: {
              include: {
                modules: {
                  include: {
                    topics: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!currentTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const allModules = currentTopic.module.subject.modules;
    
    // Flatten all topics sequentially
    const sequentialTopics = allModules.flatMap(m => m.topics);
    const currentIndex = sequentialTopics.findIndex(t => t.id === topicId);

    // If there is a next topic, check if it's locked, and if so unlock it
    if (currentIndex !== -1 && currentIndex < sequentialTopics.length - 1) {
      const nextTopic = sequentialTopics[currentIndex + 1];
      
      const nextProgress = await prisma.topicProgress.findUnique({
        where: { userId_topicId: { userId, topicId: nextTopic.id } }
      });

      if (!nextProgress || nextProgress.status === 'locked') {
        await prisma.topicProgress.upsert({
          where: { userId_topicId: { userId, topicId: nextTopic.id } },
          update: { status: 'in-progress' },
          create: { userId, topicId: nextTopic.id, status: 'in-progress' }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing topic:', error);
    return NextResponse.json({ error: 'Failed to complete topic' }, { status: 500 });
  }
}
