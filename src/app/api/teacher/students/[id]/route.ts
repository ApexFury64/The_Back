import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: studentId } = await context.params;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        section: {
          include: {
            class: true
          }
        },
        quizAttempts: {
          include: {
            quiz: {
              include: {
                subject: true
              }
            }
          },
          orderBy: { completedAt: 'desc' }
        },
        submissions: {
          include: {
            assignment: {
              include: {
                sectionSubject: {
                  include: {
                    subject: true
                  }
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30 // Last 30 attendance records
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Calculate Average Quiz Score
    const totalQuizScore = student.quizAttempts.reduce((sum, qa) => sum + qa.score, 0);
    const avgScore = student.quizAttempts.length > 0 
      ? Math.round(totalQuizScore / student.quizAttempts.length)
      : 0;

    // Calculate Attendance Percentage
    const totalDays = student.attendance.length;
    const presentDays = student.attendance.filter(a => a.status === 'present').length;
    const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Determine issue/AI flag
    let issue = "On track";
    let aiInsight = "Student is performing well and keeping up with the curriculum.";
    
    if (attendancePercent < 80) {
      issue = "Low attendance";
      aiInsight = "Student's attendance has dropped below 80%. This may be impacting their recent assignment submissions. Consider reaching out to parents.";
    } else if (avgScore < 60 && student.quizAttempts.length > 0) {
      issue = "Falling behind";
      aiInsight = "Student is struggling with recent quizzes, particularly in subjects requiring analytical thinking. Recommend assigning targeted remedial modules.";
    } else if (avgScore > 90) {
      issue = "Excelling";
      aiInsight = "Student is demonstrating exceptional mastery of the concepts. Recommend unlocking advanced topic modules to keep them challenged.";
    }

    const data = {
      id: student.id,
      name: student.name,
      email: student.email,
      className: student.section?.class?.name || "Unassigned",
      sectionName: student.section?.name || "Unassigned",
      rollNo: `RL${student.id.substring(0, 4).toUpperCase()}`,
      metrics: {
        avgScore,
        attendancePercent,
        assignmentsCompleted: student.submissions.filter(a => a.status === 'submitted' || a.status === 'graded').length,
        totalAssignments: student.submissions.length,
        issue,
        aiInsight
      },
      quizzes: student.quizAttempts.map(qa => ({
        id: qa.id,
        quizTitle: qa.quiz.title,
        subject: qa.quiz.subject.name,
        score: qa.score,
        date: qa.completedAt
      })),
      assignments: student.submissions.map(as => ({
        id: as.id,
        title: as.assignment.title,
        subject: as.assignment.sectionSubject?.subject?.name || 'Subject',
        status: as.status,
        dueDate: as.assignment.dueDate,
        submittedAt: as.submittedAt
      }))
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
  }
}
