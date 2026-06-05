import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true
      }
    });

    if (!quiz || quiz.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Format the response to match the frontend expectations
    // Usually, we don't send the answer to the frontend unless it's an admin/teacher!
    const userRole = (session.user as any).role;
    const isStudent = userRole === 'STUDENT';

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      subject: 'General', // TODO: Add subjectId to Quiz schema
      duration: quiz.duration,
      questions: quiz.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: JSON.parse(q.options),
        ...(isStudent ? {} : { answer: q.answer }) // Hide answer from students
      }))
    });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
