import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const mockAssignments = [
    { id: 'a1', title: 'Algebra Homework 1', class: 'Class 10-A', subject: 'Mathematics', dueDate: 'Tomorrow', submissions: 25, totalStudents: 30, createdAt: Date.now() - 86400000, description: 'Solve equations 1-20' },
    { id: 'a2', title: 'Science Project', class: 'Class 9-B', subject: 'Science', dueDate: 'Next Week', submissions: 10, totalStudents: 32, createdAt: Date.now() - 172800000, description: 'Build a volcano' },
    { id: 'a3', title: 'History Essay', class: 'Class 8-A', subject: 'History', dueDate: 'In 3 days', submissions: 28, totalStudents: 30, createdAt: Date.now() - 259200000, description: 'Write 500 words on the Renaissance' },
    { id: 'a4', title: 'English Reading', class: 'Class 7-C', subject: 'English', dueDate: 'Tomorrow', submissions: 15, totalStudents: 25, createdAt: Date.now() - 400000, description: 'Read chapters 1 and 2' },
    { id: 'a5', title: 'Math Quiz Prep', class: 'Class 6-A', subject: 'Mathematics', dueDate: 'Today', submissions: 29, totalStudents: 30, createdAt: Date.now() - 500000, description: 'Prepare for quiz' },
  ];

  return NextResponse.json({ assignments: mockAssignments });
}

export async function POST(request: Request) {
  return NextResponse.json({ success: true });
}
