import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const totalSchools = 15;
    const totalStudents = 12450;
    const totalTeachers = 840;

    const superAdminStats = [
      { title: 'Total Schools', value: totalSchools.toString(), trend: '14 active', icon: 'Building2', trendUp: true },
      { title: 'Total Students', value: totalStudents.toLocaleString(), trend: 'Across all schools', icon: 'Users', trendUp: true },
      { title: 'Total Teachers', value: totalTeachers.toLocaleString(), trend: 'Active staff', icon: 'UserCheck', trendUp: true },
      { title: 'System Uptime', value: '99.99%', trend: 'Last 30 days', icon: 'Activity', trendUp: true },
    ];

    const platformGrowthData = [
      { name: 'Jan', value: 10, value2: 5000 },
      { name: 'Feb', value: 12, value2: 7000 },
      { name: 'Mar', value: 14, value2: 9500 },
      { name: 'Apr', value: 14, value2: 11000 },
      { name: 'May', value: 15, value2: 12450 },
    ];

    const systemHealthData = [
      { name: '00:00', value: 20 },
      { name: '04:00', value: 15 },
      { name: '08:00', value: 60 },
      { name: '12:00', value: 95 },
      { name: '16:00', value: 85 },
      { name: '20:00', value: 40 },
    ];

    const platformSchools = [
      { id: '1', name: 'Oakridge International', city: 'Bengaluru', students: 1700, teachers: 130, plan: 'Enterprise', status: 'active', contact: 'admin@oak-blr.edu', joinedAt: '2023-01-15', aiUsage: 85 },
      { id: '2', name: 'Kendriya Vidyalaya', city: 'New Delhi', students: 3500, teachers: 210, plan: 'Pro', status: 'active', contact: 'admin@kv-del.edu', joinedAt: '2023-03-22', aiUsage: 65 },
      { id: '3', name: 'Delhi Public School', city: 'Hyderabad', students: 2850, teachers: 145, plan: 'Enterprise', status: 'active', contact: 'admin@dps-hyd.edu', joinedAt: '2023-06-10', aiUsage: 75 },
      { id: '4', name: 'Future Innovators', city: 'Seattle', students: 1200, teachers: 90, plan: 'Enterprise', status: 'active', contact: 'info@futureinnovators.org', joinedAt: '2023-08-05', aiUsage: 92 },
      { id: '5', name: 'Legacy Prep School', city: 'Boston', students: 640, teachers: 55, plan: 'Pro', status: 'inactive', contact: 'admin@legacyprep.edu', joinedAt: '2024-01-12', aiUsage: 12 },
    ];

    const recentAlerts = [
      { id: '1', type: 'warning', message: 'High CPU usage on Database Cluster 02', time: '10 mins ago', resolved: false },
      { id: '2', type: 'info', message: 'New school "Lincoln High" completed onboarding', time: '1 hour ago', resolved: true },
      { id: '3', type: 'error', message: 'API Rate limit exceeded for tenant "Sunshine Primary"', time: '2 hours ago', resolved: true },
      { id: '4', type: 'warning', message: 'Payment failed for 2 Premium subscriptions', time: '5 hours ago', resolved: false },
    ];

    const platformMetrics = [
      { name: 'API Requests', value: '12.4M', trend: '+15%', status: 'healthy' },
      { name: 'Database Storage', value: '450 GB', trend: '70% capacity', status: 'warning' },
      { name: 'Active Subscriptions', value: '14', trend: '+2 this month', status: 'healthy' }
    ];

    const auditLog = [
      { id: '1', action: 'School Created', details: 'Added Lincoln High', user: 'Admin', time: '1 hour ago', status: 'success' },
      { id: '2', action: 'Subscription Updated', details: 'Sunshine Primary upgraded to Enterprise', user: 'System', time: '3 hours ago', status: 'success' },
      { id: '3', action: 'AI Model Changed', details: 'Switched default to GPT-4o', user: 'Admin', time: 'Yesterday', status: 'warning' }
    ];

    return NextResponse.json({
      superAdminStats,
      platformGrowthData,
      systemHealthData,
      platformSchools,
      recentAlerts,
      platformMetrics,
      auditLog
    });
  } catch (error) {
    console.error('Error fetching super-admin dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
