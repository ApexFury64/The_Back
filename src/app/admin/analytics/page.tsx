"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GlassAreaChart, GlassBarChart } from "@/components/charts/Charts";
import { useAppStore } from "@/lib/store";

export default function AdminAnalyticsPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard').then(res => res.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <DashboardLayout role="admin" userName={userName || "Admin"} schoolName={schoolName || "Loading..."} pageTitle="Analytics" pageSubtitle="Loading..."><div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor"} pageTitle="School Analytics" pageSubtitle="Deep dive into school performance">
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassAreaChart
            data={data.schoolPerformanceData}
            title="Academic Performance"
            subtitle="School-wide average score progression"
            dataKey1="value"
            dataKey2="value2"
            label1="This Year"
            label2="Last Year"
          />
          <GlassBarChart
            data={data.attendanceData}
            title="School Attendance"
            subtitle="Daily attendance percentage"
            color="#0ea5e9"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
