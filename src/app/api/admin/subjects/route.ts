import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const subjects = [
    { id: '1', name: 'Mathematics', code: 'MATH', category: 'Core', description: 'Algebra, Geometry, Trigonometry', grade: 10 },
    { id: '2', name: 'Science', code: 'SCI', category: 'Core', description: 'Physics, Chemistry, Biology', grade: 10 },
    { id: '3', name: 'English', code: 'ENG', category: 'Language', description: 'English literature and grammar', grade: 10 },
    { id: '4', name: 'History', code: 'HIST', category: 'Social Science', description: 'World History and Civics', grade: 10 },
    { id: '5', name: 'Geography', code: 'GEO', category: 'Social Science', description: 'Physical and Human Geography', grade: 10 },
    { id: '6', name: 'Computer Science', code: 'CS', category: 'Elective', description: 'Programming and IT', grade: 10 },
    { id: '7', name: 'Mathematics', code: 'MATH9', category: 'Core', description: 'Algebra and Statistics', grade: 9 },
    { id: '8', name: 'Science', code: 'SCI9', category: 'Core', description: 'General Science', grade: 9 },
    { id: '9', name: 'English', code: 'ENG9', category: 'Language', description: 'Language Arts', grade: 9 },
    { id: '10', name: 'Mathematics', code: 'MATH8', category: 'Core', description: 'Basic Algebra', grade: 8 },
    { id: '11', name: 'Science', code: 'SCI8', category: 'Core', description: 'Earth Science', grade: 8 },
    { id: '12', name: 'Physical Education', code: 'PE', category: 'Extracurricular', description: 'Sports and Health', grade: 8 },
    { id: '13', name: 'Art', code: 'ART', category: 'Extracurricular', description: 'Visual Arts and Design', grade: 7 },
    { id: '14', name: 'Mathematics', code: 'MATH7', category: 'Core', description: 'Fractions and Decimals', grade: 7 },
    { id: '15', name: 'English', code: 'ENG7', category: 'Language', description: 'Reading Comprehension', grade: 7 }
  ];
  return NextResponse.json({ subjects });
}
