import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const classes = [
    { id: '1', name: 'Class 10', grade: 10, sections: [
      { id: 'sec10A', name: 'A', students: Array(30).fill({}), classTeacher: { name: 'Mr. Anderson' }, sectionSubjects: [
        { id: 'ss1', subject: { name: 'Mathematics' }, teacher: { name: 'Mr. Anderson' } },
        { id: 'ss2', subject: { name: 'Science' }, teacher: { name: 'Ms. Roberts' } }
      ] },
      { id: 'sec10B', name: 'B', students: Array(28).fill({}), classTeacher: { name: 'Mrs. Davis' }, sectionSubjects: [] },
      { id: 'sec10C', name: 'C', students: Array(25).fill({}), classTeacher: { name: 'Mr. White' }, sectionSubjects: [] }
    ]},
    { id: '2', name: 'Class 9', grade: 9, sections: [
      { id: 'sec9A', name: 'A', students: Array(32).fill({}), classTeacher: { name: 'Mr. Black' }, sectionSubjects: [] },
      { id: 'sec9B', name: 'B', students: Array(30).fill({}), classTeacher: { name: 'Ms. Green' }, sectionSubjects: [] },
      { id: 'sec9C', name: 'C', students: Array(29).fill({}), classTeacher: { name: 'Mr. Brown' }, sectionSubjects: [] }
    ]},
    { id: '3', name: 'Class 8', grade: 8, sections: [
      { id: 'sec8A', name: 'A', students: Array(35).fill({}), classTeacher: { name: 'Ms. Taylor' }, sectionSubjects: [] },
      { id: 'sec8B', name: 'B', students: Array(33).fill({}), classTeacher: { name: 'Mr. Wilson' }, sectionSubjects: [] }
    ]},
    { id: '4', name: 'Class 7', grade: 7, sections: [
      { id: 'sec7A', name: 'A', students: Array(25).fill({}), classTeacher: { name: 'Mrs. Moore' }, sectionSubjects: [] },
      { id: 'sec7B', name: 'B', students: Array(26).fill({}), classTeacher: { name: 'Mr. Clark' }, sectionSubjects: [] },
      { id: 'sec7C', name: 'C', students: Array(28).fill({}), classTeacher: { name: 'Ms. Hall' }, sectionSubjects: [] }
    ]},
    { id: '5', name: 'Class 6', grade: 6, sections: [
      { id: 'sec6A', name: 'A', students: Array(30).fill({}), classTeacher: { name: 'Mr. Young' }, sectionSubjects: [] },
      { id: 'sec6B', name: 'B', students: Array(31).fill({}), classTeacher: { name: 'Ms. King' }, sectionSubjects: [] }
    ]}
  ];
  return NextResponse.json({ classes });
}
