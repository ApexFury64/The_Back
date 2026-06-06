"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppStore } from "@/lib/store";
import { 
  User, Mail, ArrowLeft, BrainCircuit, Activity, 
  FileText, CheckCircle2, TrendingUp, TrendingDown,
  Calendar, Award
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  useEffect(() => {
    fetch(`/api/teacher/students/${id}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  if (loading || !data) return (
    <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"} pageTitle="Student Profile" pageSubtitle="Loading...">
      <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"} pageTitle="Student Profile" pageSubtitle={`Detailed view for ${data.name}`}>
      
      {/* Back Button */}
      <Link href="/teacher/classes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to My Classes
      </Link>

      {/* Header Profile Card */}
      <div className="glass-card-static p-6 rounded-3xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-3xl font-bold text-teal border border-teal/10 shrink-0">
            {data.name.split(" ").map((n: string) => n[0]).join("")}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{data.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User size={14} /> Class {data.className} • Section {data.sectionName}</span>
              <span className="flex items-center gap-1.5"><Mail size={14} /> {data.email}</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">ID: {data.rollNo}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            {data.metrics.issue !== "On track" ? (
              <div className="px-4 py-2 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm font-medium flex items-center gap-2 justify-center">
                <Activity size={16} /> Status: {data.metrics.issue}
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-teal/10 border border-teal/20 text-teal text-sm font-medium flex items-center gap-2 justify-center">
                <CheckCircle2 size={16} /> Status: On Track
              </div>
            )}
            <button className="glass-button px-4 py-2 text-sm flex items-center gap-2 justify-center">
              <Mail size={16} /> Message Student
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card-static p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground mb-1">Average Score</p>
          <div className="flex items-end gap-2">
            <p className={cn("text-2xl font-bold", data.metrics.avgScore >= 80 ? "text-teal" : data.metrics.avgScore >= 60 ? "text-amber" : "text-coral")}>
              {data.metrics.avgScore}%
            </p>
            {data.metrics.avgScore >= 60 ? <TrendingUp size={16} className="text-teal mb-1" /> : <TrendingDown size={16} className="text-coral mb-1" />}
          </div>
        </div>
        <div className="glass-card-static p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground mb-1">Attendance</p>
          <p className={cn("text-2xl font-bold", data.metrics.attendancePercent >= 85 ? "text-foreground" : "text-amber")}>
            {data.metrics.attendancePercent}%
          </p>
        </div>
        <div className="glass-card-static p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground mb-1">Assignments</p>
          <p className="text-2xl font-bold text-foreground">
            {data.metrics.assignmentsCompleted} <span className="text-sm text-muted-foreground font-normal">/ {data.metrics.totalAssignments}</span>
          </p>
        </div>
        <div className="glass-card-static p-4 rounded-2xl">
          <p className="text-xs text-muted-foreground mb-1">Total Quizzes</p>
          <p className="text-2xl font-bold text-foreground">{data.quizzes.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 mb-6 overflow-x-auto pb-2">
        {["overview", "performance", "assignments", "quizzes"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors whitespace-nowrap",
              activeTab === tab 
                ? "bg-white/10 text-foreground border-b-2 border-teal" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                  <BrainCircuit size={20} />
                </div>
                <h3 className="text-lg font-bold">AI Assessment & Insights</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {data.metrics.aiInsight}
              </p>
            </div>

            {/* Parent & Guardian Contact Information */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-teal">
                <User size={18} /> Parent & Guardian Contact Details
              </h3>
              {data.parent ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs text-muted-foreground block mb-1">Parent Name</span>
                    <span className="font-semibold text-white">{data.parent.name}</span>
                  </div>
                  <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs text-muted-foreground block mb-1">Parent Email</span>
                    <span className="font-medium text-slate-200 font-mono truncate block">{data.parent.email}</span>
                  </div>
                  <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs text-muted-foreground block mb-1">Parent Phone</span>
                    <span className="font-medium text-slate-200 font-mono">{data.parent.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No parent account has been linked to this student.</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card-static p-6 rounded-2xl">
                <h4 className="font-semibold mb-4 flex items-center gap-2"><Award size={18} className="text-teal"/> Recent Strengths</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-teal mt-0.5">•</span> Consistently turns in assignments on time.</li>
                  <li className="flex items-start gap-2"><span className="text-teal mt-0.5">•</span> Shows strong aptitude in mathematical reasoning quizzes.</li>
                </ul>
              </div>
              <div className="glass-card-static p-6 rounded-2xl">
                <h4 className="font-semibold mb-4 flex items-center gap-2"><TrendingDown size={18} className="text-amber"/> Areas for Improvement</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-amber mt-0.5">•</span> Science quiz scores have dipped slightly this week.</li>
                  <li className="flex items-start gap-2"><span className="text-amber mt-0.5">•</span> Participation in optional study modules is low.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === "performance" && (
          <div className="glass-card-static p-8 rounded-2xl flex flex-col items-center justify-center text-center text-muted-foreground h-64">
            <Activity size={48} className="mb-4 opacity-20" />
            <p>Performance charts are generated here based on historical quiz data.</p>
            <p className="text-xs mt-2">Integrate Recharts or Chart.js for visualization.</p>
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === "assignments" && (
          <div className="glass-card-static rounded-2xl overflow-hidden">
            {data.assignments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No assignments recorded.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Subject</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Submitted At</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assignments.map((a: any) => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" /> {a.title}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{a.subject}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(a.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full border",
                          a.status === 'graded' || a.status === 'submitted' ? "bg-teal/10 text-teal border-teal/20" : "bg-amber/10 text-amber border-amber/20"
                        )}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* QUIZZES TAB */}
        {activeTab === "quizzes" && (
          <div className="glass-card-static rounded-2xl overflow-hidden">
            {data.quizzes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No quizzes taken yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Quiz Title</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Subject</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date Taken</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.quizzes.map((q: any) => (
                    <tr key={q.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium">{q.quizTitle}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{q.subject}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} /> {new Date(q.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "font-bold",
                          q.score >= 80 ? "text-teal" : q.score >= 60 ? "text-amber" : "text-coral"
                        )}>
                          {q.score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
