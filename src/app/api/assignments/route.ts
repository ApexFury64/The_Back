import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = session.schoolId || 'dps-001';

    let assignmentsQuery: any = adminDb.collection('assignments');
    if (session.role !== 'super-admin') {
      assignmentsQuery = assignmentsQuery.where('schoolId', '==', schoolId);
    }
    
    const snapshot = await assignmentsQuery.get();
    
    const colors = ['#0ea5e9', '#00d4aa', '#a78bfa', '#f59e0b', '#f97066'];
    
    const assignments = snapshot.docs.map((doc: any, index: number) => {
      const data = doc.data();
      const color = data.color || colors[index % colors.length];
      
      return {
        id: doc.id,
        ...data,
        subject: { name: data.subject || 'Unknown', color: color },
        submissions: [] // Empty submissions array means pending in student dashboard
      };
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}
