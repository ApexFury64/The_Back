"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, BookOpen, Star, AlertTriangle, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import CustomDropdown from "@/components/ui/CustomDropdown";

export default function ChildProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStandard, setSelectedStandard] = useState<string>("8");
  
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
      <DashboardLayout role="parent" userName={userName || "Parent"} schoolName={schoolName || "AI Tutor"} pageTitle="Child Progress" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  const { studentSubjects = [], student } = data;

  const standards = ["All", ...Array.from(new Set<string>(studentSubjects.map((s: any) => s.standard || '8'))).sort((a: any, b: any) => b.toString().localeCompare(a.toString()))];
  const filteredSubjects = selectedStandard === "All" ? studentSubjects : studentSubjects.filter((s: any) => (s.standard || '8') === selectedStandard);

  return (
    <DashboardLayout
      role="parent"
      userName={userName || "Parent"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Subject Progress"
      pageSubtitle={`${student?.name || 'Student'} · Subject Mastery Overview`}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white">Detailed Progress</h2>
          <CustomDropdown 
            options={standards}
            value={selectedStandard}
            onChange={setSelectedStandard}
            labelPrefix="Standard"
            currentStandard="8"
          />
        </div>
        <div className="grid gap-6">
          {filteredSubjects.map((subject: any, i: number) => (
            <motion.div
              key={`${subject.id || 'subj'}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-static p-6 rounded-2xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Subject Header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${subject.color || '#fff'}15`, color: subject.color }}>
                    {(subject.code || subject.name || '').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{subject.standard ? `Class ${subject.standard} Syllabus` : 'General Syllabus'}</p>
                  </div>
                </div>

                {/* Subject Stats */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold" style={{ color: subject.color }}>{subject.score}%</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Target size={12}/> Average Score</span>
                  </div>
                  <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-foreground">{subject.progress}%</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen size={12}/> Syllabus Done</span>
                  </div>
                </div>

                {/* Action or Status */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  {subject.score >= 80 ? (
                    <div className="px-3 py-2 rounded-lg bg-teal/10 text-teal border border-teal/20 flex flex-col items-center justify-center">
                      <Star size={16} className="mb-1" />
                      <span className="text-xs font-medium">Excelling</span>
                    </div>
                  ) : subject.score < 60 ? (
                    <div className="px-3 py-2 rounded-lg bg-coral/10 text-coral border border-coral/20 flex flex-col items-center justify-center">
                      <AlertTriangle size={16} className="mb-1" />
                      <span className="text-xs font-medium">Needs Attention</span>
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-lg bg-amber/10 text-amber border border-amber/20 flex flex-col items-center justify-center">
                      <TrendingUp size={16} className="mb-1" />
                      <span className="text-xs font-medium">On Track</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Syllabus Completion</span>
                  <span className="font-medium">{subject.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${subject.score || subject.progress || 0}%`, backgroundColor: subject.color }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
