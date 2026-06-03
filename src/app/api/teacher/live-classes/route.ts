import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('teacherEmail') || session.email;

    // Fetch from Firestore
    const snapshot = await adminDb.collection('liveClasses')
      .where('teacherEmail', '==', email)
      .orderBy('startTime', 'asc')
      .get();

    const liveClasses = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        class: data.className || 'General',
        subject: data.subjectName || 'General',
        date: data.date,
        startTime: data.startTimeStr,
        endTime: data.endTimeStr,
        status: data.status || 'scheduled',
        meetingLink: data.meetingLink
      };
    });

    return NextResponse.json({ liveClasses, sectionSubjects: [] });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const createLiveClassSchema = z.object({
  title: z.string().min(3),
  sectionSubjectId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  meetingLink: z.string().url().optional().or(z.literal('')),
  className: z.string().optional(),
  subjectName: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = createLiveClassSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }

    const { title, sectionSubjectId, date, startTime, endTime, meetingLink, className, subjectName } = parsed.data;

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    const newDoc = adminDb.collection('liveClasses').doc();
    const newLiveClass = {
      id: newDoc.id,
      title,
      sectionSubjectId,
      className: className || 'General',
      subjectName: subjectName || 'General',
      teacherEmail: session.email,
      date,
      startTimeStr: startTime,
      endTimeStr: endTime,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status: 'scheduled',
      meetingLink: meetingLink || 'https://zoom.us/j/dummy',
      createdAt: new Date().toISOString()
    };

    await newDoc.set(newLiveClass);

    return NextResponse.json({ success: true, liveClass: newLiveClass });
  } catch (error) {
    console.error('Error creating live class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
