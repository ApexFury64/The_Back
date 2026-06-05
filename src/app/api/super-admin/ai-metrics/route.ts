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

    const models = [
      { name: 'gpt-4o', status: 'active', requests: 145000, latency: '240ms', errorRate: '0.01%' },
      { name: 'claude-3-opus', status: 'active', requests: 85000, latency: '450ms', errorRate: '0.05%' },
      { name: 'gemini-1.5-pro', status: 'active', requests: 120000, latency: '310ms', errorRate: '0.02%' },
      { name: 'llama-3-70b-instruct', status: 'maintenance', requests: 45000, latency: '120ms', errorRate: '0.15%' }
    ];

    const dbLogs = await prisma.aiUsageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const recentLogs = dbLogs.map(log => ({
      id: log.id,
      timestamp: log.createdAt.toISOString(),
      model: log.model,
      user: 'unknown@school.edu', // TODO: Add userId to AiUsageLog schema
      prompt: 'Hidden for privacy', // TODO: Add prompt to AiUsageLog schema
      tokens: log.tokens,
      cost: log.cost.toString()
    }));

    // If DB is empty, provide some seed data for visualization
    if (recentLogs.length === 0) {
      recentLogs.push(
        { id: 'mock1', timestamp: new Date().toISOString(), model: 'gpt-4o', user: 'teacher@school.edu', prompt: 'Generate lesson plan', tokens: 1200, cost: '0.012' }
      );
    }

    return NextResponse.json({ models, recentLogs });
  } catch (error: any) {
    console.error('Error fetching ai metrics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
