import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user?.email as string;

    const parentData = await prisma.user.findUnique({
      where: { email },
      include: { school: true }
    });

    if (!parentData || !parentData.schoolId) {
      return NextResponse.json({ error: 'Parent or school not found' }, { status: 404 });
    }

    // In a real app, we'd have a Parent-Child relation. For now, we mock the child based on the parent's school.
    const child = await prisma.user.findFirst({
      where: { schoolId: parentData.schoolId, role: 'STUDENT' },
      include: { class: { include: { classTeacher: true } } }
    });

    if (!child) {
      return NextResponse.json({ error: 'No student found in this school' }, { status: 404 });
    }

    const childDailyActivity = [
      { time: '08:00 AM', activity: 'Logged in to portal', type: 'class' },
      { time: '10:30 AM', activity: 'AI Tutor Session', type: 'ai' },
    ];

    const subjects = await prisma.subject.findMany({
       where: { schoolId: parentData.schoolId, standard: child.class?.standard }
    });
    
    const assignments = await prisma.assignment.findMany({
       where: { classId: child.classId as string },
       include: { subject: true, submissions: { where: { studentId: child.id } } },
       orderBy: { dueDate: 'desc' }
    });

    const studentSubjects = subjects.map(s => {
       // calculate score dynamically based on graded assignments
       const subjectAssignments = assignments.filter(a => a.subjectId === s.id);
       let totalGrade = 0;
       let gradedCount = 0;
       subjectAssignments.forEach(a => {
          if (a.submissions.length > 0 && a.submissions[0].status === 'graded') {
             const gradeNum = parseInt(a.submissions[0].grade || '0');
             if (!isNaN(gradeNum)) {
                totalGrade += gradeNum;
                gradedCount++;
             }
          }
       });
       const score = gradedCount > 0 ? Math.round(totalGrade / gradedCount) : 85; // default to 85 if no grades
       return {
         name: s.name,
         score,
         color: s.color,
         standard: s.standard
       };
    });

    const weakSubjectAlerts = studentSubjects
      .filter(s => s.score < 80)
      .map(s => ({
        subject: s.name,
        issue: `Avg score: ${s.score}%. Needs more practice.`,
        recommendation: `Schedule an AI Tutor session for ${s.name}`,
        severity: s.score < 60 ? 'high' : 'medium' as string,
      }));

    const studentAssignments = assignments.map(a => ({
       id: a.id,
       title: a.title,
       subject: a.subject.name,
       subjectColor: a.subject.color,
       status: a.submissions.length > 0 ? a.submissions[0].status : 'pending'
    }));

    const pendingCount = studentAssignments.filter(a => a.status === 'pending').length;
    const completedCount = studentAssignments.filter(a => a.status !== 'pending').length;

    const parentChildStats = [
      { title: 'Overall Grade', value: 'B+', trend: 'Consistent', icon: 'GraduationCap', trendUp: true },
      { title: 'Study Hours', value: '12.5h', trend: '15 topics done', icon: 'Clock', trendUp: true },
      { title: 'Assignments', value: completedCount.toString(), trend: `${pendingCount} pending`, icon: 'CheckCircle', trendUp: true },
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
      { id: child.id, name: child.name || 'Student', className: child.class?.name || 'Class' }
    ];

    const selectedChild = {
      name: child.name || 'Student',
      email: child.email || 'student@school.com',
      className: child.class?.name || 'Class',
      classTeacher: child.class?.classTeacher?.name || 'Unassigned',
      parentChildStats,
      weeklyStudyData,
      weakSubjectAlerts,
      studentSubjects,
      studentAssignments,
      childDailyActivity,
    };

    return NextResponse.json({
      parent: { name: parentData.name || 'Parent', email: parentData.email, phone: '' },
      school: { name: parentData.school?.name },
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
