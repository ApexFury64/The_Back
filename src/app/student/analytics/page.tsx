"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GlassAreaChart, GlassBarChart } from "@/components/charts/Charts";

export default function StudentAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard?userEmail=arjun@techwing.com')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data || data.error) {
    return (
      <DashboardLayout role="student" userName="..." schoolName="Class 7-B" pageTitle="Performance Analytics" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  const { performanceTrend, subjectPerformance, subjects, user } = data;

  // Find strongest and weakest subjects
  const sortedSubjects = [...(subjectPerformance || [])].sort((a: any, b: any) => b.value - a.value);
  const strongest = sortedSubjects[0];
  const weakest = sortedSubjects[sortedSubjects.length - 1];

  // Compute study data from subjects progress
  const studyData = (subjects || []).map((s: any) => ({
    name: s.code.slice(0, 4),
    value: Math.round(s.progress / 10) || 1
  }));

  return (
    <DashboardLayout
      role="student"
      userName={user?.name || "Student"}
      schoolName="Class 7-B • Delhi Public School"
      pageTitle="Performance Analytics"
      pageSubtitle="Deep dive into your learning metrics"
    >
      <div className="space-y-6">

        {/* Top Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performanceTrend && performanceTrend.length > 0 && (
            <GlassAreaChart
              title="Overall Performance Trend"
              subtitle="Quiz scores over time"
              data={performanceTrend}
              dataKey1="value"
              dataKey2="value2"
              label1="Your Score"
              label2="Class Average"
              color1="#00d4aa"
              height={300}
            />
          )}

          {studyData.length > 0 && (
            <GlassBarChart
              title="Study Progress by Subject"
              subtitle="Based on completed topics"
              data={studyData}
              color="#0ea5e9"
              height={300}
            />
          )}
        </div>

        {/* Subject Breakdown */}
        {subjectPerformance && subjectPerformance.length > 0 && (
          <GlassBarChart
            title="Subject Performance"
            subtitle="Average quiz scores per subject"
            data={subjectPerformance}
            color="#8b5cf6"
            height={350}
          />
        )}

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card-light bg-teal/5 border-teal/20">
            <h4 className="font-bold text-teal mb-2">Strongest Subject</h4>
            <p className="text-2xl font-bold text-navy-900 dark:text-white">{strongest?.name || 'N/A'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {strongest ? `Scoring ${strongest.value}% on average` : 'Take some quizzes to see insights'}
            </p>
          </div>
          <div className="stat-card-light bg-coral/5 border-coral/20">
            <h4 className="font-bold text-coral mb-2">Needs Attention</h4>
            <p className="text-2xl font-bold text-navy-900 dark:text-white">{weakest?.name || 'N/A'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {weakest ? `Scoring ${weakest.value}% — room to improve` : 'Keep studying!'}
            </p>
          </div>
          <div className="stat-card-light bg-amber/5 border-amber/20">
            <h4 className="font-bold text-amber mb-2">Topics Completed</h4>
            <p className="text-2xl font-bold text-navy-900 dark:text-white">
              {subjects?.reduce((sum: number, s: any) => sum + Math.round(s.progress / 10), 0) || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Across all {subjects?.length || 0} subjects</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
