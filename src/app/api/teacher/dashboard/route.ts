import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.email;
    const teacher = { name: session.name || 'Teacher', email: email, employeeId: 'EMP001' };

    const recentHomework = [
      { id: '1', title: 'Algebra Homework 1', class: 'Class 10-A', subject: 'Mathematics', dueDate: 'Tomorrow', submissions: 25 },
      { id: '2', title: 'Science Project', class: 'Class 9-B', subject: 'Science', dueDate: 'Next Week', submissions: 10 },
      { id: '3', title: 'History Essay', class: 'Class 8-A', subject: 'History', dueDate: 'In 3 days', submissions: 28 },
    ];

    const teacherStats = [
      { title: 'Total Students', value: '170', trend: 'Across 5 classes', icon: 'Users', trendUp: true },
      { title: 'Avg Class Score', value: '84%', trend: 'Good performance', icon: 'TrendingUp', trendUp: true },
      { title: 'Pending Grades', value: '12', trend: 'Needs attention', icon: 'FileCheck', trendUp: false },
      { title: 'Classes Assigned', value: '5', trend: 'Subject teacher', icon: 'School', trendUp: true },
    ];

    const performanceData = [
      { name: 'Week 1', value: 75, value2: 70 },
      { name: 'Week 2', value: 78, value2: 75 },
      { name: 'Week 3', value: 80, value2: 76 },
      { name: 'Week 4', value: 85, value2: 80 },
      { name: 'Week 5', value: 82, value2: 79 },
    ];
    
    const teacherClasses = [
      { id: '1', name: 'Class 10', grade: 10, sections: ['A', 'B'], students: 37, subjects: [{ name: 'Mathematics', color: '#0ea5e9' }] },
      { id: '2', name: 'Class 9', grade: 9, sections: ['A', 'B'], students: 37, subjects: [{ name: 'Science', color: '#00d4aa' }] },
      { id: '3', name: 'Class 8', grade: 8, sections: ['A'], students: 30, subjects: [{ name: 'English', color: '#8b5cf6' }] },
      { id: '4', name: 'Class 7', grade: 7, sections: ['A'], students: 37, subjects: [{ name: 'History', color: '#f59e0b' }] },
      { id: '5', name: 'Class 6', grade: 6, sections: ['A'], students: 29, subjects: [{ name: 'Computer Science', color: '#f97066' }] }
    ];

    const weakStudents = [
      { name: 'Charlie Brown', class: '10-A', score: 55, issue: 'Critically low scores', trend: '-5% this week' },
      { name: 'Ethan Hunt', class: '8-A', score: 72, issue: 'Below average performance', trend: '-3% this week' }
    ];

    return NextResponse.json({
      teacher,
      school: { name: 'AI Tutor Academy', code: 'TW001' },
      teacherStats,
      performanceData,
      teacherClasses,
      weakStudents,
      recentHomework,
      classTeacherSections: [],
      students: [],
    });
  } catch (error: any) {
    console.error('Error fetching teacher dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch teacher dashboard data' }, { status: 500 });
  }
}
