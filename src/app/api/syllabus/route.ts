import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ error: 'Missing userEmail parameter' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const userId = user.id;

    // Fetch subjects with their modules and topics
    const subjects = await prisma.subject.findMany({
      include: {
        modules: {
          include: {
            topics: {
              include: {
                progress: {
                  where: { userId }
                }
              }
            }
          }
        }
      }
    });

    // Format the response to match the frontend expectations
    const formattedSubjects = subjects.map(subject => {
      let completedTopics = 0;
      let totalTopics = 0;

      const modules = subject.modules.map(mod => {
        const subTopics = mod.topics.map(topic => {
          totalTopics++;
          const progress = topic.progress[0];
          const status = progress ? progress.status : 'locked';
          if (status === 'completed') completedTopics++;

          return {
            id: topic.id,
            title: topic.title,
            status
          };
        });

        // Determine module status based on its topics
        let modStatus = 'locked';
        if (subTopics.every(t => t.status === 'completed')) modStatus = 'completed';
        else if (subTopics.some(t => t.status !== 'locked')) modStatus = 'in-progress';

        return {
          id: mod.id,
          title: mod.title,
          status: modStatus,
          subTopics
        };
      });

      const progressPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        color: subject.color,
        standard: subject.standard,
        progress: progressPercent,
        grade: progressPercent >= 90 ? 'A+' : progressPercent >= 80 ? 'A' : progressPercent >= 70 ? 'B+' : 'B',
        modules
      };
    });

    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    return NextResponse.json({ error: 'Failed to fetch syllabus' }, { status: 500 });
  }
}
