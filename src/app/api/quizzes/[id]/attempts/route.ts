import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const schoolId = (session?.user as any)?.schoolId;
    const userRole = (session?.user as any)?.role;

    if (!session || !schoolId || !['TEACHER', 'SCHOOLADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { createdAt: 'asc' },
        },
        attempts: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                class: {
                  select: { name: true, standard: true, section: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { questions: true, attempts: true }
        }
      }
    });

    if (!quiz || quiz.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Compute stats
    const attempts = quiz.attempts;
    const scores = attempts.map((a: any) => a.score);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((s: number, n: number) => s + n, 0) / scores.length)
      : 0;
    const highScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowScore = scores.length > 0 ? Math.min(...scores) : 0;
    const passCount = scores.filter((s: number) => s >= 60).length;

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      duration: quiz.duration,
      totalQuestions: quiz._count.questions,
      totalAttempts: quiz._count.attempts,
      stats: { avgScore, highScore, lowScore, passCount, failCount: attempts.length - passCount },
      questions: quiz.questions.map((q: any) => ({
        id: q.id,
        text: q.question,
        options: JSON.parse(q.options),
        answer: q.answer,
      })),
      attempts: attempts.map((a: any) => ({
        id: a.id,
        score: a.score,
        submittedAt: a.createdAt,
        student: {
          id: a.student.id,
          name: a.student.name || 'Unknown',
          email: a.student.email,
          className: a.student.class?.name ?? 'No Class',
          standard: a.student.class?.standard ?? '—',
          section: a.student.class?.section ?? '—',
        }
      }))
    });
  } catch (error: any) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
