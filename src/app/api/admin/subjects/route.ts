import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbSubjects = await prisma.subject.findMany({
      where: { schoolId },
    });

    const subjects = dbSubjects.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      category: 'Core', // TODO: Add category to Prisma schema
      description: `Course for ${sub.name}`, // TODO: Add description to Prisma schema
      grade: parseInt(sub.standard, 10) || 0,
      color: sub.color
    }));

    return NextResponse.json({ subjects });
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
