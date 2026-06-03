import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.email;

    // Get Parent Profile
    let parent = null;
    const usersSnapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (!usersSnapshot.empty) {
      parent = { id: usersSnapshot.docs[0].id, ...usersSnapshot.docs[0].data() };
    }

    if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 });

    // In Firebase, we provide robust mock aggregates for the child's progress
    const childDailyActivity = [
      { time: '08:00 AM', activity: 'Logged in to portal', type: 'class' },
      { time: '10:30 AM', activity: 'AI Tutor Session', type: 'ai' },
      { time: '01:00 PM', activity: 'Viewed Assignment Details', type: 'assignment' },
      { time: '03:45 PM', activity: 'Completed a Quiz', type: 'quiz' },
      { time: '05:00 PM', activity: 'Completed a Topic', type: 'study' },
    ];

    const studentSubjects = [
      { name: 'Mathematics', score: 85, color: '#0ea5e9', standard: '8' },
      { name: 'Science', score: 78, color: '#00d4aa', standard: '8' },
      { name: 'History', score: 92, color: '#f59e0b', standard: '8' },
      { name: 'English', score: 88, color: '#a78bfa', standard: '8' },
      { name: 'Mathematics', score: 82, color: '#0ea5e9', standard: '7' },
      { name: 'Science', score: 80, color: '#00d4aa', standard: '7' },
      { name: 'History', score: 85, color: '#f59e0b', standard: '7' },
      { name: 'Mathematics', score: 90, color: '#0ea5e9', standard: '6' },
      { name: 'Science', score: 85, color: '#00d4aa', standard: '6' },
    ];

    const weakSubjectAlerts = studentSubjects
      .filter(s => s.score < 80)
      .map(s => ({
        subject: s.name,
        issue: `Avg score: ${s.score}%. Needs more practice.`,
        recommendation: `Schedule an AI Tutor session for ${s.name}`,
        severity: s.score < 60 ? 'high' : 'medium' as string,
      }));

    const studentAssignments = [
      { id: '1', title: 'Algebra Worksheet', subject: 'Mathematics', subjectColor: '#0ea5e9', status: 'pending' },
      { id: '2', title: 'Physics Lab Report', subject: 'Science', subjectColor: '#00d4aa', status: 'submitted' },
    ];

    const parentChildStats = [
      { title: 'Overall Grade', value: 'B+', trend: 'Consistent', icon: 'GraduationCap', trendUp: true },
      { title: 'Study Hours', value: '12.5h', trend: '15 topics done', icon: 'Clock', trendUp: true },
      { title: 'Attendance', value: '95%', trend: 'Excellent', icon: 'CheckCircle', trendUp: true },
      { title: 'Quizzes', value: '8', trend: 'Taken so far', icon: 'FileText', trendUp: null },
    ];

    const weeklyStudyData = [
      { name: 'Mon', value: 45, value2: 15 },
      { name: 'Tue', value: 60, value2: 30 },
      { name: 'Wed', value: 30, value2: 0 },
      { name: 'Thu', value: 90, value2: 45 },
      { name: 'Fri', value: 45, value2: 20 },
      { name: 'Sat', value: 120, value2: 60 },
      { name: 'Sun', value: 60, value2: 15 },
    ];

    const childrenData = [
      { id: 'child1', name: 'Arjun', className: 'Class 8' }
    ];

    const selectedChild = {
      name: 'Arjun',
      email: 'arjun@student.com',
      className: 'Class 8',
      classTeacher: 'Mr. Anderson',
      parentChildStats,
      weeklyStudyData,
      weakSubjectAlerts,
      studentSubjects,
      studentAssignments,
      childDailyActivity,
    };

    return NextResponse.json({
      parent: { name: parent.name || 'Parent', email: parent.email, phone: parent.phone || '' },
      school: { name: 'Firebase School' },
      children: childrenData,
      selectedChild,
      
      // Flatten first child's data for backward-compat
      parentChildStats,
      weeklyStudyData,
      weakSubjectAlerts,
      studentSubjects,
      studentAssignments,
      student: { name: selectedChild.name, email: selectedChild.email },
      childDailyActivity,
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch parent dashboard data' }, { status: 500 });
  }
}
