"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, PlayCircle, Trophy, Clock, ArrowLeft, LayoutGrid, Lock, Sparkles, Target, Activity, Flame, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import CustomDropdown from "@/components/ui/CustomDropdown";
import AILabPanel from "@/components/subjects/AILabPanel";

const getContrastColor = (color: string) => {
  const map: Record<string, string> = {
    '#0ea5e9': '#0284c7', // Mathematics: Sky 700 / 0284c7
    '#00d4aa': '#0f766e', // Science: Teal 700
    '#a78bfa': '#6d28d9', // English: Violet 700
    '#f59e0b': '#b45309', // History: Amber 800
    '#f97066': '#be123c', // Geography: Rose 700
    '#38bdf8': '#0284c7', // Computer Science: Sky 700
  };
  return map[color.trim().toLowerCase()] || color;
};

export default function StudentSubjectsPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "syllabus" | "quizzes">("syllabus");
  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userStandard = useAppStore(s => s.userStandard);

  const [selectedStandard, setSelectedStandard] = useState<string>(userStandard || "8");

  const { data: subjects = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ['studentSubjects', userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/syllabus`);
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 10000,
  });

  const { data: allQuizzes = [], isLoading: quizzesLoading } = useQuery<any[]>({
    queryKey: ['studentQuizzes', userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes`);
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 10000,
  });

  if (loading) return (
    <DashboardLayout role="student" userName={userName || "Student"} schoolName={schoolName || "AI Tutor"} pageTitle="My Subjects" pageSubtitle="Loading...">
      <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
    </DashboardLayout>
  );

  const standards = ["All", ...Array.from(new Set(subjects.map(s => s.standard || 'Other'))).sort((a: any, b: any) => b.toString().localeCompare(a.toString()))];
  const filteredSubjects = selectedStandard === "All" ? subjects : subjects.filter(s => (s.standard || 'Other') === selectedStandard);

  return (
    <DashboardLayout
      role="student"
      userName={userName || "Student"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="My Subjects"
      pageSubtitle={selectedSubject ? `${selectedSubject.name} • Class ${selectedSubject.standard}` : "Track your progress across all courses"}
    >
      {subjects.length === 0 ? (
        <div className="glass-card-static p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-4 mt-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground">
            <BookOpen size={32} />
          </div>
          <h2 className="text-xl font-bold">No Subjects Assigned</h2>
          <p className="text-muted-foreground max-w-md">
            You haven't been assigned to any classes or subjects yet. Please contact your school administrator or class teacher to get your curriculum set up.
          </p>
        </div>
      ) : selectedSubject ? (
        // Detail View Mode
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum Explorer
          </button>
          
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
            {/* Left Side: Subject Details & Subsections */}
            <div className="lg:col-span-2 flex flex-col h-full space-y-4">
              
              {/* Subject Header Card */}
              <div className="glass-card-static p-6 rounded-2xl shrink-0 border-t-4" style={{ borderTopColor: selectedSubject.color }}>
                <div className="flex items-center gap-6">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-black/5 dark:border-white/10 text-[var(--subj-hdr-icon-light)] dark:text-[var(--subj-hdr-icon-dark)]" 
                    style={{ 
                      backgroundColor: `${selectedSubject.color}15`,
                      '--subj-hdr-icon-light': getContrastColor(selectedSubject.color),
                      '--subj-hdr-icon-dark': selectedSubject.color
                    } as any}
                  >
                    <BookOpen size={36} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-1">{selectedSubject.name}</h2>
                    <p className="text-navy-900/70 dark:text-muted-foreground mb-4">Class {selectedSubject.standard} • {selectedSubject.code}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-teal-800 dark:text-teal" />
                        <span className="text-navy-900 dark:text-white font-medium">{selectedSubject.progress}% Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-amber-800 dark:text-amber" />
                        <span className="text-navy-900 dark:text-white font-medium">Grade: {selectedSubject.grade}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-sections Navigation */}
              <div className="flex items-center gap-1.5 p-1.5 bg-black/5 dark:bg-white/5 rounded-xl shrink-0 overflow-x-auto no-scrollbar border border-black/5 dark:border-white/5 backdrop-blur-md">
                {[
                  { id: 'overview', label: 'Overview', icon: <LayoutGrid size={16} /> },
                  { id: 'syllabus', label: 'Syllabus', icon: <BookOpen size={16} /> },
                  { id: 'quizzes', label: 'Quizzes', icon: <Target size={16} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap relative overflow-hidden",
                      activeTab === tab.id 
                        ? "bg-white dark:bg-navy-900 text-teal-700 dark:text-teal shadow-sm border border-black/5 dark:border-white/5" 
                        : "text-muted-foreground hover:text-navy-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">{tab.icon} {tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-teal/10 to-transparent dark:from-teal/20" />
                    )}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="glass-card-static rounded-2xl p-6 flex-1 overflow-y-auto no-scrollbar relative">
                
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <LayoutGrid className="text-teal-800 dark:text-teal" size={20} /> Subject Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-black/5 dark:from-navy-800 dark:to-navy-900 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Clock size={48} />
                        </div>
                        <p className="text-sm text-navy-900/70 dark:text-muted-foreground mb-2 font-medium">Total Study Time</p>
                        <p className="text-3xl font-bold text-navy-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-navy-900 to-navy-500 dark:from-white dark:to-white/70">
                          {Math.floor(selectedSubject.progress / 5)}h 30m
                        </p>
                      </div>
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-black/5 dark:from-navy-800 dark:to-navy-900 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <BookOpen size={48} />
                        </div>
                        <p className="text-sm text-navy-900/70 dark:text-muted-foreground mb-2 font-medium">Modules Completed</p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-bold text-navy-900 dark:text-white">
                            {selectedSubject.modules?.filter((m: any) => m.status === 'completed').length || 0}
                          </p>
                          <p className="text-lg font-medium text-navy-900/60 dark:text-muted-foreground mb-1">
                            / {selectedSubject.modules?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden bg-gradient-to-br from-teal/10 to-cyan/10 border border-teal/20 p-6 rounded-2xl shadow-sm">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal/20 rounded-full blur-3xl animate-pulse-soft" />
                      <h4 className="font-bold text-teal-800 dark:text-teal flex items-center gap-2 mb-3 text-base">
                        <div className="p-1.5 bg-teal/10 dark:bg-teal/20 rounded-md">
                          <Sparkles size={16} className="text-teal-800 dark:text-teal" />
                        </div>
                        AI Tutor Recommendation
                      </h4>
                      <p className="text-sm text-navy-800/80 dark:text-teal-50/80 leading-relaxed font-medium max-w-2xl">
                        You are doing great in <span className="text-teal-800 dark:text-teal font-bold">{selectedSubject.name}</span>. To improve your grade from <span className="px-1.5 py-0.5 bg-teal/10 dark:bg-teal/20 text-teal-800 dark:text-teal rounded text-xs font-bold">{selectedSubject.grade}</span> to <span className="px-1.5 py-0.5 bg-teal/10 dark:bg-teal/20 text-teal-800 dark:text-teal rounded text-xs font-bold">A+</span>, focus on reviewing the practice problems in your upcoming modules.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'syllabus' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-gradient-to-b before:from-teal before:via-black/10 dark:before:via-white/10 before:to-transparent">
                    {selectedSubject.modules?.map((unit: any, i: number) => (
                      <div key={i} className="relative pl-12 space-y-4 group/unit">
                        {/* Timeline Node */}
                        <div className="absolute left-0 top-1 w-10 h-10 bg-white dark:bg-navy-900 rounded-full border-4 border-white dark:border-navy-900 shadow-sm flex items-center justify-center z-10 ring-1 ring-black/5 dark:ring-white/5">
                          <div className={cn(
                            "w-full h-full rounded-full transition-all duration-500",
                            unit.status === 'completed' ? "bg-teal shadow-[0_0_10px_rgba(0,201,167,0.5)]" :
                            unit.status === 'in-progress' ? "bg-amber shadow-[0_0_10px_rgba(255,192,120,0.5)]" :
                            "bg-black/10 dark:bg-white/10"
                          )} />
                        </div>

                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-lg text-navy-900 dark:text-white group-hover/unit:text-teal-800 dark:group-hover/unit:text-teal transition-colors">{unit.title}</h4>
                          <span className={cn(
                            "text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm",
                            unit.status === 'completed' && "bg-teal/10 text-teal-800 dark:text-teal border border-teal/20",
                            unit.status === 'in-progress' && "bg-amber/10 text-amber-800 dark:text-amber border border-amber/20",
                            unit.status === 'locked' && "bg-black/5 dark:bg-white/5 text-muted-foreground border border-black/10 dark:border-white/10"
                          )}>
                            {unit.status}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {unit.subTopics?.map((topic: any, j: number) => (
                            <button 
                              key={j} 
                              onClick={() => {
                                if (topic.status !== 'locked') {
                                  router.push(`/student/ai-tutor?subject=${selectedSubject.name}&message=Let's study ${topic.title}`);
                                }
                              }}
                              className="w-full text-left flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-navy-900 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 group shadow-sm hover:shadow-md border border-black/5 dark:border-white/5 hover:border-teal/30 transform hover:-translate-y-0.5"
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all duration-300",
                                topic.status === 'completed' ? "bg-teal/10 text-teal-800 dark:text-teal" :
                                topic.status === 'in-progress' ? "bg-amber/15 text-amber-800 dark:text-amber" :
                                "bg-black/5 dark:bg-white/5 text-muted-foreground"
                              )}>
                                {topic.status === 'completed' ? <Sparkles size={18} /> : (j + 1)}
                              </div>
                              <div className="flex-1 min-w-0 flex items-center gap-3">
                                <p className={cn(
                                  "text-sm font-semibold truncate transition-colors",
                                  topic.status === 'locked' ? "text-muted-foreground" : "text-navy-900 dark:text-white"
                                )}>
                                  {topic.title}
                                </p>
                                {topic.status === 'completed' && (
                                  <span className="px-2 py-0.5 bg-teal/10 text-teal-800 dark:text-teal text-[9px] uppercase tracking-wider font-bold rounded border border-teal/20">
                                    Done
                                  </span>
                                )}
                              </div>
                              {topic.status === 'locked' ? (
                                <div className="text-navy-900/40 dark:text-white/40 px-3 bg-black/5 dark:bg-white/5 rounded-lg py-2">
                                  <Lock size={16} />
                                </div>
                              ) : (
                                <div className="text-teal-800 dark:text-teal opacity-0 group-hover:opacity-100 transition-all duration-300 px-3 py-1.5 bg-teal/10 rounded-lg flex items-center gap-2 text-xs font-bold transform translate-x-4 group-hover:translate-x-0">
                                  Study <ChevronRight size={16} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'quizzes' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-navy-900 dark:text-white flex items-center gap-2">
                        <Target className="text-teal-800 dark:text-teal" size={20} /> Topic Assessments
                      </h3>
                      <span className="px-3 py-1 bg-black/5 dark:bg-white/5 text-xs font-bold rounded-lg text-navy-900/70 dark:text-muted-foreground">
                        {allQuizzes.filter(q => q.subject.name === selectedSubject.name && q.class === selectedSubject.standard).length} Quizzes Available
                      </span>
                    </div>

                    {allQuizzes.filter(q => q.subject.name === selectedSubject.name && q.class === selectedSubject.standard).length > 0 ? (
                      <div className="grid gap-4">
                        {allQuizzes
                          .filter(q => q.subject.name === selectedSubject.name && q.class === selectedSubject.standard)
                          .map((quiz, i) => (
                          <div key={i} className="p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-navy-900 flex items-center justify-between group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full blur-3xl group-hover:bg-teal/10 transition-colors" />
                            
                            <div className="flex items-center gap-5 relative z-10">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal/20 to-cyan/20 text-teal-800 dark:text-teal flex items-center justify-center flex-shrink-0 shadow-sm border border-teal/10">
                                <Target size={24} />
                              </div>
                              <div>
                                <h4 className="font-bold text-navy-900 dark:text-white text-base group-hover:text-teal-800 dark:group-hover:text-teal transition-colors">{quiz.title}</h4>
                                <div className="flex items-center gap-3 text-xs font-medium mt-2">
                                  <span className="flex items-center gap-1.5 text-navy-900/70 dark:text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md">
                                    <LayoutGrid size={12} /> {quiz._count?.questions || 5} Questions
                                  </span>
                                  <span className="flex items-center gap-1.5 text-navy-900/70 dark:text-muted-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md">
                                    <Clock size={12} /> {quiz.timeLimit || 15} mins
                                  </span>
                                  <span className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md",
                                    quiz.difficulty === 'Hard' ? 'bg-red-50 dark:bg-coral/10 text-red-700 dark:text-coral' : 'bg-amber-50 dark:bg-amber/10 text-amber-800 dark:text-amber'
                                  )}>
                                    <Flame size={12} /> {quiz.difficulty || 'Medium'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => router.push('/student/quizzes')}
                              className="px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-bold shadow-[0_4px_14px_0_rgba(0,201,167,0.39)] hover:shadow-[0_6px_20px_rgba(0,201,167,0.23)] hover:bg-teal/90 transition-all transform group-hover:scale-105 active:scale-95 relative z-10"
                            >
                              Take Quiz
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center space-y-5 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-navy-900 flex items-center justify-center shadow-sm">
                          <Target size={40} className="text-navy-900/20 dark:text-white/20" />
                        </div>
                        <div>
                          <p className="font-bold text-navy-900 dark:text-white text-lg">No Quizzes Available</p>
                          <p className="text-muted-foreground text-sm mt-1">Check back later for new topic assessments.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Right Side: AI Lab Panel */}
            <div className="lg:col-span-1 h-full">
              <AILabPanel subject={selectedSubject} />
            </div>
          </div>
        </div>
      ) : (
        // Grid View Mode
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">Curriculum Explorer</h2>
            <CustomDropdown 
              options={standards}
              value={selectedStandard}
              onChange={setSelectedStandard}
              labelPrefix="Standard"
              currentStandard={userStandard || "8"}
            />
          </div>

          <div className="space-y-12">
            {Object.entries(
              filteredSubjects.reduce((acc, subject) => {
                const std = subject.standard || 'Other';
                if (!acc[std]) acc[std] = [];
                acc[std].push(subject);
                return acc;
              }, {} as Record<string, any[]>)
            ).sort((a, b) => b[0].localeCompare(a[0]))
          .map((entry: any) => {
            const standard = entry[0];
            const stdSubjects = entry[1];
            return (
            <div key={standard} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                <h2 className="text-xl font-bold gradient-text">{standard}{standard !== 'Other' && 'th Standard'}</h2>
                <span className="px-2 py-1 bg-white/5 rounded-full text-xs text-muted-foreground">{stdSubjects.length} Subjects</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stdSubjects.map((subject: any, index: number) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setSelectedSubject(subject)}
                    className="glass-card flex flex-col overflow-hidden relative group cursor-pointer hover:shadow-xl transition-all"
                  >
                    {/* Top Color Banner */}
                    <div 
                      className="h-2 w-full absolute top-0 left-0 transition-transform group-hover:scale-y-150"
                      style={{ backgroundColor: subject.color }}
                    />
                    
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4 mt-2">
                        <div>
                          <h3 className="text-xl font-bold group-hover:text-teal-800 dark:group-hover:text-teal transition-colors">{subject.name}</h3>
                          <p className="text-sm text-navy-900/70 dark:text-muted-foreground">{subject.code} • {subject.standard}th Standard</p>
                        </div>
                        {/* Larger Icon */}
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 border border-black/5 dark:border-white/10 text-[var(--subject-icon-color-light)] dark:text-[var(--subject-icon-color-dark)]"
                          style={{ 
                            backgroundColor: `${subject.color}15`,
                            '--subject-icon-color-light': getContrastColor(subject.color),
                            '--subject-icon-color-dark': subject.color
                          } as any}
                        >
                          <BookOpen size={32} />
                        </div>
                      </div>
                      
                      <div className="space-y-4 mb-2">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-navy-900/70 dark:text-muted-foreground">Course Progress</span>
                            <span className="font-semibold text-navy-900 dark:text-white">{subject.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/5 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">
                            <div className="flex items-center gap-2 text-navy-900/50 dark:text-muted-foreground mb-1">
                              <Trophy size={14} className="text-navy-900/60 dark:text-muted-foreground" />
                              <span className="text-xs text-navy-900/70 dark:text-muted-foreground">Current Grade</span>
                            </div>
                            <p 
                              className="text-xl font-bold text-[var(--subj-grade-light)] dark:text-[var(--subj-grade-dark)]" 
                              style={{ 
                                '--subj-grade-light': getContrastColor(subject.color), 
                                '--subj-grade-dark': subject.color 
                              } as React.CSSProperties}
                            >
                              {subject.grade}
                            </p>
                          </div>
                          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/5 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">
                            <div className="flex items-center gap-2 text-navy-900/50 dark:text-muted-foreground mb-1">
                              <Clock size={14} className="text-navy-900/60 dark:text-muted-foreground" />
                              <span className="text-xs text-navy-900/70 dark:text-muted-foreground">Study Time</span>
                            </div>
                            <p className="text-xl font-bold text-navy-900 dark:text-white">{Math.floor(subject.progress / 5)}h</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
          })}
        </div>
        </>
      )}
    </DashboardLayout>
  );
}
