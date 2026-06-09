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
      include: { questions: true }
    });

    if (!quiz || quiz.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const isStudent = userRole === 'STUDENT';

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      subject: { name: 'General' },
      duration: quiz.duration,
      questions: quiz.questions.map((q: any) => ({
        id: q.id,
        text: q.question,     // 'text' field for student modal
        question: q.question, // 'question' field for teacher view
        options: JSON.parse(q.options),
        ...(isStudent ? {} : { answer: q.answer }) // hide answers from students
      }))
    });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const schoolId = (session?.user as any)?.schoolId;
    const userRole = (session?.user as any)?.role;

    if (!session || !schoolId || !['TEACHER', 'SCHOOLADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz || quiz.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Cascade delete — questions and attempts deleted automatically via schema
    await prisma.quiz.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
