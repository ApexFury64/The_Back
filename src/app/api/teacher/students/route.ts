import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const formattedData = [
    {
      id: '1',
      name: 'Class 10',
      grade: 10,
      sections: [
        {
          id: 'sec1', name: 'A', isClassTeacher: true,
          students: Array.from({ length: 15 }, (_, i) => ({ id: `10A${i}`, name: `Alice Smith ${i}`, email: `alice${i}@example.com`, avgScore: 92 - (i % 5), attendancePercent: 98 - i, issue: 'On track', trend: '+2% this week' }))
        },
        {
          id: 'sec2', name: 'B', isClassTeacher: false,
          students: Array.from({ length: 12 }, (_, i) => ({ id: `10B${i}`, name: `Bob Jones ${i}`, email: `bob${i}@example.com`, avgScore: 78 + (i % 5), attendancePercent: 85 + i, issue: 'On track', trend: '-1% this week' }))
        }
      ]
    },
    {
      id: '2',
      name: 'Class 9',
      grade: 9,
      sections: [
        {
          id: 'sec3', name: 'A', isClassTeacher: false,
          students: Array.from({ length: 14 }, (_, i) => ({ id: `9A${i}`, name: `Charlie Brown ${i}`, email: `charlie${i}@example.com`, avgScore: 85 - (i % 3), attendancePercent: 90 - i, issue: 'On track', trend: '+1% this week' }))
        },
        {
          id: 'sec4', name: 'B', isClassTeacher: false,
          students: Array.from({ length: 12 }, (_, i) => ({ id: `9B${i}`, name: `Diana Prince ${i}`, email: `diana${i}@example.com`, avgScore: 95 - (i % 2), attendancePercent: 99 - i, issue: 'Excellent', trend: '+5% this week' }))
        }
      ]
    },
    {
      id: '3',
      name: 'Class 8',
      grade: 8,
      sections: [
        {
          id: 'sec5', name: 'A', isClassTeacher: false,
          students: Array.from({ length: 15 }, (_, i) => ({ id: `8A${i}`, name: `Ethan Hunt ${i}`, email: `ethan${i}@example.com`, avgScore: 72 + (i % 6), attendancePercent: 88 - i, issue: 'Needs Improvement', trend: '-3% this week' }))
        }
      ]
    },
    {
      id: '4',
      name: 'Class 7',
      grade: 7,
      sections: [
        {
          id: 'sec6', name: 'A', isClassTeacher: false,
          students: Array.from({ length: 12 }, (_, i) => ({ id: `7A${i}`, name: `Fiona Gallagher ${i}`, email: `fiona${i}@example.com`, avgScore: 81 + (i % 4), attendancePercent: 91 - i, issue: 'On track', trend: '+1% this week' }))
        }
      ]
    },
    {
      id: '5',
      name: 'Class 6',
      grade: 6,
      sections: [
        {
          id: 'sec7', name: 'A', isClassTeacher: false,
          students: Array.from({ length: 14 }, (_, i) => ({ id: `6A${i}`, name: `George Lucas ${i}`, email: `george${i}@example.com`, avgScore: 88 + (i % 2), attendancePercent: 95 - i, issue: 'On track', trend: '+2% this week' }))
        }
      ]
    }
  ];

  return NextResponse.json({ classes: formattedData });
}
