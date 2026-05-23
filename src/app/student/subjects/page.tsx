"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, PlayCircle, Trophy, Clock, FileText, X, ChevronRight, Lock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function StudentSubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSyllabus, setActiveSyllabus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/syllabus?userEmail=arjun@techwing.com')
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <DashboardLayout role="student" userName="Arjun Reddy" schoolName="Class 7-B" pageTitle="My Subjects" pageSubtitle="Loading...">
      <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role="student"
      userName="Arjun Reddy"
      schoolName="Class 7-B • Delhi Public School"
      pageTitle="My Subjects"
      pageSubtitle="Track your progress across all courses"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-card flex flex-col overflow-hidden relative group"
          >
            {/* Top Color Banner */}
            <div 
              className="h-2 w-full absolute top-0 left-0"
              style={{ backgroundColor: subject.color }}
            />
            
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4 mt-2">
                <div>
                  <h3 className="text-xl font-bold">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground">{subject.code} • 7th Standard</p>
                </div>
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{ backgroundColor: subject.color }}
                >
                  <BookOpen size={24} />
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-semibold">{subject.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Trophy size={14} />
                      <span className="text-xs">Current Grade</span>
                    </div>
                    <p className="text-xl font-bold" style={{ color: subject.color }}>{subject.grade}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock size={14} />
                      <span className="text-xs">Study Time</span>
                    </div>
                    <p className="text-xl font-bold">{Math.floor(subject.progress / 5)}h</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-white/5">
              <button 
                onClick={() => setActiveSyllabus(subject)}
                className="w-full text-navy-900 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ backgroundColor: subject.color }}
              >
                <BookOpen size={16} /> View Syllabus & Continue
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Syllabus Modal */}
      <AnimatePresence>
        {activeSyllabus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSyllabus(null)}
              className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between" style={{ borderTop: `4px solid ${activeSyllabus.color}` }}>
                <div>
                  <h3 className="text-xl font-bold">{activeSyllabus.name} Syllabus</h3>
                  <p className="text-sm text-muted-foreground">{activeSyllabus.progress}% Completed</p>
                </div>
                <button 
                  onClick={() => setActiveSyllabus(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
                {activeSyllabus.modules?.map((unit: any, i: number) => (
                  <div key={i} className="space-y-3">
                    {/* Unit Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">{unit.title}</h4>
                      <span className={cn(
                        "text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider",
                        unit.status === 'completed' && "bg-teal/20 text-teal",
                        unit.status === 'in-progress' && "bg-amber/20 text-amber",
                        unit.status === 'locked' && "bg-white/10 text-muted-foreground"
                      )}>
                        {unit.status}
                      </span>
                    </div>

                    {/* Subtopics List */}
                    <div className="space-y-2 pl-2 border-l-2 border-white/5">
                      {unit.subTopics?.map((topic: any, j: number) => (
                        <div key={j} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-colors",
                            topic.status === 'completed' ? "bg-teal text-navy-900" :
                            topic.status === 'in-progress' ? "bg-amber/20 text-amber" :
                            "bg-white/5 text-muted-foreground"
                          )}>
                            {j + 1}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <p className={cn(
                              "text-sm font-medium truncate transition-colors",
                              topic.status === 'locked' ? "text-muted-foreground opacity-50" : "text-foreground"
                            )}>
                              {topic.title}
                            </p>
                            {topic.status === 'completed' && (
                              <span className="px-1.5 py-0.5 bg-teal/20 text-teal text-[9px] uppercase tracking-wider font-bold rounded">
                                Done
                              </span>
                            )}
                          </div>
                          {topic.status === 'locked' ? (
                            <div className="text-white/20">
                              <Lock size={16} />
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setActiveSyllabus(null);
                                router.push(`/student/ai-tutor?subject=${activeSyllabus.name}&message=Let's study ${topic.title}`);
                              }}
                              className="text-muted-foreground hover:text-teal opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <PlayCircle size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-white/5 bg-white/5">
                <button 
                  onClick={() => {
                    setActiveSyllabus(null);
                    router.push(`/student/ai-tutor?subject=${activeSyllabus.name}`);
                  }}
                  className="w-full text-navy-900 font-bold py-3 rounded-xl transition-all hover:opacity-90"
                  style={{ backgroundColor: activeSyllabus.color }}
                >
                  Resume Course
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
