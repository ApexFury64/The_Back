import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const classes = [
    {
      id: '1',
      name: 'Class 10',
      sections: [
        {
          id: 'sec10A',
          name: 'A',
          students: Array.from({ length: 15 }, (_, i) => ({
            id: `10A${i}`,
            name: ['Emma Smith', 'Liam Johnson', 'Olivia Williams', 'Noah Brown', 'Ava Jones', 'Oliver Garcia', 'Isabella Miller', 'Elijah Davis', 'Sophia Rodriguez', 'William Martinez', 'Mia Martinez', 'James Taylor', 'Charlotte Moore', 'Benjamin Clark', 'Amelia Hall'][i],
            enrollmentYear: '2023',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        },
        {
          id: 'sec10B',
          name: 'B',
          students: Array.from({ length: 12 }, (_, i) => ({
            id: `10B${i}`,
            name: ['Student B1', 'Student B2', 'Student B3', 'Student B4', 'Student B5', 'Student B6', 'Student B7', 'Student B8', 'Student B9', 'Student B10', 'Student B11', 'Student B12'][i],
            enrollmentYear: '2023',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        },
        {
          id: 'sec10C',
          name: 'C',
          students: Array.from({ length: 10 }, (_, i) => ({
            id: `10C${i}`,
            name: `Class 10C Student ${i + 1}`,
            enrollmentYear: '2023',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        }
      ]
    },
    {
      id: '2',
      name: 'Class 9',
      sections: [
        {
          id: 'sec9A',
          name: 'A',
          students: Array.from({ length: 14 }, (_, i) => ({
            id: `9A${i}`,
            name: `Class 9A Student ${i + 1}`,
            enrollmentYear: '2024',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        },
        {
          id: 'sec9B',
          name: 'B',
          students: Array.from({ length: 12 }, (_, i) => ({
            id: `9B${i}`,
            name: `Class 9B Student ${i + 1}`,
            enrollmentYear: '2024',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        },
        {
          id: 'sec9C',
          name: 'C',
          students: Array.from({ length: 11 }, (_, i) => ({
            id: `9C${i}`,
            name: `Class 9C Student ${i + 1}`,
            enrollmentYear: '2024',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        }
      ]
    },
    {
      id: '3',
      name: 'Class 8',
      sections: [
        {
          id: 'sec8A',
          name: 'A',
          students: Array.from({ length: 15 }, (_, i) => ({
            id: `8A${i}`,
            name: `Class 8A Student ${i + 1}`,
            enrollmentYear: '2025',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        },
        {
          id: 'sec8B',
          name: 'B',
          students: Array.from({ length: 15 }, (_, i) => ({
            id: `8B${i}`,
            name: `Class 8B Student ${i + 1}`,
            enrollmentYear: '2025',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        }
      ]
    },
    {
      id: '4',
      name: 'Class 7',
      sections: [
        {
          id: 'sec7A',
          name: 'A',
          students: Array.from({ length: 12 }, (_, i) => ({
            id: `7A${i}`,
            name: `Class 7A Student ${i + 1}`,
            enrollmentYear: '2025',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        },
        {
          id: 'sec7B',
          name: 'B',
          students: Array.from({ length: 12 }, (_, i) => ({
            id: `7B${i}`,
            name: `Class 7B Student ${i + 1}`,
            enrollmentYear: '2025',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        },
        {
          id: 'sec7C',
          name: 'C',
          students: Array.from({ length: 13 }, (_, i) => ({
            id: `7C${i}`,
            name: `Class 7C Student ${i + 1}`,
            enrollmentYear: '2025',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        }
      ]
    },
    {
      id: '5',
      name: 'Class 6',
      sections: [
        {
          id: 'sec6A',
          name: 'A',
          students: Array.from({ length: 14 }, (_, i) => ({
            id: `6A${i}`,
            name: `Class 6A Student ${i + 1}`,
            enrollmentYear: '2026',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        },
        {
          id: 'sec6B',
          name: 'B',
          students: Array.from({ length: 15 }, (_, i) => ({
            id: `6B${i}`,
            name: `Class 6B Student ${i + 1}`,
            enrollmentYear: '2026',
            avgScore: Math.floor(Math.random() * 40) + 60,
            attendancePercent: Math.floor(Math.random() * 20) + 80,
            aiUsage: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
          }))
        }
      ]
    }
  ];

  return NextResponse.json({ classes });
}
