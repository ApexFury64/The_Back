"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Users, BookOpen, UserPlus, BookCopy, ChevronDown, Check, Trash2, Filter, Edit, School } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import AcademicNavigationTabs from "@/components/ui/AcademicNavigationTabs";
import { cn } from "@/lib/utils";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", grade: "", sections: "A,B,C" });
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({ sectionId: "", teacherId: "", sectionName: "", className: "" });

  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", standard: "", code: "", color: "#0ea5e9" });

  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState({ id: "", name: "", standard: "", code: "", color: "#0ea5e9" });

  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [addStudentsData, setAddStudentsData] = useState({ sectionId: "", sectionName: "", className: "", selectedStudentIds: [] as string[] });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("All");

  const userName = useAppStore(s => s.userName);
  const userEmail = useAppStore(s => s.userEmail);
  const schoolName = useAppStore(s => s.schoolName);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, subjectsRes, studentsRes] = await Promise.all([
        fetch(`/api/admin/classes?adminEmail=${userEmail || 'admin@dps-hyd.edu'}`),
        fetch(`/api/admin/teachers`),
        fetch(`/api/admin/subjects`),
        fetch(`/api/admin/students`)
      ]);
      const classesData = await classesRes.json();
      const teachersData = await teachersRes.json();
      const subjectsData = await subjectsRes.json();
      const studentsData = await studentsRes.json();
      
      if (classesData.classes) {
        setClasses(classesData.classes);
        // Set first section active if none is active
        const allSecs = classesData.classes.flatMap((c: any) => c.sections);
        if (allSecs.length > 0) {
          setActiveSectionId(prev => prev || allSecs[0].id);
        }
      }
      if (teachersData.teachers) setTeachers(teachersData.teachers);
      if (subjectsData.subjects) setSubjects(subjectsData.subjects);
      
      if (studentsData.students) {
        // Filter out students that already have a sectionId
        // The API returns all students, we just need to find those where section is unassigned
        setUnassignedStudents(studentsData.students.filter((s: any) => !s.class));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userEmail]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const sectionsArray = newClass.sections.split(',').map(s => s.trim()).filter(Boolean);
    try {
      const res = await fetch('/api/admin/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClass, sections: sectionsArray, adminEmail: userEmail || 'admin@dps-hyd.edu' })
      });
      if (res.ok) {
        setIsAddClassModalOpen(false);
        setNewClass({ name: "", grade: "", sections: "A,B,C" });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add class");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.teacherId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/classes/assign-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: assignData.sectionId, teacherId: assignData.teacherId, adminEmail: userEmail || 'admin@dps-hyd.edu' })
      });
      if (res.ok) {
        setIsAssignModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to assign teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };


  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.standard) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSubject.name,
          standard: newSubject.standard,
          code: newSubject.code || undefined,
          color: newSubject.color || '#0ea5e9',
          adminEmail: userEmail || 'admin@dps-hyd.edu'
        })
      });
      if (res.ok) {
        setIsCreateSubjectModalOpen(false);
        setNewSubject({ name: "", standard: "", code: "", color: "#0ea5e9" });
        toast.success("Subject created successfully!");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create subject");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

  const handleOpenEditSubjectModal = (subject: any) => {
    setEditingSubject({
      id: subject.id,
      name: subject.name,
      standard: subject.standard || "",
      code: subject.code || "",
      color: subject.color || "#0ea5e9"
    });
    setIsEditSubjectModalOpen(true);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSubject)
      });
      if (res.ok) {
        setIsEditSubjectModalOpen(false);
        toast.success("Subject updated successfully!");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update subject");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${subjectName}"? This will delete the subject across all sections of this grade, including all topics and student progresses. This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/subjects?id=${subjectId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Subject deleted successfully!");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete subject");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  const handleUpdateSubjectTeacher = async (sectionId: string, subjectId: string, teacherId: string) => {
    try {
      const res = await fetch('/api/admin/sections/assign-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sectionId, 
          subjectId,
          teacherId: teacherId === 'unassigned' ? '' : teacherId, 
          adminEmail: userEmail || 'admin@dps-hyd.edu' 
        })
      });
      if (res.ok) {
        toast.success(teacherId === 'unassigned' ? "Teacher unassigned" : "Teacher assigned successfully");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to assign teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm("Are you sure you want to delete this class section? Students in this section will be unassigned, and assignments created for this section will be deleted.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/classes/delete/${classId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success("Class section deleted successfully");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete class");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  const handleAssignStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addStudentsData.selectedStudentIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/sections/assign-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sectionId: addStudentsData.sectionId, 
          studentIds: addStudentsData.selectedStudentIds,
          adminEmail: userEmail || 'admin@dps-hyd.edu' 
        })
      });
      if (res.ok) {
        toast.success("Students assigned successfully");
        setIsAddStudentsModalOpen(false);
        setAddStudentsData({ sectionId: "", sectionName: "", className: "", selectedStudentIds: [] });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to assign students");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={userName || "Loading..."} schoolName={schoolName || "Loading..."} pageTitle="Academic Workspace" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  // Flatten the hierarchy to get a list of Sections instead of Classes
  const allSections = classes.flatMap(c => 
    c.sections.map((s: any) => ({
      ...s,
      className: c.name,
      classGrade: c.grade
    }))
  );

  const sections = selectedGradeFilter === "All" 
    ? allSections 
    : allSections.filter(s => s.classGrade.toString() === selectedGradeFilter);

  const activeSection = allSections.find(s => s.id === activeSectionId);
  const grades = ["All", ...Array.from(new Set(allSections.map(s => s.classGrade.toString()))).sort((a: any, b: any) => a - b)];

  return (
    <DashboardLayout role="admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor"} pageTitle="Academic Workspace" pageSubtitle="Manage your school's classes, curriculum, teachers, and students.">
      <AcademicNavigationTabs />

      {/* Grade Level filter bar for the Sidebar Structure */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground mr-1">Filter Sidebar:</span>
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="glass-input px-2.5 py-1 text-xs bg-navy-950 text-teal font-medium border border-white/10 rounded-xl"
          >
            {grades.map(grade => (
              <option key={grade} value={grade} className="bg-navy-950 text-white">
                {grade === "All" ? "All Grades" : `Grade ${grade}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Tree Selection Sidebar (33% width / 4 cols) */}
        <div className="lg:col-span-4 bg-black/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden max-h-[70vh]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <School size={14} className="text-teal" /> Class Structure
            </h3>
            <button 
              onClick={() => setIsAddClassModalOpen(true)}
              className="text-[10px] bg-teal/10 hover:bg-teal/20 text-teal px-2 py-1 rounded-md border border-teal/20 transition-all flex items-center gap-1 font-semibold"
            >
              <Plus size={10}/> Create Class
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {classes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center p-4">No classes found.</p>
            ) : (
              classes
                .filter(c => selectedGradeFilter === "All" || c.grade.toString() === selectedGradeFilter)
                .map(cls => (
                  <div key={cls.id} className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider pl-1 flex items-center justify-between">
                      <span>{cls.name}</span>
                      <span className="text-[9px] font-normal lowercase text-muted-foreground/40">{cls.sections.length} sections</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {cls.sections.map((sec: any) => {
                        const isActive = activeSectionId === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => {
                              setActiveSectionId(sec.id);
                              // Clear add student checks
                              setAddStudentsData(prev => ({ ...prev, selectedStudentIds: [] }));
                            }}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-20 group relative overflow-hidden",
                              isActive
                                ? "bg-teal/10 border-teal/30 text-teal"
                                : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                          >
                            <span className="text-xs font-bold block">Section {sec.name}</span>
                            <span className="text-[10px] text-muted-foreground/80 mt-1">{sec.students?.length || 0} students</span>
                            {isActive && (
                              <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg bg-teal" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right Detail Workspace Panel (67% width / 8 cols) */}
        <div className="lg:col-span-8 bg-black/10 border border-white/5 rounded-2xl flex flex-col overflow-hidden min-h-[50vh]">
          {activeSection ? (
            <>
              {/* Header Details */}
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{activeSection.className} - {activeSection.name}</h2>
                    <span className="text-[10px] bg-teal/10 border border-teal/20 text-teal px-2 py-0.5 rounded-full font-semibold">Grade {activeSection.classGrade}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Class Teacher: <span className="font-semibold text-teal">{activeSection.classTeacher?.name || "Unassigned"}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setAssignData({ sectionId: activeSection.id, teacherId: activeSection.classTeacherId || "", sectionName: activeSection.name, className: activeSection.className });
                      setIsAssignModalOpen(true);
                    }}
                    className="glass-button text-[11px] px-3 py-1.5 flex items-center gap-1"
                  >
                    <UserPlus size={12} /> Assign Class Teacher
                  </button>
                  <button
                    onClick={() => handleDeleteClass(activeSection.id)}
                    className="glass-button text-[11px] border-coral/30 text-coral hover:bg-coral/10 px-3 py-1.5 flex items-center gap-1"
                    title="Delete Class Section"
                  >
                    <Trash2 size={12} /> Delete Section
                  </button>
                </div>
              </div>

              {/* Console Workspace Tabs grid */}
              <div className="p-5 grid md:grid-cols-2 gap-6 items-start">
                
                {/* Column 1: Curriculum / Subject Teacher Assignment */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-teal" /> Subjects & Teachers
                    </h3>
                    <button
                      onClick={() => {
                        setNewSubject(prev => ({ ...prev, standard: activeSection.classGrade.toString() }));
                        setIsCreateSubjectModalOpen(true);
                      }}
                      className="text-[10px] text-teal hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={10} /> Add Subject
                    </button>
                  </div>

                  <div className="space-y-2">
                    {activeSection.sectionSubjects && activeSection.sectionSubjects.length > 0 ? (
                      activeSection.sectionSubjects.map((ss: any) => (
                        <div key={ss.id} className="text-xs flex items-center justify-between p-3 bg-white/3 border border-white/5 rounded-xl group/sub transition-all hover:border-white/10">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ss.subject.color }} />
                              {ss.subject.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-mono">{ss.subject.code}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Hover Actions */}
                            <div className="opacity-0 group-hover/sub:opacity-100 flex items-center gap-0.5 transition-opacity">
                              <button
                                onClick={() => handleOpenEditSubjectModal(ss.subject)}
                                className="p-1 rounded text-muted-foreground hover:bg-white/10 hover:text-teal transition-all"
                                title="Edit Subject"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(ss.subject.id, ss.subject.name)}
                                className="p-1 rounded text-muted-foreground hover:bg-white/10 hover:text-coral transition-all"
                                title="Delete Subject"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <select
                              value={ss.teacher.id}
                              onChange={(e) => handleUpdateSubjectTeacher(activeSection.id, ss.subject.id, e.target.value)}
                              className="bg-black/20 text-teal border border-white/5 rounded-lg focus:outline-none focus:ring-0 max-w-[120px] p-1 text-[11px] cursor-pointer hover:border-white/10 font-medium"
                            >
                              <option value="unassigned" className="bg-navy-950 text-muted-foreground">Unassigned</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id} className="bg-navy-950 text-white">
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground italic p-4 bg-white/3 rounded-xl border border-dashed border-white/5 text-center">
                        No subjects added for Grade {activeSection.classGrade}.
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Enrolled Students List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-teal" /> Enrolled Students ({activeSection.students?.length || 0})
                    </h3>
                    <button
                      onClick={() => {
                        setAddStudentsData({ sectionId: activeSection.id, sectionName: activeSection.name, className: activeSection.className, selectedStudentIds: [] });
                        setIsAddStudentsModalOpen(true);
                      }}
                      className="text-[10px] text-teal hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={10} /> Add Students
                    </button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 no-scrollbar">
                    {activeSection.students && activeSection.students.length > 0 ? (
                      activeSection.students.map((student: any) => (
                        <div key={student.id} className="flex items-center justify-between p-2.5 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-[10px] font-bold text-teal flex-shrink-0">
                              {student.name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{student.name}</p>
                              <p className="text-[9px] text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to unassign ${student.name} from this class section?`)) {
                                try {
                                  const res = await fetch('/api/admin/sections/remove-student', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ studentId: student.id })
                                  });
                                  if (res.ok) {
                                    toast.success("Student removed from section");
                                    fetchData();
                                  } else {
                                    toast.error("Failed to remove student");
                                  }
                                } catch (err) {
                                  toast.error("Network error");
                                }
                              }
                            }}
                            className="p-1 rounded text-muted-foreground hover:bg-white/10 hover:text-coral transition-all"
                            title="Remove student from class"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground italic p-4 bg-white/3 rounded-xl border border-dashed border-white/5 text-center">
                        No students enrolled in this section yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground min-h-[300px] space-y-3">
              <School size={36} className="text-muted-foreground/30 animate-pulse" />
              <p className="text-sm italic">Please select a class section from the structure tree to view and manage curriculum assignments.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE SUBJECT MODAL */}
      {isCreateSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-4">Create New Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Subject Name (e.g. Mathematics)</label>
                <input 
                  type="text" 
                  value={newSubject.name} 
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  placeholder="e.g. Physics"
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Grade / Standard Level</label>
                {classes.length > 0 ? (
                  <select 
                    value={newSubject.standard} 
                    onChange={e => setNewSubject({...newSubject, standard: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm bg-navy-950 text-white" 
                    required 
                  >
                    <option value="" disabled>-- Select a Class/Grade --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.grade.toString()}>{c.name} (Grade {c.grade})</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="number" 
                    value={newSubject.standard} 
                    onChange={e => setNewSubject({...newSubject, standard: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm" 
                    placeholder="e.g. 8"
                    required 
                  />
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Subject Code (Optional)</label>
                <input 
                  type="text" 
                  value={newSubject.code} 
                  onChange={e => setNewSubject({...newSubject, code: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  placeholder="e.g. PHY8 (leave blank to auto-generate)"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Subject Display Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={newSubject.color} 
                    onChange={e => setNewSubject({...newSubject, color: e.target.value})} 
                    className="w-12 h-10 bg-transparent border border-white/20 rounded cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">{newSubject.color}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsCreateSubjectModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUBJECT MODAL */}
      {isEditSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-4">Edit Subject Details</h3>
            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Subject Name</label>
                <input 
                  type="text" 
                  value={editingSubject.name} 
                  onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Grade / Standard Level</label>
                {classes.length > 0 ? (
                  <select 
                    value={editingSubject.standard} 
                    onChange={e => setEditingSubject({...editingSubject, standard: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm bg-navy-950 text-white" 
                    required 
                  >
                    <option value="" disabled>-- Select a Class/Grade --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.grade.toString()}>{c.name} (Grade {c.grade})</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="number" 
                    value={editingSubject.standard} 
                    onChange={e => setEditingSubject({...editingSubject, standard: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm" 
                    required 
                  />
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Subject Code</label>
                <input 
                  type="text" 
                  value={editingSubject.code} 
                  onChange={e => setEditingSubject({...editingSubject, code: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Subject Display Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={editingSubject.color} 
                    onChange={e => setEditingSubject({...editingSubject, color: e.target.value})} 
                    className="w-12 h-10 bg-transparent border border-white/20 rounded cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">{editingSubject.color}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsEditSubjectModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CLASS MODAL */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-4">Create New Class</h3>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Class Name (e.g. Class 11)</label>
                <input 
                  type="text" 
                  value={newClass.name} 
                  onChange={e => setNewClass({...newClass, name: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Grade / Standard Level (Number)</label>
                <input 
                  type="number" 
                  value={newClass.grade} 
                  onChange={e => setNewClass({...newClass, grade: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Sections (comma separated)</label>
                <input 
                  type="text" 
                  value={newClass.sections} 
                  onChange={e => setNewClass({...newClass, sections: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
                <p className="text-[10px] text-muted-foreground mt-1">E.g. A, B, C. These will be created automatically.</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CLASS TEACHER MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-1">Assign Class Teacher</h3>
            <p className="text-xs text-muted-foreground mb-4">For {assignData.className} - {assignData.sectionName}</p>
            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Select Teacher (from assigned Subject Teachers)</label>
                <select 
                  value={assignData.teacherId} 
                  onChange={e => setAssignData({...assignData, teacherId: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm bg-navy-900" 
                  required 
                >
                  <option value="" disabled>-- Select a Teacher --</option>
                  {Array.from(new Map(
                    (sections.find(s => s.id === assignData.sectionId)?.sectionSubjects || [])
                      .filter((ss: any) => ss?.teacher?.id)
                      .map((ss: any) => [ss.teacher.id, { id: ss.teacher.id, name: ss.teacher.name, subjects: [] }])
                  ).values()).map((teacher: any) => {
                    const subjects = (sections.find(s => s.id === assignData.sectionId)?.sectionSubjects || [])
                      .filter((ss: any) => ss.teacher?.id === teacher.id)
                      .map((ss: any) => ss.subject.name)
                      .join(', ');
                    return (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({subjects})
                      </option>
                    );
                  })}
                </select>
                {(!sections.find(s => s.id === assignData.sectionId)?.sectionSubjects || sections.find(s => s.id === assignData.sectionId)?.sectionSubjects?.length === 0) && (
                  <p className="text-xs text-coral mt-2">There are no subject teachers assigned to this section yet. Assign a subject teacher first.</p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !assignData.teacherId}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Assigning..." : "Assign Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ADD STUDENTS MODAL */}
      {isAddStudentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-1">Add Students</h3>
            <p className="text-xs text-muted-foreground mb-4">Assign unassigned students to {addStudentsData.className} - {addStudentsData.sectionName}</p>
            <form onSubmit={handleAssignStudents} className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {unassignedStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed border-white/10 rounded-lg">No unassigned students available in the system.</p>
                ) : (
                  unassignedStudents.map(student => (
                    <label key={student.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-black/20 overflow-hidden">
                        <input 
                          type="checkbox" 
                          className="opacity-0 absolute inset-0 cursor-pointer"
                          checked={addStudentsData.selectedStudentIds.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAddStudentsData({ ...addStudentsData, selectedStudentIds: [...addStudentsData.selectedStudentIds, student.id] });
                            } else {
                              setAddStudentsData({ ...addStudentsData, selectedStudentIds: addStudentsData.selectedStudentIds.filter(id => id !== student.id) });
                            }
                          }}
                        />
                        {addStudentsData.selectedStudentIds.includes(student.id) && <Check size={14} className="text-teal absolute pointer-events-none" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-[10px] text-muted-foreground">{student.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsAddStudentsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || addStudentsData.selectedStudentIds.length === 0}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : `Add ${addStudentsData.selectedStudentIds.length} Students`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
