import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, answers, timeTaken, userEmail } = body;

    if (!quizId || !answers || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user.id;

    // Get the actual questions with correct answers
    const questions = await prisma.question.findMany({
      where: { quizId }
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: 'Quiz not found or has no questions' }, { status: 404 });
    }

    // Grade the quiz
    let correctCount = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    }

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    // Save the attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score: scorePercentage,
        timeTaken: timeTaken || 0
      }
    });

    return NextResponse.json({ score: scorePercentage, correctCount, totalQuestions: questions.length, attempt });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
