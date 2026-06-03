"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardData } from "@/lib/types";
import {
  Bell, ChevronRight, GraduationCap, Megaphone, Plus,
  Search, Settings, Users, UserPlus
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { GlassAreaChart, GlassBarChart } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function AdminDashboard() {
  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  const { data, isLoading: loading } = useQuery<DashboardData>({
    queryKey: ['adminDashboard', userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/admin/dashboard`);
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
    refetchInterval: 10000,
  });

  if (loading || !data || data.error) {
    return (
      <DashboardLayout role="admin" userName={userName || 'Admin'} schoolName={schoolName || 'Loading...'} pageTitle="School Administration" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  const {
    adminStats,
    schoolPerformanceData,
    attendanceData,
    recentStudents,
    recentAnnouncements,
    schoolOverview
  } = data;

  return (
    <DashboardLayout
      role="admin"
      userName={userName || "School Admin"}
      schoolName={schoolName || data.school?.name || "School Administration"}
      pageTitle="School Administration"
      pageSubtitle={`${data.school?.name || ''} - ${data.school?.code || ''}`}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat: any, i: number) => (
            <StatCard key={stat.title} stat={stat} index={i} />
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { icon: <UserPlus size={18} />, label: "Add Student", color: "#00d4aa" },
            { icon: <Users size={18} />, label: "Add Teacher", color: "#0ea5e9" },
            { icon: <Megaphone size={18} />, label: "Announcement", color: "#f59e0b" },
            { icon: <Settings size={18} />, label: "Settings", color: "#a78bfa" },
          ].map((action: any, i: number) => (
            <button key={i} className="glass-card p-4 flex flex-col items-center gap-2 text-center group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                {action.icon}
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <GlassAreaChart
              data={schoolPerformanceData}
              title="School Performance"
              subtitle="Average scores across all classes"
              dataKey1="value"
              dataKey2="value2"
              label1="This Year"
              label2="Last Year"
            />

            <GlassBarChart
              data={attendanceData}
              title="Weekly Attendance"
              subtitle="School-wide attendance percentage"
              color="#0ea5e9"
            />

            {/* Recent Students (Table-like) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Recent Enrollments</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Search students..." className="glass-input pl-8 pr-3 py-1.5 text-[11px] w-40" />
                  </div>
                  <button className="glass-button text-[11px] px-3 py-1.5 flex items-center gap-1">
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-[10px] text-muted-foreground font-medium text-left py-2 px-3">Student</th>
                      <th className="text-[10px] text-muted-foreground font-medium text-left py-2 px-3">Class</th>
                      <th className="text-[10px] text-muted-foreground font-medium text-left py-2 px-3">Grade</th>
                      <th className="text-[10px] text-muted-foreground font-medium text-left py-2 px-3">AI Usage</th>
                      <th className="text-[10px] text-muted-foreground font-medium text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((student: any, i: number) => (
                      <tr key={i} className="border-b border-white/3 hover:bg-white/3 transition-colors cursor-pointer">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-[9px] font-bold text-teal">
                              {student.name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <span className="text-xs font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground">{student.class}</td>
                        <td className="py-2.5 px-3 text-xs font-medium">{student.avgScore}%</td>
                        <td className="py-2.5 px-3">
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            student.avgScore >= 80 ? "bg-teal/15 text-teal" :
                            student.avgScore >= 60 ? "bg-cyan/15 text-cyan" :
                            student.avgScore >= 40 ? "bg-amber/15 text-amber" :
                            "bg-coral/15 text-coral"
                          )}>
                            {student.avgScore >= 80 ? "High" : student.avgScore >= 60 ? "Medium" : "Low"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn(
                            "w-2 h-2 rounded-full inline-block",
                            student.status === "active" ? "bg-teal" : "bg-muted-foreground"
                          )} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Right: Announcements + Quick Stats */}
          <div className="space-y-6">
            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Megaphone size={16} className="text-amber" /> Announcements
                </h3>
                <button className="text-[10px] text-teal hover:underline flex items-center gap-1">
                  <Plus size={10} /> New
                </button>
              </div>
              <div className="space-y-3">
                {recentAnnouncements.map((ann: any) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{ann.title}</span>
                      <span className={cn(
                        "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                        ann.priority === "high" && "bg-coral/15 text-coral",
                        ann.priority === "medium" && "bg-amber/15 text-amber",
                        ann.priority === "low" && "bg-teal/15 text-teal",
                      )}>
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{ann.content}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">{ann.date}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* School Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-4">School Overview</h3>
              <div className="space-y-3">
                {schoolOverview.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-[9px] text-muted-foreground">{item.sub}</p>
                    </div>
                    <span className="text-sm font-bold text-teal">{item.value}</span>
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
