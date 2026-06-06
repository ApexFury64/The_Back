"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, FileText, CheckCircle, Info } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function NotificationsPage() {
  const [data, setData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"alerts" | "announcements">("alerts");

  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  useEffect(() => {
    const email = userEmail || 'parent.reddy@gmail.com';
    
    // Fetch both child progress data and general notifications
    Promise.all([
      fetch(`/api/parent/dashboard?parentEmail=${email}`).then(res => res.json()),
      fetch(`/api/notifications`).then(res => res.json())
    ])
      .then(([dashboardData, notificationsData]) => {
        setData(dashboardData);
        if (notificationsData.notifications) {
          setAnnouncements(notificationsData.notifications);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading notification data:", err);
        setLoading(false);
      });
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
  const alerts = [
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
        {/* Tab Controls */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("alerts")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all",
              activeTab === "alerts" ? "bg-teal/20 text-teal shadow-sm" : "text-muted-foreground hover:text-white"
            )}
          >
            Child Progress Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all",
              activeTab === "announcements" ? "bg-teal/20 text-teal shadow-sm" : "text-muted-foreground hover:text-white"
            )}
          >
            School Announcements ({announcements.length})
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === "alerts" && (
            <>
              {alerts.map((notif: any, i: number) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                      <h4 className="font-semibold text-base text-white">{notif.title}</h4>
                      <span className="text-xs text-muted-foreground">{notif.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                    <button className="text-xs font-medium text-foreground bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg border border-white/5">
                      {notif.action}
                    </button>
                  </div>
                </motion.div>
              ))}

              {alerts.length === 0 && (
                <div className="text-center p-12 glass-card-static rounded-2xl">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <CheckCircle size={32} className="text-teal" />
                  </div>
                  <h3 className="text-lg font-medium mb-1 text-white">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">You have no new alerts regarding your child's progress.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "announcements" && (
            <>
              {announcements.map((notif: any, i: number) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "glass-card-static p-5 rounded-2xl flex gap-4 items-start border-l-4",
                    notif.type === "alert" ? "border-l-coral" : notif.type === "warning" ? "border-l-amber" : "border-l-teal"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    notif.type === "alert" ? "bg-coral/10 text-coral" : notif.type === "warning" ? "bg-amber/10 text-amber" : "bg-teal/10 text-teal"
                  )}>
                    {notif.type === "alert" ? <AlertTriangle size={18} /> : <Info size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex sm:items-center justify-between flex-col sm:flex-row mb-1 gap-1">
                      <h4 className="font-semibold text-base text-white">{notif.title}</h4>
                      <span className="text-xs text-muted-foreground font-mono">{notif.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{notif.message}</p>
                  </div>
                </motion.div>
              ))}

              {announcements.length === 0 && (
                <div className="text-center p-12 glass-card-static rounded-2xl">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <CheckCircle size={32} className="text-teal" />
                  </div>
                  <h3 className="text-lg font-medium mb-1 text-white">No announcements</h3>
                  <p className="text-sm text-muted-foreground">You have no new school announcements at this time.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
