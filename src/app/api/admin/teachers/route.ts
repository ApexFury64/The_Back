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

    const dbTeachers = await prisma.user.findMany({
      where: { schoolId, role: 'TEACHER' },
      include: {
        taughtClasses: true
      }
    });

    const teachers = dbTeachers.map((t: any) => {
      const assignedClasses = t.taughtClasses
        .map((c: any) => `Class ${c.standard}-${c.section}`)
        .join(', ');

      return {
        id: t.id,
        name: t.name || 'Unknown Teacher',
        email: t.email,
        phone: t.phone || 'N/A',
        employeeId: t.employeeId || `T-${t.id.substring(0, 5).toUpperCase()}`,
        subjects: t.primarySubject || 'General',
        classes: assignedClasses || 'None'
      };
    });

    return NextResponse.json({ teachers });
  } catch (error: any) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
