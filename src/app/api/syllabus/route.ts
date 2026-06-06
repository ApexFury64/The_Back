import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;
    const studentId = (session?.user as any)?.id;
    const standard = (session?.user as any)?.standard || '10'; // Default to 10 for teachers/admins without specific standard context right now

    if (!session || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const colors: Record<string, string> = {
      Mathematics: '#0ea5e9',
      Science: '#00d4aa',
      English: '#a78bfa',
      History: '#f59e0b',
      Geography: '#f97066',
      'Computer Science': '#38bdf8',
    };

    // 1. Fetch subjects for the current standard and school
    const subjects = await prisma.subject.findMany({
      where: { schoolId, standard: standard.toString() },
      include: {
        topics: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // 2. If it's a student, fetch their topic progress
    let userProgressMap: Record<string, any> = {};
    if (userRole === 'STUDENT' && studentId) {
      const progresses = await prisma.topicProgress.findMany({
        where: { studentId }
      });
      progresses.forEach(p => {
        userProgressMap[p.topicId] = p;
      });
    }

    // 3. Format the response
    const subjectsData = subjects.map((sub, index) => {
      let totalTopics = sub.topics.length;
      let completedTopics = 0;

      // Group topics by unitTitle dynamically
      const topicsByUnit: Record<string, any[]> = {};
      sub.topics.forEach((t) => {
        const unitName = t.unitTitle || 'General Units';
        if (!topicsByUnit[unitName]) {
          topicsByUnit[unitName] = [];
        }
        topicsByUnit[unitName].push(t);
      });

      let overallTopicIndex = 0;
      const actualModules = Object.entries(topicsByUnit).map(([unitName, topics], uIndex) => {
        const subTopics = topics.map((t) => {
          const progress = userProgressMap[t.id];
          const status = progress ? progress.status : (overallTopicIndex === 0 ? 'in-progress' : 'locked');
          if (status === 'completed') completedTopics++;
          overallTopicIndex++;

          return {
            id: t.id,
            title: t.title,
            icon: t.icon || 'circle',
            status,
            ebookVideoUrl: t.ebookVideoUrl
          };
        });

        let unitStatus = 'locked';
        if (subTopics.every(st => st.status === 'completed')) {
          unitStatus = 'completed';
        } else if (subTopics.some(st => st.status === 'completed' || st.status === 'in-progress')) {
          unitStatus = 'in-progress';
        }

        return {
          id: `mod_${sub.id}_${uIndex}`,
          title: unitName,
          status: unitStatus,
          subTopics
        };
      });

      const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
      const grade = progressPercent > 90 ? 'A+' : progressPercent > 80 ? 'A' : progressPercent > 70 ? 'B+' : 'B';

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        color: colors[sub.name] || '#0ea5e9',
        standard: sub.standard,
        progress: progressPercent,
        grade: userRole === 'STUDENT' ? grade : 'N/A', // Only show grades for students
        modules: actualModules
      };
    });

    return NextResponse.json(subjectsData);
  } catch (error: any) {
    console.error('Error fetching syllabus:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
