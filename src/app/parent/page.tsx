"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardData } from "@/lib/types";
import {
  AlertTriangle, Bot, ChevronRight, Clock, FileText,
  MessageSquare, Send, TrendingDown, TrendingUp, User
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { GlassAreaChart } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import CustomDropdown from "@/components/ui/CustomDropdown";

const activityIcons: Record<string, React.ReactNode> = {
  class: <User size={14} />,
  ai: <Bot size={14} />,
  assignment: <FileText size={14} />,
  quiz: <MessageSquare size={14} />,
  study: <Clock size={14} />,
};

const activityColors: Record<string, string> = {
  class: "#0ea5e9",
  ai: "#00d4aa",
  assignment: "#a78bfa",
  quiz: "#f59e0b",
  study: "#34d399",
};

export default function ParentDashboard() {
  const [aiQuery, setAiQuery] = useState("");
  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const [selectedStandard, setSelectedStandard] = useState<string>("8");

  const { data, isLoading: loading, error } = useQuery<DashboardData>({
    queryKey: ['parentDashboard', userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/parent/dashboard`);
      if (!res.ok) {
        let errMsg = 'Failed to fetch';
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch(e) {}
        throw new Error(errMsg);
      }
      return res.json();
    },
    refetchInterval: 10000,
    retry: 1,
  });

  if (loading) {
    return (
      <DashboardLayout role="parent" userName="Parent" schoolName="Loading..." pageTitle="Your Child's Progress" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  if (error || !data || data.error) {
    return (
      <DashboardLayout role="parent" userName="Parent" schoolName="Error" pageTitle="Dashboard Error" pageSubtitle="Action needed">
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <AlertTriangle size={48} className="text-coral mb-4" />
          <h2 className="text-xl font-bold mb-2">Could not load dashboard</h2>
          <p className="text-muted-foreground">{error?.message || data?.error || 'An unexpected error occurred.'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const {
    parentChildStats = [],
    weeklyStudyData = [],
    weakSubjectAlerts = [],
    studentSubjects = [],
    studentAssignments = [],
    childDailyActivity = [],
    student = null
  } = data;

  const standards = ["All", ...Array.from(new Set<string>(studentSubjects.map((s: any) => s.standard || '8'))).sort((a: any, b: any) => b.toString().localeCompare(a.toString()))];
  const filteredSubjects = selectedStandard === "All" ? studentSubjects : studentSubjects.filter((s: any) => (s.standard || '8') === selectedStandard);

  return (
    <DashboardLayout
      role="parent"
      userName={userName || data.parent?.name || "Parent"}
      schoolName={schoolName || data.school?.name || "AI Tutor"}
      pageTitle="Your Child's Progress"
      pageSubtitle={`${student?.name || 'Student'} · ${data.selectedChild?.className || 'N/A'} · ${data.school?.name || ''}`}
    >
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {parentChildStats.map((stat: any, i: number) => (
            <StatCard key={stat.title} stat={stat} index={i} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Charts + Alerts */}
          <div className="lg:col-span-2 space-y-6">
            <GlassAreaChart
              data={weeklyStudyData}
              title="Weekly Study Activity"
              subtitle="Hours spent studying this week"
              dataKey1="value"
              dataKey2="value2"
              label1="Study Time (min)"
              label2="AI Sessions (min)"
            />

            {/* Weak Subject Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-coral" />
                <h3 className="text-sm font-semibold">Attention Needed</h3>
              </div>
              <div className="space-y-3">
                {weakSubjectAlerts.map((alert: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-coral/5 border border-coral/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{alert.subject}</span>
                      <span className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        alert.severity === "high" ? "bg-coral/15 text-coral" : "bg-amber/15 text-amber"
                      )}>
                        {alert.severity} priority
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.issue}</p>
                    <p className="text-xs text-teal mt-2 flex items-center gap-1">
                      <TrendingUp size={12} /> {alert.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Subject Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Subject Performance</h3>
                <CustomDropdown
                  options={standards}
                  value={selectedStandard}
                  onChange={setSelectedStandard}
                  labelPrefix="Standard"
                  currentStandard="8"
                />
              </div>
              <div className="space-y-3">
                {filteredSubjects.map((subject: any, index: number) => (
                  <div key={`${subject.id || subject.name}-${subject.standard}-${index}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${subject.color || '#fff'}15`, color: subject.color }}>
                      {(subject.code || subject.name || '').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{subject.name} {subject.standard ? `(Std ${subject.standard})` : ''}</span>
                        <span className="text-xs font-bold" style={{ color: subject.color }}>{subject.score}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${subject.score || subject.progress || 0}%`, background: subject.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Activity Log + AI Insights */}
          <div className="space-y-6">
            {/* AI Insight Query */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-cyan flex items-center justify-center">
                  <Bot size={16} className="text-navy-900" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Ask AI About Your Child</h3>
                  <p className="text-[10px] text-muted-foreground">Get intelligent insights</p>
                </div>
              </div>
              {/* Sample Questions */}
              <div className="space-y-2 mb-3">
                {[
                  "Why is Arjun weak in Physics?",
                  "How much time did he study this week?",
                  "Is he ready for the mid-term exams?",
                ].map((q, i: number) => (
                  <button
                    key={i}
                    onClick={() => setAiQuery(q)}
                    className="w-full text-left text-[11px] text-muted-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-white/5"
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask anything about your child..."
                  className="glass-input flex-1 px-3 py-2 text-sm"
                />
                <button className="glass-button px-3 py-2"><Send size={14} /></button>
              </div>
            </motion.div>

            {/* Daily Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-4">Today&apos;s Activity</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
                <div className="space-y-4">
                  {childDailyActivity.map((activity: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 pl-1">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10"
                        style={{ backgroundColor: `${activityColors[activity.type]}15`, color: activityColors[activity.type] }}
                      >
                        {activityIcons[activity.type]}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{activity.activity}</p>
                        <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Assignments Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-4">Assignment Tracker</h3>
              <div className="space-y-2">
                {studentAssignments.slice(0, 4).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} style={{ color: a.subjectColor }} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium truncate">{a.title}</p>
                        <p className="text-[9px] text-muted-foreground">{a.subject}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0",
                      a.status === "pending" && "bg-amber/15 text-amber",
                      a.status === "submitted" && "bg-cyan/15 text-cyan",
                      a.status === "graded" && "bg-teal/15 text-teal",
                      a.status === "overdue" && "bg-coral/15 text-coral",
                    )}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
