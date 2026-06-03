"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GlassAreaChart } from "@/components/charts/Charts";

export default function SuperAdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/super-admin/dashboard').then(res => res.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <DashboardLayout role="super-admin" userName="Admin" schoolName="Loading..." pageTitle="Analytics" pageSubtitle="Loading..."><div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="super-admin" userName="Admin" schoolName="AI Tutor Platform" pageTitle="Global Analytics" pageSubtitle="Platform-wide engagement and growth metrics">
      <div className="space-y-6">
        <GlassAreaChart
          data={data.platformGrowthData}
          title="Platform Growth"
          subtitle="Schools and users over time"
          dataKey1="value"
          dataKey2="value2"
          label1="Schools"
          label2="Users"
          color1="#00d4aa"
          color2="#0ea5e9"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.platformMetrics.map((metric: any, i: number) => (
            <div key={i} className="glass-card-static p-4 rounded-xl">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <h4 className="text-2xl font-bold mt-1 mb-2">{metric.value}</h4>
              <span className="text-[10px] text-teal bg-teal/10 px-2 py-0.5 rounded-full">{metric.trend}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
