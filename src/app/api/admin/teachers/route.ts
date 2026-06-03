import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const teacherNames = [
    'Mr. Anderson', 'Ms. Roberts', 'Mrs. Davis', 'Mr. White', 'Mr. Black', 
    'Ms. Green', 'Mr. Brown', 'Ms. Taylor', 'Mr. Wilson', 'Mrs. Moore', 
    'Mr. Clark', 'Ms. Hall', 'Mr. Lewis', 'Mrs. Walker', 'Ms. Young', 
    'Mr. Allen', 'Ms. King', 'Mr. Wright', 'Mrs. Scott', 'Mr. Torres', 
    'Ms. Nguyen', 'Mr. Hill', 'Mrs. Adams', 'Ms. Nelson', 'Mr. Baker', 
    'Ms. Mitchell', 'Mr. Perez', 'Mrs. Roberts', 'Mr. Turner', 'Ms. Phillips'
  ];

  const subjectsPool = [
    'Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 
    'Physical Education', 'Art', 'Music', 'Biology', 'Chemistry', 'Physics'
  ];

  const standardsPool = ['Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6'];
  const sectionsPool = ['A', 'B', 'C'];

  const teachers = Array.from({ length: 30 }, (_, i) => {
    const primarySubject = subjectsPool[i % subjectsPool.length];
    
    // Assign 1-2 classes
    const class1 = standardsPool[i % standardsPool.length];
    const sec1 = sectionsPool[i % sectionsPool.length];
    
    const class2 = standardsPool[(i + 1) % standardsPool.length];
    const sec2 = sectionsPool[(i + 1) % sectionsPool.length];
    
    const assignedClasses = i % 2 === 0 
      ? `${class1}-${sec1}, ${class1}-${sec2}`
      : `${class1}-${sec1}, ${class2}-${sec2}`;

    return {
      id: `${i + 1}`,
      name: teacherNames[i],
      email: `${teacherNames[i].split(' ')[1].toLowerCase()}@school.com`,
      phone: `9876543${String(210 + i).padStart(3, '0')}`,
      employeeId: `T${String(i + 1).padStart(3, '0')}`,
      subjects: primarySubject,
      classes: assignedClasses
    };
  });

  return NextResponse.json({ teachers });
}
