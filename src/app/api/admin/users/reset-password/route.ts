import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const adminSchoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !adminSchoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json({ error: 'Missing userId or password' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Verify the target user belongs to the same school
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, schoolId: true, role: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.schoolId !== adminSchoolId) {
      return NextResponse.json({ error: 'Unauthorized: User is in another school' }, { status: 403 });
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
