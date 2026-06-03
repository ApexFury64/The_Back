"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Download, MoreHorizontal, Filter, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function AdminStudentsPage() {
  const userName = useAppStore((s) => s.userName);
  const schoolName = useAppStore((s) => s.schoolName);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/admin/students')
      .then(res => res.json())
      .then(d => {
        if (d.classes) {
          setClasses(d.classes);
          // Expand first class by default
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

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={userName || "Loading..."} schoolName={schoolName || "Loading..."} pageTitle="Student Directory" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="admin"
      userName={userName || "Admin"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Student Directory"
      pageSubtitle="Manage and monitor all enrolled students by class"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name..." 
            className="glass-input pl-10 pr-4 py-2 w-full text-sm" 
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="glass-button-secondary px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
            <Filter size={16} /> Filters
          </button>
          <button className="glass-button-secondary px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
            <Download size={16} /> Export
          </button>
          <button className="glass-button px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {classes.length === 0 ? (
          <div className="glass-card-static p-12 text-center text-muted-foreground rounded-2xl">
            No classes found for this school.
          </div>
        ) : (
          classes.map((cls) => {
            const isExpanded = !!expandedClasses[cls.id];
            
            // Filter students inside this class based on search query
            const filteredSections = cls.sections.map((sec: any) => ({
              ...sec,
              students: sec.students.filter((s: any) => 
                s.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            })).filter((sec: any) => sec.students.length > 0);

            // If search query is active and no students match in this class, hide the class
            if (searchQuery && filteredSections.length === 0) return null;
            
            const totalStudents = cls.sections.reduce((sum: number, sec: any) => sum + sec.students.length, 0);
            const displaySections = searchQuery ? filteredSections : cls.sections;

            return (
              <div key={cls.id} className="glass-card-static rounded-2xl overflow-hidden transition-all duration-300">
                {/* Accordion Header */}
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

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-4 border-t border-white/5 space-y-6">
                    {displaySections.map((sec: any) => (
                      <div key={sec.id} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                          <h4 className="font-semibold text-teal">Section {sec.name}</h4>
                          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground">{sec.students.length} students</span>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-white/5">
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3 rounded-tl-lg">Student Name</th>
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3">Student ID</th>
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3">Avg Grade</th>
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3">Attendance</th>
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3">AI Usage</th>
                                <th className="text-xs text-muted-foreground font-medium text-right py-2 px-3 rounded-tr-lg">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sec.students.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="py-4 text-center text-sm text-muted-foreground">No students matched the search in this section.</td>
                                </tr>
                              ) : (
                                sec.students.map((student: any) => (
                                  <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-[10px] font-bold text-teal">
                                          {student.name.split(" ").map((n: string) => n[0]).join("")}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">{student.name}</p>
                                          <p className="text-[10px] text-muted-foreground">Enrolled: {student.enrollmentYear}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-sm font-mono text-muted-foreground">
                                      STU-{student.id.substring(0, 5).toUpperCase()}
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className={cn("text-sm font-bold", student.avgScore >= 80 ? "text-teal" : student.avgScore >= 60 ? "text-amber" : "text-coral")}>
                                        {student.avgScore}%
                                      </span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                          <div className={cn("h-full", student.attendancePercent >= 85 ? "bg-teal" : "bg-amber")} style={{ width: `${student.attendancePercent}%` }} />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{student.attendancePercent}%</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className={cn(
                                        "text-xs font-medium px-2 py-1 rounded-md",
                                        student.aiUsage === "High" ? "bg-cyan/15 text-cyan" : student.aiUsage === "Medium" ? "bg-amber/15 text-amber" : "bg-white/10 text-muted-foreground"
                                      )}>
                                        {student.aiUsage}
                                      </span>
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
