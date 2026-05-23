"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bell, ChevronRight, GraduationCap, Megaphone, Plus,
  Search, Settings, Users, UserPlus
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { GlassAreaChart, GlassBarChart } from "@/components/charts/Charts";
import {
  adminStats, schoolPerformanceData, attendanceData,
  recentAnnouncements
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  return (
    <DashboardLayout
      role="admin"
      userName="Dr. Rajesh Gupta"
      schoolName="Delhi Public School"
      pageTitle="School Administration"
      pageSubtitle="Delhi Public School, Hyderabad"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat, i) => (
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
          ].map((action, i) => (
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
                    {[
                      { name: "Arjun Reddy", class: "10-A", grade: "A", aiUsage: "High", status: "active" },
                      { name: "Priya Sharma", class: "10-A", grade: "A+", aiUsage: "Very High", status: "active" },
                      { name: "Vikram Singh", class: "10-B", grade: "C+", aiUsage: "Low", status: "active" },
                      { name: "Kavya Nair", class: "9-A", grade: "A", aiUsage: "Medium", status: "active" },
                      { name: "Ravi Kumar", class: "9-C", grade: "B", aiUsage: "High", status: "inactive" },
                    ].map((student, i) => (
                      <tr key={i} className="border-b border-white/3 hover:bg-white/3 transition-colors cursor-pointer">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-[9px] font-bold text-teal">
                              {student.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="text-xs font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground">{student.class}</td>
                        <td className="py-2.5 px-3 text-xs font-medium">{student.grade}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            student.aiUsage === "Very High" && "bg-teal/15 text-teal",
                            student.aiUsage === "High" && "bg-cyan/15 text-cyan",
                            student.aiUsage === "Medium" && "bg-amber/15 text-amber",
                            student.aiUsage === "Low" && "bg-coral/15 text-coral",
                          )}>
                            {student.aiUsage}
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
                {recentAnnouncements.map((ann) => (
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
                {[
                  { label: "Classes", value: "42", sub: "12 grades × 3-4 sections" },
                  { label: "Subjects", value: "18", sub: "Core + Electives" },
                  { label: "AI Sessions (Today)", value: "847", sub: "+23% from yesterday" },
                  { label: "Pending Approvals", value: "5", sub: "3 materials, 2 assignments" },
                ].map((item, i) => (
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
