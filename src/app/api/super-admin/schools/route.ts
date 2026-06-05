import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const onboardSchoolSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  address: z.string().optional(),
  plan: z.string().optional(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const platformSchools = await prisma.school.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    const formattedSchools = platformSchools.map(school => {
      let city = school.address || 'Unknown';
      let plan = 'Enterprise';
      if (city.includes(' | ')) {
        const parts = city.split(' | ');
        city = parts[0];
        plan = parts[1];
      }
      return {
        id: school.id,
        name: school.name,
        city: city,
        students: school._count.users,
        teachers: 0,
        plan: plan.toLowerCase(),
        status: 'active',
        contact: 'admin@school.com',
        joinedAt: school.createdAt.toISOString().split('T')[0],
        aiUsage: Math.floor(Math.random() * 40) + 50
      };
    });

    return NextResponse.json({ platformSchools: formattedSchools });
  } catch (error: any) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardSchoolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, code, address, plan, adminName, adminEmail, adminPassword } = parsed.data;

    // Check if school code already exists (case-insensitive)
    const existingSchool = await prisma.school.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } }
    });
    if (existingSchool) {
      return NextResponse.json({ error: 'School with this code already exists' }, { status: 409 });
    }

    // Check if admin email already exists (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: adminEmail, mode: 'insensitive' } }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const formattedAddress = plan ? `${address || 'Unknown'} | ${plan}` : (address || 'Unknown');

    // Create school and admin in transaction
    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name,
          code: code.toUpperCase(),
          address: formattedAddress,
        }
      });

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'SCHOOLADMIN',
          schoolId: school.id,
        }
      });

      return school;
    });

    return NextResponse.json({ success: true, school: result });
  } catch (error: any) {
    console.error('Error onboarding school:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
