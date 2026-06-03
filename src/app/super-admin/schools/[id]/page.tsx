"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppStore } from "@/lib/store";
import { ArrowLeft, BookOpen, Users, UserCheck, GraduationCap, Building2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SuperAdminSchoolDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "classes">("overview");
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const userName = useAppStore(s => s.userName);
  const appSchoolName = useAppStore(s => s.schoolName);

  useEffect(() => {
    if (id) {
      fetch(`/api/super-admin/schools/${id}`)
        .then(res => res.json())
        .then(d => setData(d))
        .catch(console.error);
    }
  }, [id]);

  if (!data || data.error) {
    return (
      <DashboardLayout role="super-admin" userName={userName || "Admin"} schoolName={appSchoolName || "Platform"} pageTitle="School Details" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  const { schoolData, teachers, classes, subjects, students } = data;

  return (
    <DashboardLayout 
      role="super-admin" 
      userName={userName || "Admin"} 
      schoolName={appSchoolName || "Platform"} 
      pageTitle={schoolData.name} 
      pageSubtitle={`Detailed view for school ID: ${id}`}
    >
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="glass-button-secondary p-2 flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Schools
        </button>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 overflow-x-auto max-w-full">
          {[
            { id: "overview", label: "Overview", icon: Building2 },
            { id: "classes", label: "Classes Curriculum", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-teal/20 text-teal shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card-static p-6 rounded-2xl min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">School Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1">Total Students</p>
                <p className="text-2xl font-mono text-teal">{schoolData.studentsCount.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1">Total Teachers</p>
                <p className="text-2xl font-mono text-purple">{schoolData.teachersCount.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1">Total Classes</p>
                <p className="text-2xl font-mono text-blue-400">{classes.length}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1">Total Sections</p>
                <p className="text-2xl font-mono text-indigo-400">{classes.reduce((acc: number, c: any) => acc + (c.sections?.length || 0), 0)}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1">Subscription Plan</p>
                <p className="text-2xl font-semibold text-cyan">{schoolData.plan}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-muted-foreground mb-1">AI Adoption</p>
                <p className="text-2xl font-mono text-pink-400">{schoolData.aiUsage}%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "classes" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Classes Curriculum & Directory</h2>
            {classes.map((c: any) => {
              const isExpanded = expandedClass === c.id;
              const classNumberMatch = c.name.match(/\d+/);
              const classNum = classNumberMatch ? classNumberMatch[0] : "";
              
              const classTeachers = teachers.filter((t: any) => t.classes.includes(c.name));
              const classStudents = students.filter((s: any) => s.grade === c.name || s.grade.includes(classNum));
              const classSubjects = subjects.filter((sub: any) => sub.classes.includes(classNum));

              return (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                    onClick={() => setExpandedClass(isExpanded ? null : c.id)}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-teal">{c.name}</h3>
                      <p className="text-sm text-muted-foreground">Sections: {c.sections.join(", ")} | Total Students: {classStudents.length}</p>
                    </div>
                    <div className="text-muted-foreground">
                      {isExpanded ? "▲ Hide Details" : "▼ View Details"}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4 border-t border-white/10 bg-slate-900/60 space-y-6">
                      
                      {/* Subjects */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><BookOpen size={14} className="text-pink-400"/> Subjects Taught</h4>
                        <div className="flex flex-wrap gap-2">
                          {classSubjects.map((sub: any) => (
                            <span key={sub.id} className="px-3 py-1.5 text-xs font-medium rounded-md bg-white/10 text-slate-100 border border-white/10 shadow-sm">{sub.name}</span>
                          ))}
                          {classSubjects.length === 0 && <span className="text-xs text-slate-400">No subjects found</span>}
                        </div>
                      </div>

                      {/* Teachers */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><UserCheck size={14} className="text-cyan"/> Assigned Teachers</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {classTeachers.map((t: any) => (
                            <div key={t.id} className="p-3 bg-white/10 rounded-lg border border-white/10 shadow-sm">
                              <p className="font-semibold text-sm text-slate-100">{t.name}</p>
                              <p className="text-xs text-teal mt-0.5">{t.subject || "General"}</p>
                              <p className="text-xs text-slate-400 mt-1 truncate">{t.email}</p>
                            </div>
                          ))}
                          {classTeachers.length === 0 && <p className="text-xs text-slate-400">No teachers explicitly assigned to {c.name}</p>}
                        </div>
                      </div>

                      {/* Students */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><GraduationCap size={14} className="text-purple"/> Enrolled Students</h4>
                        <div className="overflow-x-auto rounded-lg border border-white/10 bg-slate-800/40">
                          <table className="w-full text-sm">
                            <thead className="bg-white/10">
                              <tr className="text-left text-slate-200 text-xs">
                                <th className="py-3 px-4 font-semibold">Name</th>
                                <th className="py-3 px-4 font-semibold">Section</th>
                                <th className="py-3 px-4 text-right font-semibold">Attendance</th>
                                <th className="py-3 px-4 text-right font-semibold">Performance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {classStudents.map((stu: any) => (
                                <tr key={stu.id} className="hover:bg-white/5 transition-colors">
                                  <td className="py-3 px-4 font-medium text-slate-200">{stu.name}</td>
                                  <td className="py-3 px-4 text-slate-300">{stu.section}</td>
                                  <td className="py-3 px-4 text-right font-mono text-cyan">{stu.attendance}%</td>
                                  <td className="py-3 px-4 text-right font-mono text-purple">{stu.performance}%</td>
                                </tr>
                              ))}
                              {classStudents.length === 0 && (
                                <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-sm">No students found for this class</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
