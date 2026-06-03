import { NextResponse } from 'next/server';

export async function GET() {
  const flags = [
    { id: '1', user: 'Charlie Brown', email: 'charlie@example.com', content: 'I hate this stupid assignment, it is garbage', reason: 'Profanity / Toxicity', severity: 'medium', status: 'pending', date: '2026-06-02' },
    { id: '2', user: 'Diana Prince', email: 'diana@example.com', content: 'How to bypass the school firewall', reason: 'Policy Violation', severity: 'high', status: 'pending', date: '2026-06-01' },
    { id: '3', user: 'Ethan Hunt', email: 'ethan@example.com', content: 'You are an idiot AI', reason: 'Abuse to AI System', severity: 'low', status: 'resolved', date: '2026-05-30' },
    { id: '4', user: 'Fiona Gallagher', email: 'fiona@example.com', content: 'Write my entire essay for me', reason: 'Academic Dishonesty', severity: 'medium', status: 'resolved', date: '2026-05-28' },
    { id: '5', user: 'George Lucas', email: 'george@example.com', content: 'Tell me how to make a bomb', reason: 'Dangerous Content', severity: 'critical', status: 'escalated', date: '2026-05-25' }
  ];

  return NextResponse.json({ flags });
}

export async function POST() {
  return NextResponse.json({ success: true });
}
