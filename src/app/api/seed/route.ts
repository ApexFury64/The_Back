import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const defaultPassword = await bcrypt.hash('demo123', 10);

    // 1. Create Schools
    const school1 = await prisma.school.upsert({
      where: { code: 'DPS-HYD' },
      update: {},
      create: {
        name: 'Delhi Public School, Hyderabad',
        code: 'DPS-HYD',
        address: 'Hyderabad, India',
      }
    });

    // 2. Create Classes
    const class8A = await prisma.classRoom.create({
      data: {
        schoolId: school1.id,
        name: 'Class 8 - A',
        standard: '8',
        section: 'A',
      }
    });

    // 3. Create Users
    // Super Admin
    await prisma.user.upsert({
      where: { email: 'super@techwing.com' },
      update: {},
      create: {
        email: 'super@techwing.com',
        name: 'Super Admin',
        role: 'SUPERADMIN',
        password: defaultPassword,
      }
    });

    // School Admin
    await prisma.user.upsert({
      where: { email: 'admin@dps-hyd.edu' },
      update: {},
      create: {
        email: 'admin@dps-hyd.edu',
        name: 'DPS Admin',
        role: 'SCHOOLADMIN',
        password: defaultPassword,
        schoolId: school1.id,
      }
    });

    // Teacher
    const teacher1 = await prisma.user.upsert({
      where: { email: 'teacher@dps.edu' },
      update: {},
      create: {
        email: 'teacher@dps.edu',
        name: 'Mr. Anderson',
        role: 'TEACHER',
        password: defaultPassword,
        schoolId: school1.id,
      }
    });

    // Connect teacher to class
    await prisma.classRoom.update({
      where: { id: class8A.id },
      data: { classTeacherId: teacher1.id }
    });

    // Student
    const student1 = await prisma.user.upsert({
      where: { email: 'student@dps.edu' },
      update: {},
      create: {
        email: 'student@dps.edu',
        name: 'Arjun Student',
        role: 'STUDENT',
        password: defaultPassword,
        schoolId: school1.id,
        classId: class8A.id,
      }
    });

    // Parent
    await prisma.user.upsert({
      where: { email: 'parent@dps.edu' },
      update: {},
      create: {
        email: 'parent@dps.edu',
        name: 'Arjun Parent',
        role: 'PARENT',
        password: defaultPassword,
        schoolId: school1.id,
      }
    });

    // 4. Create Subjects
    const math = await prisma.subject.create({
      data: {
        schoolId: school1.id,
        name: 'Mathematics',
        code: 'MAT8',
        color: '#0ea5e9',
        standard: '8',
      }
    });

    const sci = await prisma.subject.create({
      data: {
        schoolId: school1.id,
        name: 'Science',
        code: 'SCI8',
        color: '#00d4aa',
        standard: '8',
      }
    });

    // 5. Create Assignments & Submissions
    const assignment1 = await prisma.assignment.create({
      data: {
        schoolId: school1.id,
        classId: class8A.id,
        subjectId: math.id,
        teacherId: teacher1.id,
        title: 'Algebra Worksheet',
        description: 'Solve the first 10 equations on page 42.',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      }
    });

    await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: student1.id,
        status: 'pending',
      }
    });

    const assignment2 = await prisma.assignment.create({
      data: {
        schoolId: school1.id,
        classId: class8A.id,
        subjectId: sci.id,
        teacherId: teacher1.id,
        title: 'Physics Lab Report',
        description: 'Submit your pendulum experiment results.',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      }
    });

    await prisma.submission.create({
      data: {
        assignmentId: assignment2.id,
        studentId: student1.id,
        status: 'submitted',
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }
    });

    return NextResponse.json({ message: 'Database seeded successfully with Prisma!' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Seed failed', details: error.message }, { status: 500 });
  }
}
