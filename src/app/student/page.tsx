"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot, BookOpen, ChevronRight, Flame, MessageSquare,
  Send, Sparkles, Clock, FileText, Mic, Paperclip
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { GlassAreaChart, GlassBarChart, RadialProgress } from "@/components/charts/Charts";
import {
  studentStats, studentSubjects, weeklyStudyData,
  performanceData, studentAssignments, recentAIChats, leaderboard, subjectPerformanceData
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { getGreeting } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [aiInput, setAiInput] = useState("");

  return (
    <DashboardLayout
      role="student"
      userName="Arjun Reddy"
      schoolName="Class 7-B • Delhi Public School"
      pageTitle={`${getGreeting()}, Arjun! 👋`}
      pageSubtitle="Here's your learning progress today"
    >
      <div className="space-y-6">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {studentStats.map((stat, i) => (
            <StatCard key={stat.title} stat={stat} index={i} />
          ))}
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Charts */}
          <div className="lg:col-span-2 space-y-6">
            <GlassAreaChart
              data={performanceData}
              title="Performance Trend"
              subtitle="Your scores over the last 6 months"
              dataKey1="value"
              dataKey2="value2"
              label1="Your Score"
              label2="Class Average"
            />

            <GlassBarChart
              data={subjectPerformanceData}
              title="Subject-wise Performance"
              subtitle="Latest exam scores"
              color="#00d4aa"
            />
          </div>

          {/* Right: Quick AI Chat + Subjects */}
          <div className="space-y-6">
            {/* Quick AI Chat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-cyan flex items-center justify-center">
                    <Bot size={16} className="text-navy-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">AI Tutor</h3>
                    <span className="text-[10px] text-teal flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" /> Online
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/student/ai-tutor')}
                  className="text-[10px] text-teal hover:underline flex items-center gap-1"
                >
                  Open Full Chat <ChevronRight size={12} />
                </button>
              </div>

              {/* Recent chats */}
              <div className="space-y-2 mb-4">
                {recentAIChats.slice(0, 2).map((chat) => (
                  <div 
                    key={chat.id} 
                    onClick={() => router.push(`/student/ai-tutor?message=${encodeURIComponent(chat.topic)}`)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center text-cyan flex-shrink-0">
                      <MessageSquare size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{chat.topic}</p>
                      <p className="text-[10px] text-muted-foreground">{chat.subject} · {chat.time}</p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              {/* Quick input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="glass-input w-full pl-4 pr-20 py-2.5 text-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Mic size={14} /></button>
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Paperclip size={14} /></button>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/student/ai-tutor?message=${encodeURIComponent(aiInput)}`)}
                  className="glass-button px-3 py-2.5"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>

            {/* Exam Readiness */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-4">Exam Readiness</h3>
              <div className="grid grid-cols-3 gap-2">
                <RadialProgress value={87} label="Overall" color="#00d4aa" size={100} />
                <RadialProgress value={92} label="Math" color="#0ea5e9" size={100} />
                <RadialProgress value={72} label="Physics" color="#a78bfa" size={100} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Subjects + Assignments Row ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Subjects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card-static p-5 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">My Subjects</h3>
              <button 
                onClick={() => router.push('/student/subjects')}
                className="text-[10px] text-teal hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {studentSubjects.map((subject) => (
                <div 
                  key={subject.id} 
                  onClick={() => router.push('/student/subjects')}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${subject.color}15`, color: subject.color }}>
                    {subject.code.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium">{subject.name}</p>
                      <span className="text-xs font-bold" style={{ color: subject.color }}>{subject.grade}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${subject.progress}%`, background: subject.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Assignments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card-static p-5 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Recent Assignments</h3>
              <span className="badge-coral">3 pending</span>
            </div>
            <div className="space-y-2.5">
              {studentAssignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  onClick={() => router.push('/student/assignments')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${assignment.subjectColor}15` }}>
                    <FileText size={16} style={{ color: assignment.subjectColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{assignment.title}</p>
                    <p className="text-[10px] text-muted-foreground">{assignment.subject} · Due {assignment.dueDate}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                    assignment.status === "pending" && "bg-amber/15 text-amber",
                    assignment.status === "submitted" && "bg-cyan/15 text-cyan",
                    assignment.status === "graded" && "bg-teal/15 text-teal",
                    assignment.status === "overdue" && "bg-coral/15 text-coral",
                  )}>
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Leaderboard ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card-static p-5 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Flame size={16} className="text-amber" /> Class Leaderboard
            </h3>
            <button 
              onClick={() => router.push('/student/leaderboard')}
              className="text-[10px] text-teal hover:underline"
            >
              Full Rankings
            </button>
          </div>
          <div className="grid sm:grid-cols-5 gap-3">
            {leaderboard.map((entry, i) => (
              <div key={entry.rank} className={cn(
                "flex sm:flex-col items-center gap-3 sm:gap-2 p-3 rounded-xl text-center",
                i === 0 ? "bg-amber/10 border border-amber/20" : "bg-white/3"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                  i === 0 && "bg-gradient-to-br from-amber to-amber/60 text-navy-900",
                  i === 1 && "bg-gradient-to-br from-gray-300/30 to-gray-400/30 text-gray-200",
                  i === 2 && "bg-gradient-to-br from-amber/30 to-amber/10 text-amber",
                  i > 2 && "bg-white/10 text-muted-foreground",
                )}>
                  {entry.avatar}
                </div>
                <div>
                  <p className="text-xs font-medium">{entry.name}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.score.toLocaleString()} pts</p>
                </div>
                <span className={cn(
                  "text-lg font-bold sm:order-first",
                  i === 0 && "text-amber",
                  i > 0 && "text-muted-foreground",
                )}>
                  #{entry.rank}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
