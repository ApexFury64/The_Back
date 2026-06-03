"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bot, FileText, MessageSquare, Clock, ArrowDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const activityIcons: Record<string, React.ReactNode> = {
  class: <User size={16} />,
  ai: <Bot size={16} />,
  assignment: <FileText size={16} />,
  quiz: <MessageSquare size={16} />,
  study: <Clock size={16} />,
};

const activityColors: Record<string, string> = {
  class: "#0ea5e9",
  ai: "#00d4aa",
  assignment: "#a78bfa",
  quiz: "#f59e0b",
  study: "#34d399",
};

export default function ActivityLogPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <DashboardLayout role="parent" userName={userName || "Parent"} schoolName={schoolName || "AI Tutor"} pageTitle="Activity Log" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  const { student, childDailyActivity } = data;

  return (
    <DashboardLayout
      role="parent"
      userName={userName || "Parent"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Activity Log"
      pageSubtitle={`${student?.name || 'Student'} · Recent Actions on the Platform`}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-static p-6 md:p-8 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold">Today's Timeline</h3>
            <span className="px-3 py-1 bg-teal/10 text-teal text-xs font-medium rounded-full">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="relative pl-6 md:pl-8 border-l-2 border-white/10 space-y-10">
            {childDailyActivity.map((activity: any, i: number) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Timeline dot/icon */}
                <div 
                  className="absolute -left-[35px] md:-left-[43px] w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#0b1121] shadow-lg"
                  style={{ backgroundColor: activityColors[activity.type] || '#fff', color: '#0b1121' }}
                >
                  {activityIcons[activity.type] || <Clock size={16} />}
                </div>

                {/* Content Card */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="font-medium text-foreground">{activity.activity}</h4>
                    <span className="text-xs font-semibold text-muted-foreground bg-black/20 px-2 py-1 rounded-md w-fit">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.type === 'quiz' && "Completed with 85% accuracy. Great job!"}
                    {activity.type === 'ai' && "Asked 3 questions related to algebraic equations."}
                    {activity.type === 'assignment' && "Reviewed pending tasks for the upcoming week."}
                    {activity.type === 'class' && "Attended live session with Mrs. Sharma."}
                    {activity.type === 'study' && "Read chapter materials for 45 minutes."}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button className="glass-button-secondary text-sm flex items-center gap-2 px-6">
              <ArrowDown size={14} /> Load Older Activity
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
