import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbFlags = await prisma.moderationFlag.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const flags = await Promise.all(dbFlags.map(async (f) => {
      // Find user details manually since we don't have a direct relation in schema
      const user = await prisma.user.findUnique({ where: { id: f.userId } });
      
      return {
        id: f.id,
        user: user?.name || 'Unknown User',
        email: user?.email || 'unknown@example.com',
        content: f.content,
        reason: f.reason,
        severity: 'medium', // Default mock severity
        status: f.status,
        date: f.createdAt.toISOString().split('T')[0]
      };
    }));

    // If DB is empty, provide some seed data for visualization
    if (flags.length === 0) {
      flags.push(
        { id: 'mock1', user: 'Charlie Brown', email: 'charlie@example.com', content: 'I hate this stupid assignment, it is garbage', reason: 'Profanity / Toxicity', severity: 'medium', status: 'pending', date: new Date().toISOString().split('T')[0] },
        { id: 'mock2', user: 'Diana Prince', email: 'diana@example.com', content: 'How to bypass the school firewall', reason: 'Policy Violation', severity: 'high', status: 'pending', date: new Date().toISOString().split('T')[0] }
      );
    }

    return NextResponse.json({ flags });
  } catch (error: any) {
    console.error('Error fetching moderation flags:', error);
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
    const { id, action, status } = body;
    const finalStatus = status || (action === 'resolve' ? 'resolved' : 'reviewed');

    if (id && !id.startsWith('mock')) {
      await prisma.moderationFlag.update({
        where: { id },
        data: { status: finalStatus }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating moderation flag:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
