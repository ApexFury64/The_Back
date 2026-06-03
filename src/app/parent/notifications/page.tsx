"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, FileText, CheckCircle, Info } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function NotificationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  useEffect(() => {
    const email = userEmail || 'parent.reddy@gmail.com';
    fetch(`/api/parent/dashboard?parentEmail=${email}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userEmail]);

  if (loading || !data || data.error) {
    return (
      <DashboardLayout role="parent" userName={userName || "Parent"} schoolName={schoolName || "AI Tutor"} pageTitle="Notifications" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  const { student, weakSubjectAlerts, studentAssignments } = data;

  // Combine alerts and assignments into a single notification feed
  const notifications = [
    ...weakSubjectAlerts.map((alert: any, i: number) => ({
      id: `alert-${i}`,
      type: "alert",
      title: `Attention needed in ${alert.subject}`,
      message: alert.issue,
      action: alert.recommendation,
      severity: alert.severity,
      time: "2 hours ago"
    })),
    ...studentAssignments.filter((a: any) => a.status === 'pending').map((a: any, i: number) => ({
      id: `task-${i}`,
      type: "task",
      title: `Upcoming Assignment`,
      message: `${a.title} is due soon.`,
      action: "Review Assignment Details",
      severity: "medium",
      time: "1 day ago"
    }))
  ];

  return (
    <DashboardLayout
      role="parent"
      userName={userName || "Parent"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Notifications & Alerts"
      pageSubtitle={`${student?.name || 'Student'} · Inbox and Alerts`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Your Inbox</h2>
          <button className="text-xs text-teal hover:underline font-medium">Mark all as read</button>
        </div>

        <div className="space-y-4">
          {notifications.map((notif: any, i: number) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-static p-5 rounded-2xl flex gap-4 items-start"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                notif.type === "alert" && notif.severity === "high" ? "bg-coral/20 text-coral" :
                notif.type === "alert" ? "bg-amber/20 text-amber" : "bg-teal/20 text-teal"
              )}>
                {notif.type === "alert" ? <AlertTriangle size={18} /> : <FileText size={18} />}
              </div>
              
              <div className="flex-1">
                <div className="flex sm:items-center justify-between flex-col sm:flex-row mb-1">
                  <h4 className="font-semibold text-base">{notif.title}</h4>
                  <span className="text-xs text-muted-foreground">{notif.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                <button className="text-xs font-medium text-foreground bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg border border-white/5">
                  {notif.action}
                </button>
              </div>
            </motion.div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center p-12 glass-card-static rounded-2xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-medium mb-1">All caught up!</h3>
              <p className="text-sm text-muted-foreground">You have no new notifications.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
