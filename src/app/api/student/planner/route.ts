import { NextResponse } from 'next/server';

export async function GET() {
  const events = [
    { id: '1', title: 'Math Quiz', date: '2026-06-05', type: 'quiz' },
    { id: '2', title: 'Science Project Due', date: '2026-06-10', type: 'assignment' }
  ];
  return NextResponse.json(events);
}
