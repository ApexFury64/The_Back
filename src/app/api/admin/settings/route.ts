import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.any()
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await prisma.setting.findMany({
      where: { key: { startsWith: 'admin_' + session.schoolId + '_' } }
    });

    const parsedSettings = (settings as any[]).reduce((acc: any, s: any) => {
      acc[s.key.replace('admin_' + session.schoolId + '_', '')] = JSON.parse(s.value);
      return acc;
    }, {} as any);

    return NextResponse.json({ settings: parsedSettings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }

    const { key, value } = parsed.data;
    const dbKey = 'admin_' + session.schoolId + '_' + key;

    const setting = await prisma.setting.upsert({
      where: { key: dbKey },
      update: { value: JSON.stringify(value), updatedById: session.userId },
      create: { key: dbKey, value: JSON.stringify(value), updatedById: session.userId }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('Error saving admin setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
