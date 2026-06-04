import { NextResponse } from 'next/server';

export async function GET() {
  const quizzes = [
    { id: '1', title: 'Algebra Basics', subject: 'Math', duration: 15, questions: 10 }
  ];
  return NextResponse.json(quizzes);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, ...body });
}
