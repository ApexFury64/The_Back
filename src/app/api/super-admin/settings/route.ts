import { NextResponse } from 'next/server';

export async function GET() {
  const settings = {
    allowNewRegistrations: true,
    maintenanceMode: false,
    maxSchools: 50,
    defaultStorageGB: 100,
    enforce2FA: true,
    dataRetentionDays: 365,
    aiModelDefault: 'gpt-4o',
    aiMaxTokensPerUser: 100000
  };

  return NextResponse.json({ settings });
}

export async function POST() {
  return NextResponse.json({ success: true });
}
