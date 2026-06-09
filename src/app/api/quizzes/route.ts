import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const schoolId = (session?.user as any)?.schoolId;
    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;

    if (!session || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isStudent = userRole === 'STUDENT' && !!userId;

    // Fetch base quizzes for the school
    const dbQuizzes = await prisma.quiz.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: { questions: true }
        },
        // Always include attempts so we can filter by student separately
        attempts: isStudent
          ? { where: { studentId: userId }, select: { id: true, score: true, createdAt: true } }
          : { select: { id: true, score: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Shape the response to match what both teacher and student frontends expect
    const quizzes = dbQuizzes.map((q: any) => ({
      id: q.id,
      title: q.title,
      subject: { name: 'General' },
      duration: q.duration,
      timeLimit: q.duration,
      _count: { questions: q._count.questions },
      questions: q._count.questions,
      // For students: attempts are pre-filtered to their own. For teachers: show all.
      attempts: Array.isArray(q.attempts) ? q.attempts : [],
      class: null,
      difficulty: 'Medium',
      due: null,
      createdAt: q.createdAt,
    }));

    return NextResponse.json(quizzes);
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    const body = await request.json();
    const { title, duration, questions } = body;

    const quiz = await prisma.quiz.create({
      data: {
        schoolId,
        title: title || 'Untitled Quiz',
        duration: duration || 15,
        questions: {
          create: (questions || []).map((q: any) => ({
            question: q.question,
            options: JSON.stringify(q.options || []),
            answer: q.answer || ''
          }))
        }
      }
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
