import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const DEFAULT_SETTINGS: Record<string, any> = {
  platformName: "AI Tutor Platform",
  maintenanceMode: false,
  maxSchools: 1000,
  globalModel: "gemini-1.5-pro",
  autoApproveSchools: false,
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load from DB
    const dbSettings = await prisma.setting.findMany();
    const settings: Record<string, any> = { ...DEFAULT_SETTINGS };

    dbSettings.forEach((item) => {
      let val: any = item.value;
      // Attempt to parse JSON (for booleans/numbers)
      try {
        val = JSON.parse(item.value);
      } catch {
        // keep as string
      }
      settings[item.key] = val;
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
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

    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Convert value to string for storage
    const valString = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await prisma.setting.upsert({
      where: { key },
      update: { value: valString, updatedById: (session.user as any)?.id },
      create: { key, value: valString, updatedById: (session.user as any)?.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
