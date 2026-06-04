import { NextResponse } from 'next/server';

export async function GET() {
  const classes = [
    { id: '1', title: 'Math 101 - Algebra', time: '10:00 AM', duration: 60, status: 'scheduled' },
    { id: '2', title: 'Science Lab - Physics', time: '01:00 PM', duration: 45, status: 'scheduled' }
  ];
  return NextResponse.json(classes);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, ...body });
}
