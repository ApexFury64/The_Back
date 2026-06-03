import { NextResponse } from 'next/server';

export async function GET() {
  const models = [
    { name: 'gpt-4o', status: 'active', requests: 145000, latency: '240ms', errorRate: '0.01%' },
    { name: 'claude-3-opus', status: 'active', requests: 85000, latency: '450ms', errorRate: '0.05%' },
    { name: 'gemini-1.5-pro', status: 'active', requests: 120000, latency: '310ms', errorRate: '0.02%' },
    { name: 'llama-3-70b-instruct', status: 'maintenance', requests: 45000, latency: '120ms', errorRate: '0.15%' }
  ];

  const recentLogs = [
    { id: '1', timestamp: '2026-06-02T10:15:00Z', model: 'gpt-4o', user: 'teacher1@school.edu', prompt: 'Generate a quiz on thermodynamics', tokens: 1250, cost: '.012' },
    { id: '2', timestamp: '2026-06-02T10:14:30Z', model: 'claude-3-opus', user: 'student45@school.edu', prompt: 'Explain the water cycle', tokens: 800, cost: '.008' },
    { id: '3', timestamp: '2026-06-02T10:12:15Z', model: 'gemini-1.5-pro', user: 'admin@school.edu', prompt: 'Summarize weekly reports', tokens: 4500, cost: '.045' },
    { id: '4', timestamp: '2026-06-02T10:10:05Z', model: 'gpt-4o', user: 'student12@school.edu', prompt: 'Help with algebra homework', tokens: 350, cost: '.003' },
    { id: '5', timestamp: '2026-06-02T10:08:22Z', model: 'claude-3-opus', user: 'teacher2@school.edu', prompt: 'Draft a parent communication email', tokens: 600, cost: '.006' }
  ];

  return NextResponse.json({ models, recentLogs });
}
