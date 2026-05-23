"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GlassAreaChart, GlassBarChart } from "@/components/charts/Charts";
import { performanceData, weeklyStudyData, subjectPerformanceData } from "@/lib/mock-data";

export default function StudentAnalyticsPage() {
  return (
    <DashboardLayout
      role="student"
      userName="Arjun Reddy"
      schoolName="Class 7-B • Delhi Public School"
      pageTitle="Performance Analytics"
      pageSubtitle="Deep dive into your learning metrics"
    >
      <div className="space-y-6">
        
        {/* Top Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassAreaChart 
            title="Overall Performance Trend"
            data={performanceData} 
            color1="#00d4aa" 
            height={300} 
          />
          
          <GlassBarChart 
            title="Weekly Study Hours"
            data={weeklyStudyData} 
            color="#0ea5e9" 
            height={300} 
          />
        </div>

        {/* Subject Breakdown */}
        <GlassBarChart 
          title="Subject Performance"
          data={subjectPerformanceData} 
          color="#8b5cf6" 
          height={350} 
        />

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card-light bg-teal/5 border-teal/20">
            <h4 className="font-bold text-teal mb-2">Strongest Subject</h4>
            <p className="text-2xl font-bold text-navy-900 dark:text-white">English</p>
            <p className="text-sm text-muted-foreground mt-1">Consistently scoring above 90%</p>
          </div>
          <div className="stat-card-light bg-coral/5 border-coral/20">
            <h4 className="font-bold text-coral mb-2">Needs Attention</h4>
            <p className="text-2xl font-bold text-navy-900 dark:text-white">Physics</p>
            <p className="text-sm text-muted-foreground mt-1">Trending downwards by 5% this month</p>
          </div>
          <div className="stat-card-light bg-amber/5 border-amber/20">
            <h4 className="font-bold text-amber mb-2">Study Habit</h4>
            <p className="text-2xl font-bold text-navy-900 dark:text-white">Night Owl</p>
            <p className="text-sm text-muted-foreground mt-1">Most productive between 8PM - 11PM</p>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
