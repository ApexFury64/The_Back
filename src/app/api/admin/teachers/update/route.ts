import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, password, phone, employeeId, primarySubject } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields: id, name, email' }, { status: 400 });
    }

    // Find the target teacher
    const teacher = await prisma.user.findFirst({
      where: { id, schoolId, role: 'TEACHER' }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found in this school' }, { status: 404 });
    }

    // Check if another user has the email (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        NOT: { id }
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Update object building
    const updateData: Record<string, any> = {
      name,
      email,
      phone: phone || null,
      employeeId: employeeId || null,
      primarySubject: primarySubject || null
    };

    if (password && password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update teacher
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, teacher: updatedUser });
  } catch (error: any) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
