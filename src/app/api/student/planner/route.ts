import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('userEmail') || session.email;
    const dateParam = searchParams.get('date');

    const schedule = [];

    // Mock Live Classes
    schedule.push({
      id: `lc-1`,
      title: 'Advanced Algebra Live',
      time: '09:00 - 10:30',
      date: dateParam || new Date().toISOString().split('T')[0],
      type: 'live',
      subject: 'Mathematics',
      color: '#00d4aa',
      link: 'https://meet.google.com/abc-defg-hij'
    });

    schedule.push({
      id: `lc-2`,
      title: 'Physics Lab: Optics',
      time: '11:00 - 12:30',
      date: dateParam || new Date().toISOString().split('T')[0],
      type: 'live',
      subject: 'Science',
      color: '#0ea5e9',
      link: 'https://meet.google.com/xyz-uvwx-qrs'
    });

    // Mock Assignments
    schedule.push({
      id: `a-1`,
      title: 'Due: History Essay',
      time: '23:59',
      date: dateParam || new Date().toISOString().split('T')[0],
      type: 'assignment',
      subject: 'History',
      color: '#f59e0b'
    });

    // Mock AI Study Session
    schedule.push({
      id: `ss-1`,
      title: 'Review Physics Formulas with AI',
      time: '16:00 - 17:00',
      date: dateParam || new Date().toISOString().split('T')[0],
      type: 'ai',
      subject: 'General',
      color: '#34d399'
    });

    // Sort chronologically
    schedule.sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time.split(' ')[0]}:00`).getTime();
      const timeB = new Date(`${b.date}T${b.time.split(' ')[0]}:00`).getTime();
      return timeA - timeB;
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error fetching planner schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
