import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: params.id, title: 'Algebra Basics', subject: 'Math', duration: 15, questions: [] });
}
