import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const mockMaterials = [
    { id: 'm1', name: 'Algebra Fundamentals', class: 'Class 10-A', type: 'PDF', size: '2.4 MB', date: '2026-05-20', sectionSubjectId: 'MATH10' },
    { id: 'm2', name: 'Geometry Formulas', class: 'Class 10-A', type: 'DOCX', size: '1.1 MB', date: '2026-05-21', sectionSubjectId: 'MATH10' },
    { id: 'm3', name: 'Newton Laws', class: 'Class 9-B', type: 'PDF', size: '3.5 MB', date: '2026-05-22', sectionSubjectId: 'SCI9' },
    { id: 'm4', name: 'History of Rome', class: 'Class 8-A', type: 'PPTX', size: '5.2 MB', date: '2026-05-25', sectionSubjectId: 'HIST8' },
    { id: 'm5', name: 'Chemical Reactions', class: 'Class 7-C', type: 'PDF', size: '1.8 MB', date: '2026-05-26', sectionSubjectId: 'SCI7' },
    { id: 'm6', name: 'Computer Basics', class: 'Class 6-A', type: 'PDF', size: '4.0 MB', date: '2026-05-27', sectionSubjectId: 'CS6' },
  ];

  // Return exactly what the UI expects for GET
  return NextResponse.json({ materials: mockMaterials, sectionSubjects: [] });
}

export async function POST(request: Request) {
  return NextResponse.json({ success: true });
}
