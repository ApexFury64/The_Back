"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardData } from "@/lib/types";
import {
  AlertTriangle, BookOpen, ChevronRight, Clock,
  FileCheck, Sparkles, TrendingDown, Upload, Users, Video, Megaphone
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { GlassAreaChart } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

export default function TeacherDashboard() {
  const userEmail = useAppStore(s => s.userEmail);
  const { data, isLoading: loading } = useQuery<DashboardData>({
    queryKey: ['teacherDashboard', userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/dashboard`);
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
    refetchInterval: 10000,
  });

  if (loading || !data || data.error) {
    return (
      <DashboardLayout role="teacher" userName={data?.teacher?.name || 'Teacher'} schoolName={'Loading...'} pageTitle="Teacher Dashboard" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  const {
    teacherStats,
    performanceData,
    teacherClasses,
    weakStudents,
    announcements = []
  } = data;

  return (
    <DashboardLayout
      role="teacher"
      userName={data.teacher?.name || 'Teacher'}
      schoolName={data.school?.name || 'AI Tutor'}
      pageTitle="Teacher Dashboard"
      pageSubtitle={`${data.teacherClasses?.length || 0} Classes · ${data.teacherClasses?.flatMap((c: any) => c.subjects || []).length || 0} Subjects`}
    >
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {teacherStats.map((stat: any, i: number) => (
            <StatCard key={stat.title} stat={stat} index={i} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Charts + Classes */}
          <div className="lg:col-span-2 space-y-6">
            <GlassAreaChart
              data={performanceData}
              title="Class Performance Trend"
              subtitle="Average scores across your classes"
              dataKey1="value"
              dataKey2="value2"
              label1="Class 10-A"
              label2="Class 10-B"
              color1="#00d4aa"
              color2="#a78bfa"
            />

            {/* My Classes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">My Classes</h3>
                <Link href="/teacher/classes" className="text-[10px] text-teal hover:underline">Manage Classes</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {teacherClasses.map((cls: any) => (
                  <Link href="/teacher/classes" key={cls.id} className="p-4 rounded-xl bg-white/3 border border-white/5 hover:border-teal/20 hover:bg-white/5 transition-all cursor-pointer group block">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">{cls.name}</h4>
                      <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{(cls.subjects || []).map((s: any) => s.name).join(', ')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 rounded-lg bg-white/5">
                        <p className="text-lg font-bold text-teal">{cls.students}</p>
                        <p className="text-[9px] text-muted-foreground">Students</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/5">
                        <p className="text-lg font-bold text-cyan">{cls.sections?.length || 0}</p>
                        <p className="text-[9px] text-muted-foreground">Sections</p>
                      </div>
                    </div>
                    {cls.isClassTeacher && (
                      <div className="mt-2 text-[10px] text-teal font-medium bg-teal/10 px-2 py-1 rounded-lg text-center">Class Teacher</div>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: AI Tools + Weak Students */}
          <div className="space-y-6">
            {/* AI Teaching Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-teal" />
                <h3 className="text-sm font-semibold">AI Teaching Tools</h3>
              </div>
              <div className="space-y-2">
                {[
                  { icon: <FileCheck size={16} />, label: "Generate Question Paper", desc: "AI creates from syllabus", color: "#00d4aa", href: "/teacher/ai-tools" },
                  { icon: <BookOpen size={16} />, label: "Create Assignment", desc: "Instant topic-based assignment", color: "#0ea5e9", href: "/teacher/assignments" },
                  { icon: <Upload size={16} />, label: "Upload Materials", desc: "Add notes, PDFs, papers", color: "#a78bfa", href: "/teacher/materials" },
                  { icon: <Video size={16} />, label: "Schedule Live Class", desc: "Google Meet integration", color: "#f59e0b", href: "/teacher/live-classes" },
                ].map((tool: any, i: number) => (
                  <Link key={i} href={tool.href} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tool.color}15`, color: tool.color }}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{tool.label}</p>
                      <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Weak Students Alert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-coral" />
                <h3 className="text-sm font-semibold">Students Needing Help</h3>
              </div>
              <div className="space-y-3">
                {weakStudents.map((student: any, i: number) => (
                  <Link href={`/teacher/students/${student.id || 1}`} key={i} className="block p-3 rounded-xl bg-coral/5 border border-coral/10 hover:bg-coral/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-coral/15 flex items-center justify-center text-[9px] font-bold text-coral">
                          {student.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{student.name}</p>
                          <p className="text-[9px] text-muted-foreground">{student.class}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-coral">{student.score}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingDown size={10} className="text-coral" />
                      <span className="text-[10px] text-muted-foreground">{student.issue} · {student.trend}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Live Classes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Video size={16} className="text-cyan" /> Upcoming Classes
              </h3>
              <div className="space-y-2">
                {teacherClasses.slice(0, 3).map((cls: any) => (
                  <div key={cls.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-xs font-medium">{cls.name} · {(cls.subjects || []).map((s: any) => s.name).join(', ')}</p>
                      <p className="text-[10px] text-muted-foreground">{cls.students} students · {cls.sections?.length || 0} sections</p>
                    </div>
                    <Link href="/teacher/live-classes" className="text-[10px] text-teal font-medium px-2.5 py-1 rounded-lg bg-teal/10 hover:bg-teal/20 transition-colors inline-block">
                      Start
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* School Announcements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Megaphone size={16} className="text-teal" /> School Announcements
              </h3>
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No recent announcements</p>
                ) : (
                  announcements.map((ann: any) => (
                    <div key={ann.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                          ann.priority === 'high' ? 'bg-coral/15 text-coral' : 'bg-teal/15 text-teal'
                        )}>
                          {ann.priority} Priority
                        </span>
                        <span className="text-[9px] text-muted-foreground">{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{ann.title}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{ann.content}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
