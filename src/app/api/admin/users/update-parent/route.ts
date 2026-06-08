import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateParentSchema = z.object({
  parentId: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const schoolId = (session?.user as any)?.schoolId;

    if (!session || userRole !== 'SCHOOLADMIN' || !schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateParentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { parentId, name, email, phone } = parsed.data;

    // Verify the parent belongs to a student in this school
    const parent = await prisma.user.findFirst({
      where: {
        id: parentId,
        role: 'PARENT',
        children: {
          some: { schoolId },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found in your school' }, { status: 404 });
    }

    // Check if the new email is already taken by another user
    if (email !== parent.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== parentId) {
        return NextResponse.json({ error: 'Email is already in use by another account' }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: parentId },
      data: {
        name,
        email,
        phone: phone || null,
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    return NextResponse.json({ success: true, parent: updated });
  } catch (error: any) {
    console.error('Error updating parent:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
