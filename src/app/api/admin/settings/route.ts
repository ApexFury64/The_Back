import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.any()
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = (session.user as any).schoolId;
    const settings = await prisma.setting.findMany({
      where: { key: { startsWith: 'admin_' + schoolId + '_' } }
    });

    const parsedSettings = settings.reduce((acc: Record<string, any>, s) => {
      acc[s.key.replace('admin_' + schoolId + '_', '')] = JSON.parse(s.value);
      return acc;
    }, {});

    return NextResponse.json({ settings: parsedSettings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SCHOOLADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { key, value } = parsed.data;
    const userId = (session.user as any).id;
    const schoolId = (session.user as any).schoolId;
    const dbKey = 'admin_' + schoolId + '_' + key;

    const setting = await prisma.setting.upsert({
      where: { key: dbKey },
      update: { value: JSON.stringify(value), updatedById: userId },
      create: { key: dbKey, value: JSON.stringify(value), updatedById: userId }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('Error saving admin setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
