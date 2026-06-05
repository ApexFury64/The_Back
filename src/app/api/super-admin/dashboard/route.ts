import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalSchools = await prisma.school.count();
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });

    const superAdminStats = [
      { title: 'Total Schools', value: totalSchools.toString(), trend: `${totalSchools} active`, icon: 'Building2', trendUp: true },
      { title: 'Total Students', value: totalStudents.toLocaleString(), trend: 'Across all schools', icon: 'Users', trendUp: true },
      { title: 'Total Teachers', value: totalTeachers.toLocaleString(), trend: 'Active staff', icon: 'UserCheck', trendUp: true },
      { title: 'System Uptime', value: '99.99%', trend: 'Last 30 days', icon: 'Activity', trendUp: true },
    ];

    const platformSchools = await prisma.school.findMany({
      take: 5,
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    const formattedSchools = platformSchools.map(school => ({
      id: school.id,
      name: school.name,
      city: school.address || 'Unknown',
      students: school._count.users, // Simplification
      teachers: 0,
      plan: 'Enterprise',
      status: 'active',
      contact: 'admin@school.com',
      joinedAt: school.createdAt.toISOString().split('T')[0],
      aiUsage: Math.floor(Math.random() * 100)
    }));

    // Mock data for graphs and alerts as they aren't fully modelled yet
    const platformGrowthData = [
      { name: 'Jan', value: 10, value2: 5000 },
      { name: 'Feb', value: 12, value2: 7000 },
      { name: 'Mar', value: 14, value2: 9500 },
      { name: 'Apr', value: 14, value2: 11000 },
      { name: 'May', value: totalSchools, value2: totalStudents },
    ];

    const systemHealthData = [
      { metric: 'Primary Database', status: 'healthy', value: 'Online (12ms latency)' },
      { metric: 'API Gateway', status: 'healthy', value: 'Online (18ms latency)' },
      { metric: 'AI Inference Queue', status: 'healthy', value: 'Active' },
      { metric: 'Vercel Edge Network', status: 'healthy', value: '99.99% uptime' },
    ];

    const recentAlerts = [
      { id: '1', type: 'warning', message: 'High CPU usage on Database Cluster 02', time: '10 mins ago', resolved: false },
    ];

    const platformMetrics = [
      { name: 'API Requests', label: 'API Requests', value: '12.4M', trend: '+15%', status: 'healthy' },
    ];

    const auditLog = [
      { id: '1', action: 'System Init', details: 'Prisma DB Connect', detail: 'Prisma DB Connect', user: 'System', time: '1 hour ago', status: 'success', type: 'success' },
    ];

    return NextResponse.json({
      superAdminStats,
      platformGrowthData,
      systemHealthData,
      platformSchools: formattedSchools,
      recentAlerts,
      platformMetrics,
      auditLog
    });
  } catch (error) {
    console.error('Error fetching super-admin dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
