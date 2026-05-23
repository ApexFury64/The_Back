"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Activity, AlertCircle, CheckCircle, ChevronRight,
  Database, Globe, Search, Server, Shield, TrendingUp
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { GlassAreaChart } from "@/components/charts/Charts";
import {
  superAdminStats, platformSchools, systemHealthData,
  platformGrowthData
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function SuperAdminDashboard() {
  return (
    <DashboardLayout
      role="super-admin"
      userName="Admin"
      schoolName="TechWing Platform"
      pageTitle="Platform Overview"
      pageSubtitle="TechWing AI Tutor · Super Admin"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {superAdminStats.map((stat, i) => (
            <StatCard key={stat.title} stat={stat} index={i} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Charts + Schools Table */}
          <div className="lg:col-span-2 space-y-6">
            <GlassAreaChart
              data={platformGrowthData}
              title="Platform Growth"
              subtitle="Schools and users over time"
              dataKey1="value"
              dataKey2="value2"
              label1="Schools"
              label2="Users"
              color1="#00d4aa"
              color2="#0ea5e9"
            />

            {/* Schools Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Registered Schools</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Search schools..." className="glass-input pl-8 pr-3 py-1.5 text-[11px] w-44" />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["School", "City", "Students", "Teachers", "Plan", "AI Usage", "Status"].map((h) => (
                        <th key={h} className="text-[10px] text-muted-foreground font-medium text-left py-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {platformSchools.map((school) => (
                      <tr key={school.id} className="border-b border-white/3 hover:bg-white/3 transition-colors cursor-pointer">
                        <td className="py-2.5 px-3">
                          <span className="text-xs font-medium">{school.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground">{school.city}</td>
                        <td className="py-2.5 px-3 text-xs">{school.students.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-xs">{school.teachers}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                            school.plan === "enterprise" && "bg-purple/15 text-purple",
                            school.plan === "pro" && "bg-teal/15 text-teal",
                            school.plan === "basic" && "bg-cyan/15 text-cyan",
                          )}>
                            {school.plan}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="progress-bar flex-1" style={{ height: 4 }}>
                              <div className="progress-fill" style={{ width: `${school.aiUsage}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{school.aiUsage}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn(
                            "w-2 h-2 rounded-full inline-block",
                            school.status === "active" ? "bg-teal" : "bg-muted-foreground"
                          )} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Right: System Health + Audit */}
          <div className="space-y-6">
            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-teal" />
                <h3 className="text-sm font-semibold">System Health</h3>
              </div>
              <div className="space-y-2.5">
                {systemHealthData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3">
                    <div className="flex items-center gap-2">
                      {item.status === "healthy" ? (
                        <CheckCircle size={14} className="text-teal" />
                      ) : (
                        <AlertCircle size={14} className="text-amber" />
                      )}
                      <span className="text-xs">{item.metric}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      item.status === "healthy" ? "text-teal" : "text-amber"
                    )}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Platform Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-4">Platform Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: "Daily Active Users", value: "12,847", trend: "+8%", icon: <Globe size={14} /> },
                  { label: "AI Queries Today", value: "45,230", trend: "+15%", icon: <Server size={14} /> },
                  { label: "Avg Response Time", value: "124ms", trend: "-12%", icon: <Activity size={14} /> },
                  { label: "Storage Used", value: "2.4 TB", trend: "+5%", icon: <Database size={14} /> },
                  { label: "Active Subscriptions", value: "142", trend: "+3%", icon: <Shield size={14} /> },
                ].map((metric, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{metric.icon}</span>
                      <span className="text-xs">{metric.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{metric.value}</span>
                      <span className="text-[10px] text-teal flex items-center gap-0.5">
                        <TrendingUp size={10} /> {metric.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Audit Log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: "New school registered", detail: "Cambridge School, Bangalore", time: "10 min ago", type: "success" },
                  { action: "Storage warning", detail: "DPS Hyderabad at 90% capacity", time: "1 hour ago", type: "warning" },
                  { action: "Plan upgraded", detail: "KV Delhi → Pro plan", time: "3 hours ago", type: "info" },
                  { action: "AI token limit reached", detail: "St. Mary's Mumbai — daily limit", time: "5 hours ago", type: "alert" },
                ].map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      log.type === "success" && "bg-teal",
                      log.type === "warning" && "bg-amber",
                      log.type === "info" && "bg-cyan",
                      log.type === "alert" && "bg-coral",
                    )} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{log.action}</p>
                      <p className="text-[10px] text-muted-foreground">{log.detail}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{log.time}</p>
                    </div>
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
