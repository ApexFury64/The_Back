"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Filter, MoreHorizontal, TrendingDown, TrendingUp, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function TeacherClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  
  const [statusFilter, setStatusFilter] = useState("All");
  
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  useEffect(() => {
    fetch(`/api/teacher/students`)
      .then(res => res.json())
      .then(d => {
        if (d.classes) {
          setClasses(d.classes);
          if (d.classes.length > 0) {
            setExpandedClasses({ [d.classes[0].id]: true });
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleClass = (classId: string) => {
    setExpandedClasses(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  if (loading) return (
    <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"} pageTitle="My Classes" pageSubtitle="Loading...">
      <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"} pageTitle="My Classes" pageSubtitle="Monitor individual student performance and mastery across your classes">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..." 
            className="glass-input pl-10 pr-4 py-2 w-full text-sm" 
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-muted-foreground flex-shrink-0" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input px-3 py-2 text-sm bg-white dark:bg-navy-950 text-teal border-black/10 dark:border-white/10 rounded-xl"
          >
            <option value="All" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">All Statuses</option>
            <option value="On track" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">On track</option>
            <option value="Low score" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Low score</option>
            <option value="Low attendance" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Low attendance</option>
            <option value="Needs Help" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Needs Attention (Low score/attendance)</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {classes.length === 0 ? (
          <div className="glass-card-static p-12 text-center text-muted-foreground rounded-2xl">
            No classes assigned.
          </div>
        ) : (
          classes.map((cls) => {
            const isExpanded = !!expandedClasses[cls.id];
            
            const filteredSections = cls.sections.map((sec: any) => {
              const matchedStudents = sec.students.filter((s: any) => {
                const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
                
                let matchesStatus = true;
                if (statusFilter === "On track") {
                  matchesStatus = s.issue === "On track";
                } else if (statusFilter === "Low score") {
                  matchesStatus = s.issue === "Low score";
                } else if (statusFilter === "Low attendance") {
                  matchesStatus = s.issue === "Low attendance";
                } else if (statusFilter === "Needs Help") {
                  matchesStatus = s.issue !== "On track";
                }
                
                return matchesSearch && matchesStatus;
              });
              
              return {
                ...sec,
                students: matchedStudents
              };
            }).filter((sec: any) => sec.students.length > 0);

            const hasActiveFilter = searchQuery !== "" || statusFilter !== "All";

            if (hasActiveFilter && filteredSections.length === 0) return null;
            
            const totalStudents = cls.sections.reduce((sum: number, sec: any) => sum + sec.students.length, 0);
            const displaySections = hasActiveFilter ? filteredSections : cls.sections;

            return (
              <div key={cls.id} className="glass-card-static rounded-2xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => toggleClass(cls.id)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal/20 text-teal flex items-center justify-center">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{cls.name}</h3>
                      <p className="text-xs text-muted-foreground">{cls.sections.length} Sections • {totalStudents} Students</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-black/20 text-muted-foreground">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-white/5 space-y-6">
                    {displaySections.map((sec: any) => (
                      <div key={sec.id} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                          <h4 className="font-semibold text-teal">Section {sec.name}</h4>
                          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground">{sec.students.length} students</span>
                          {sec.isClassTeacher && (
                            <span className="text-[10px] bg-cyan/20 text-cyan px-2 py-0.5 rounded-full ml-2 border border-cyan/30">Class Teacher</span>
                          )}
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-white/5">
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3 rounded-tl-lg">Student Name</th>
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3">Average Score</th>
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3">Attendance</th>
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3">Status / Notes</th>
                                <th className="text-xs text-muted-foreground font-medium text-right py-2 px-3 rounded-tr-lg">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sec.students.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="py-4 text-center text-sm text-muted-foreground">No students matched.</td>
                                </tr>
                              ) : (
                                sec.students.map((student: any) => (
                                  <tr 
                                    key={student.id} 
                                    onClick={() => router.push(`/teacher/students/${student.id}`)}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                  >
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-[10px] font-bold text-teal">
                                          {student.name.split(" ").map((n: string) => n[0]).join("")}
                                        </div>
                                        <span className="text-sm font-medium">{student.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2">
                                        <span className={cn(
                                          "text-sm font-bold",
                                          student.avgScore >= 80 ? "text-teal" : student.avgScore >= 60 ? "text-amber" : "text-coral"
                                        )}>{student.avgScore}%</span>
                                        {student.trend.includes("+") ? 
                                          <TrendingUp size={14} className="text-teal" /> : 
                                          <TrendingDown size={14} className="text-coral" />
                                        }
                                      </div>
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                          <div className={cn("h-full", student.attendancePercent >= 85 ? "bg-teal" : "bg-amber")} style={{ width: `${student.attendancePercent}%` }} />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{student.attendancePercent}%</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-xs text-muted-foreground">
                                      {student.issue !== "On track" ? (
                                        <span className="text-coral bg-coral/10 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                          {student.issue}
                                        </span>
                                      ) : (
                                        <span className="text-teal bg-teal/10 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                          On track
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors inline-block">
                                        <MoreHorizontal size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
