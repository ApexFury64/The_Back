import { NextResponse } from 'next/server';
import mockData from '@/lib/schoolMockData.json';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Next.js 15 requires awaiting params
    
    // Mock base school info based on ID
    let schoolName = "Oakridge International";
    let plan = "Enterprise";
    if (id === '2') { schoolName = "Kendriya Vidyalaya"; plan = "Pro"; }
    else if (id === '3') { schoolName = "Delhi Public School"; plan = "Enterprise"; }
    else if (id === '4') { schoolName = "Future Innovators"; plan = "Enterprise"; }
    else if (id === '5') { schoolName = "Legacy Prep School"; plan = "Pro"; }
    
    const schoolData = {
      id,
      name: schoolName,
      plan,
      aiUsage: Math.floor(Math.random() * 40) + 50,
      studentsCount: 1200 + Math.floor(Math.random() * 2000),
      teachersCount: 90 + Math.floor(Math.random() * 100),
    };

    const classes = [
      { id: 'c1', name: 'Class 6', sections: ['6-A', '6-B', '6-C'], students: 120 },
      { id: 'c2', name: 'Class 7', sections: ['7-A', '7-B', '7-C'], students: 145 },
      { id: 'c3', name: 'Class 8', sections: ['8-A', '8-B', '8-C'], students: 160 },
      { id: 'c4', name: 'Class 9', sections: ['9-A', '9-B', '9-C'], students: 155 },
      { id: 'c5', name: 'Class 10', sections: ['10-A', '10-B', '10-C'], students: 150 },
    ];

    const subjects = [
      { id: 's1', name: 'Mathematics', teachers: 12, classes: ['6','7','8','9','10'], avgScore: 82 },
      { id: 's2', name: 'Physics', teachers: 8, classes: ['9','10'], avgScore: 78 },
      { id: 's3', name: 'Chemistry', teachers: 7, classes: ['9','10'], avgScore: 75 },
      { id: 's4', name: 'Biology', teachers: 6, classes: ['9','10'], avgScore: 88 },
      { id: 's5', name: 'English', teachers: 15, classes: ['6','7','8','9','10'], avgScore: 85 },
      { id: 's6', name: 'Computer Science', teachers: 5, classes: ['6','7','8','9','10'], avgScore: 92 },
      { id: 's7', name: 'History', teachers: 8, classes: ['6','7','8','9','10'], avgScore: 80 },
    ];

    const schoolSpecificData = (mockData as any)[schoolName] || { teachers: [], students: [] };

    // Format teachers to match frontend expectation
    const teachers = schoolSpecificData.teachers.map((t: any, i: number) => ({
      id: t.email,
      name: t.name,
      email: t.email,
      subject: subjects[i % subjects.length].name,
      classes: [`Class ${6 + (i % 5)}`],
      status: 'active'
    }));

    // Format students to match frontend expectation
    const students = schoolSpecificData.students.map((s: any) => ({
      id: s.email,
      name: s.name,
      grade: `Class ${s.class || '10'}`,
      section: s.section || 'A',
      attendance: 80 + Math.floor(Math.random() * 20),
      performance: 60 + Math.floor(Math.random() * 40)
    }));

    return NextResponse.json({
      schoolData,
      classes,
      subjects,
      teachers,
      students
    });
  } catch (error) {
    console.error('Error fetching detailed school data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
