import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('userEmail');

    let userRole = (session?.user as any)?.role;
    let schoolId = (session?.user as any)?.schoolId;
    let studentId = (session?.user as any)?.id;
    let standard = (session?.user as any)?.standard;

    // Resolve user details using query parameter or session email
    const targetEmail = queryEmail || session?.user?.email;

    if (targetEmail) {
      const dbUser = await prisma.user.findUnique({
        where: { email: targetEmail },
        include: {
          class: true
        }
      });
      if (dbUser) {
        if (!userRole) userRole = dbUser.role;
        if (!schoolId) schoolId = dbUser.schoolId;
        if (!studentId && dbUser.role === 'STUDENT') studentId = dbUser.id;
        if (!standard && dbUser.class?.standard) {
          standard = dbUser.class.standard;
        }
      }
    }

    // Secondary fallback using database lookup via session studentId
    if (!standard && userRole === 'STUDENT' && studentId) {
      const studentUser = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          class: true
        }
      });
      if (studentUser?.class?.standard) {
        standard = studentUser.class.standard;
      }
    }

    // Default to '8' since most syllabus seed data is for 8th standard
    if (!standard) {
      standard = '8';
    }

    if (!session || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized: School context missing' }, { status: 401 });
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

      // Sort units/chapters numerically
      const sortedUnitEntries = Object.entries(topicsByUnit).sort(([aTitle], [bTitle]) => {
        const getChapterNumber = (title: string): number => {
          const match = title.match(/(?:chapter|unit|ch|ch\.)\s*(\d+)/i);
          return match ? parseInt(match[1], 10) : Infinity;
        };
        const aNum = getChapterNumber(aTitle);
        const bNum = getChapterNumber(bTitle);
        if (aNum !== bNum) {
          return aNum - bNum;
        }
        return aTitle.localeCompare(bTitle);
      });

      let overallTopicIndex = 0;
      const actualModules = sortedUnitEntries.map(([unitName, topics], uIndex) => {
        // Sort subtopics inside the unit by order ascending
        const sortedTopics = [...topics].sort((a, b) => (a.order || 0) - (b.order || 0));

        const subTopics = sortedTopics.map((t) => {
          const progress = userProgressMap[t.id];
          let status = 'locked';
          
          if (progress) {
            status = progress.status;
          } else if (overallTopicIndex === 0 && t.ebookHtml) {
            status = 'in-progress';
          }
          
          // A topic is unlocked only if it has ebookHtml
          if (!t.ebookHtml && status !== 'completed') {
            status = 'locked';
          }

          if (status === 'completed') {
            completedTopics++;
          } else {
            overallTopicIndex++;
          }

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
