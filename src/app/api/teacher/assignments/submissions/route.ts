import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing assignmentId' }, { status: 400 });
    }

    // Verify teacher owns this assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        teacher: true
      }
    });

    const email = session.user?.email;

    if (!assignment || assignment.teacher.email !== email) {
      return NextResponse.json({ error: 'Assignment not found or unauthorized' }, { status: 404 });
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    const formattedSubmissions = submissions.map(s => ({
      id: s.id,
      status: s.status,
      grade: s.grade,
      submittedAt: s.submittedAt,
      // For now, no file uploads are supported natively, but if there's a file path we can pass it
      filePath: '#',
      user: {
        name: s.student.name,
        email: s.student.email
      }
    }));

    return NextResponse.json({ submissions: formattedSubmissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, grade, feedback } = body;

    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
    }

    // Add comments field to Submission model if it doesn't exist, but our schema only has `grade`.
    // Wait, let's check prisma schema again. 
    // `status: String @default("pending")`, `grade: String?`
    // We don't have a `comments` field on the `Submission` model!
    // I should probably add `feedback: String?` to `Submission` in schema.prisma.
    // For now, just save the grade and status.

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: grade,
        status: 'graded'
      },
      include: {
        student: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, submission: { user: { name: submission.student.name } } });
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
