import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const studentId = (session?.user as any)?.id;

    if (!session || userRole !== 'STUDENT' || !studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId, answers } = await request.json(); // answers: Record<string, string>

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    let correctCount = 0;
    quiz.questions.forEach((q: any) => {
      const studentAnswer = answers[q.id];
      if (studentAnswer && studentAnswer === q.answer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        score: scorePercentage
      }
    });

    return NextResponse.json({ success: true, score: scorePercentage, attemptId: attempt.id });
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
