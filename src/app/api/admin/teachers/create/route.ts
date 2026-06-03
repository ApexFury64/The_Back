import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  primarySubject: z.string().optional(),
  adminEmail: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTeacherSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }
    
    const { name, email, phone, employeeId, primarySubject, adminEmail } = parsed.data;

    // Find the admin to get their schoolId
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!admin || !admin.schoolId) {
      return NextResponse.json({ error: 'Unauthorized or school not found' }, { status: 403 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const defaultPassword = await bcrypt.hash('demo123', 8);

    // Create the teacher
    const newTeacher = await prisma.user.create({
      data: {
        name,
        email,
        password: defaultPassword,
        phone,
        employeeId,
        primarySubject,
        role: 'teacher',
        schoolId: admin.schoolId
      }
    });

    return NextResponse.json({ success: true, teacher: newTeacher });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
