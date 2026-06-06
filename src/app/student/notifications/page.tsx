"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading notifications:", err);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout
      role="student"
      userName={userName || "Student"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Notifications"
      pageSubtitle="Stay updated with school announcements and alerts"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bell className="text-teal" size={20} />
            School Announcements
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any, i: number) => (
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

            {notifications.length === 0 && (
              <div className="text-center p-12 glass-card-static rounded-2xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <CheckCircle2 size={32} className="text-teal" />
                </div>
                <h3 className="text-lg font-medium mb-1 text-white">All caught up!</h3>
                <p className="text-sm text-muted-foreground">You have no announcements at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
