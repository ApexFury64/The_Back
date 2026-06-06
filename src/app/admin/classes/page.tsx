"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Users, BookOpen, UserPlus, BookCopy, ChevronDown, Check, Trash2, Filter } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import AcademicNavigationTabs from "@/components/ui/AcademicNavigationTabs";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", grade: "", sections: "A,B,C" });
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({ sectionId: "", teacherId: "", sectionName: "", className: "" });

  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", standard: "", code: "", color: "#0ea5e9" });

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
      
      if (classesData.classes) setClasses(classesData.classes);
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

  const grades = ["All", ...Array.from(new Set(allSections.map(s => s.classGrade.toString()))).sort((a: any, b: any) => a - b)];

  return (
    <DashboardLayout role="admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor"} pageTitle="Academic Workspace" pageSubtitle="Manage your school's classes, curriculum, teachers, and students in a single workspace.">
      <AcademicNavigationTabs />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground mr-1">Grade Level:</span>
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="glass-input px-3 py-1.5 text-xs bg-navy-950 text-teal font-medium border border-white/10 rounded-xl"
          >
            {grades.map(grade => (
              <option key={grade} value={grade} className="bg-navy-950 text-white">
                {grade === "All" ? "All Grades" : `Grade ${grade}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={() => setIsCreateSubjectModalOpen(true)}
            className="glass-button px-4 py-2 flex items-center gap-2 border border-teal/30 text-teal hover:bg-teal/10 text-xs"
          >
            <BookOpen size={14}/> Create Subject
          </button>
          <button 
            onClick={() => setIsAddClassModalOpen(true)}
            className="glass-button px-4 py-2 flex items-center gap-2 text-xs"
          >
            <Plus size={14}/> Create New Class
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map(sec => (
          <div key={sec.id} className="glass-card-static p-6 rounded-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {sec.className} - {sec.name} 
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-normal">Grade {sec.classGrade}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Users size={12}/> {sec.students.length} Enrolled Students
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-teal/20 text-teal flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <button
                  onClick={() => handleDeleteClass(sec.id)}
                  title="Delete Class Section"
                  className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-coral/20 hover:text-coral flex items-center justify-center transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Class Teacher Block */}
            <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
              <div>
                <div className="text-xs text-muted-foreground">Class Teacher</div>
                <div className="font-semibold text-teal mt-0.5">
                  {sec.classTeacher ? sec.classTeacher.name : <span className="text-amber italic font-normal">Unassigned</span>}
                </div>
              </div>
              <button 
                onClick={() => {
                  setAssignData({ sectionId: sec.id, teacherId: sec.classTeacherId || "", sectionName: sec.name, className: sec.className });
                  setIsAssignModalOpen(true);
                }}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-muted-foreground px-2 py-1 rounded transition-colors flex items-center gap-1"
              >
                <UserPlus size={10} /> Assign Class Teacher
              </button>
            </div>

            {/* Subject Teachers Block */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground">Subjects Taught</h4>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                {sec.sectionSubjects && sec.sectionSubjects.length > 0 ? (
                  sec.sectionSubjects.map((ss: any) => (
                    <div key={ss.id} className="text-xs flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-md">
                      <span className="font-medium">{ss.subject.name}</span>
                      <select
                        value={ss.teacher.id}
                        onChange={(e) => handleUpdateSubjectTeacher(sec.id, ss.subject.id, e.target.value)}
                        className="bg-transparent text-teal border-none focus:outline-none focus:ring-0 max-w-[150px] text-right cursor-pointer hover:text-teal font-medium text-xs"
                      >
                        <option value="unassigned" className="bg-navy-950 text-muted-foreground">Unassigned</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id} className="bg-navy-950 text-white">
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground italic p-2 bg-white/5 rounded border border-white/5 text-center">No subjects added yet. Create a subject for this class above.</div>
                )}
              </div>
            </div>
            
            {/* Add Students Button */}
            <div className="pt-2">
               <button 
                  onClick={() => {
                    setAddStudentsData({ sectionId: sec.id, sectionName: sec.name, className: sec.className, selectedStudentIds: [] });
                    setIsAddStudentsModalOpen(true);
                  }}
                  className="w-full text-xs bg-white/5 hover:bg-white/10 text-muted-foreground px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/10"
                >
                  <Users size={12} /> Manage Students
                </button>
            </div>
          </div>
        ))}
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
