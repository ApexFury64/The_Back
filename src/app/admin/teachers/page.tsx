"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Trash2, Edit, Mail, Phone, BookOpen, UserCheck, 
  Lock, ShieldAlert, Award, Check, X, Clipboard
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import AcademicNavigationTabs from "@/components/ui/AcademicNavigationTabs";
import { cn } from "@/lib/utils";

export default function AdminTeachersPage() {
  const userName = useAppStore(s => s.userName);
  const userEmail = useAppStore(s => s.userEmail);
  const schoolName = useAppStore(s => s.schoolName);

  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "", phone: "", employeeId: "", primarySubject: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState({ id: "", name: "", email: "", password: "", phone: "", employeeId: "", primarySubject: "" });
  
  const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean; id: string; name: string}>({isOpen: false, id: '', name: ''});
  const [teacherPasswordResetVal, setTeacherPasswordResetVal] = useState("");
  const [isResettingTeacher, setIsResettingTeacher] = useState(false);

  const handleOpenEditModal = (teacher: any) => {
    setEditingTeacher({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      password: "",
      phone: teacher.phone === "N/A" ? "" : teacher.phone,
      employeeId: teacher.employeeId.startsWith("T-") ? "" : teacher.employeeId,
      primarySubject: teacher.subjects === "General" ? "" : teacher.subjects,
    });
    setIsEditModalOpen(true);
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/teachers/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTeacher),
      });
      if (res.ok) {
        toast.success("Teacher details updated successfully");
        setIsEditModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

  const fetchData = async () => {
    try {
      const [teachersRes, classesRes] = await Promise.all([
        fetch('/api/admin/teachers'),
        fetch(`/api/admin/classes?adminEmail=${userEmail || 'admin@dps-hyd.edu'}`)
      ]);
      const teachersData = await teachersRes.json();
      const classesData = await classesRes.json();
      
      if (teachersData.teachers) {
        setTeachers(teachersData.teachers);
        if (teachersData.teachers.length > 0) {
          setActiveTeacherId(prev => prev || teachersData.teachers[0].id);
        }
      }
      if (classesData.classes) {
        setClasses(classesData.classes);
      }
    } catch (err) {
      console.error("Error fetching workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userEmail]);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/teachers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTeacher, adminEmail: userEmail || 'admin@dps-hyd.edu' })
      });
      if (res.ok) {
        toast.success("Teacher added successfully");
        setIsAddModalOpen(false);
        setNewTeacher({ name: "", email: "", password: "", phone: "", employeeId: "", primarySubject: "" });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

  const handleDeleteTeacher = (teacherId: string, teacherName: string) => {
    setConfirmDelete({ isOpen: true, id: teacherId, name: teacherName });
  };

  const executeDeleteTeacher = async () => {
    const { id: teacherId } = confirmDelete;
    try {
      const res = await fetch(`/api/admin/teachers/delete/${teacherId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Teacher deleted successfully");
        // Clear active selection if it was the deleted teacher
        if (activeTeacherId === teacherId) {
          setActiveTeacherId(null);
        }
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting");
    }
    setConfirmDelete({ isOpen: false, id: '', name: '' });
  };

  const handleResetPassword = async (targetUserId: string) => {
    if (!teacherPasswordResetVal || teacherPasswordResetVal.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setIsResettingTeacher(true);
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, password: teacherPasswordResetVal })
      });
      if (res.ok) {
        toast.success("Teacher password reset successfully!");
        setTeacherPasswordResetVal("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setIsResettingTeacher(false);
    }
  };

  // Get teacher subject and section assignments from classes structure
  const getTeacherAssignments = (teacherId: string) => {
    const assignments: any[] = [];
    classes.forEach(c => {
      c.sections.forEach((sec: any) => {
        // Check if teacher is class teacher
        const isClassTeacher = sec.classTeacherId === teacherId || sec.classTeacher?.name === teachers.find(t => t.id === teacherId)?.name;
        
        // Scan sectionSubjects
        let taughtAny = false;
        sec.sectionSubjects?.forEach((ss: any) => {
          if (ss.teacher?.id === teacherId) {
            assignments.push({
              classId: sec.id,
              className: c.name,
              sectionName: sec.name,
              standard: c.grade,
              subjectId: ss.subject.id,
              subjectName: ss.subject.name,
              subjectCode: ss.subject.code,
              subjectColor: ss.subject.color,
              isClassTeacher
            });
            taughtAny = true;
          }
        });

        // If class teacher but doesn't teach any subject in this section, add as supervisory assignment
        if (isClassTeacher && !taughtAny) {
          assignments.push({
            classId: sec.id,
            className: c.name,
            sectionName: sec.name,
            standard: c.grade,
            subjectId: "class-teacher-role",
            subjectName: "Class Supervision",
            subjectCode: "MGMT",
            subjectColor: "#14b8a6",
            isClassTeacher: true
          });
        }
      });
    });
    return assignments;
  };

  // Filter teachers list by search input
  const filteredTeachers = teachers.filter((t) => 
    (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.subjects || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTeacher = teachers.find(t => t.id === activeTeacherId);
  const activeAssignments = activeTeacher ? getTeacherAssignments(activeTeacher.id) : [];

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={userName || "Loading..."} schoolName={schoolName || "Loading..."} pageTitle="Academic Workspace" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal-700 dark:border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="admin"
      userName={userName || "Admin"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Academic Workspace"
      pageSubtitle="Manage your school's classes, curriculum, teachers, and students in a single workspace."
    >
      <AcademicNavigationTabs />

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT DIRECTORY TREE LIST (40% width / 5 cols) */}
        <div className="lg:col-span-4 glass-card-static flex flex-col overflow-hidden max-h-[75vh]">
          <div className="p-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-teal-700 dark:text-teal" /> Faculty Directory
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="text-[10px] bg-teal/10 dark:bg-teal/20 hover:bg-teal/20 dark:hover:bg-teal/30 text-teal-700 dark:text-teal px-2.5 py-1.5 rounded-xl border border-teal/20 dark:border-teal/30 transition-all flex items-center gap-1 font-semibold"
              >
                <Plus size={12}/> Add Teacher
              </button>
            </div>
            
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or subject..." 
                className="glass-input pl-9 pr-3 py-1.5 w-full text-xs rounded-xl border-black/10 dark:border-white/10" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {filteredTeachers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center p-6">No teachers found matching criteria.</p>
            ) : (
              filteredTeachers.map((teacher) => {
                const isActive = activeTeacherId === teacher.id;
                return (
                  <button
                    key={teacher.id}
                    onClick={() => {
                      setActiveTeacherId(teacher.id);
                      setTeacherPasswordResetVal("");
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 relative overflow-hidden group",
                      isActive
                        ? "bg-teal/10 dark:bg-teal/20 border-teal/30 dark:border-teal/40 text-teal-700 dark:text-teal font-semibold shadow-inner"
                        : "bg-black/[0.03] dark:bg-white/5 border-black/5 dark:border-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal flex-shrink-0 border border-teal/10 dark:border-teal/25">
                      {teacher.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-foreground">{teacher.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] bg-teal/5 dark:bg-white/10 text-teal-700 dark:text-teal/80 px-1.5 py-0.5 rounded-md font-semibold border border-teal/10 dark:border-teal/20 uppercase tracking-tight">
                          {teacher.subjects}
                        </span>
                        {teacher.classes !== "None" && (
                          <span className="text-[9px] text-muted-foreground/80 truncate max-w-[100px]">
                            • Class Teacher
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-0 right-0 w-2 h-2 rounded-bl bg-teal-600 dark:bg-teal" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT DETAIL WORKSPACE CARD (60% width / 8 cols) */}
        <div className="lg:col-span-8 glass-card-static flex flex-col overflow-hidden min-h-[50vh]">
          {activeTeacher ? (
            <>
              {/* Header profile cards */}
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/[0.02] dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-base font-bold text-teal-700 dark:text-teal border border-teal/30 dark:border-teal/40 shadow-inner">
                    {activeTeacher.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{activeTeacher.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-teal/10 dark:bg-teal/20 border border-teal/20 dark:border-teal/30 text-teal-700 dark:text-teal px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {activeTeacher.subjects} SPECIALIST
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">ID: {activeTeacher.employeeId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(activeTeacher)}
                    className="glass-button text-[11px] px-3.5 py-2 flex items-center gap-1.5"
                    title="Edit Profile details"
                  >
                    <Edit size={12} /> Edit Details
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(activeTeacher.id, activeTeacher.name)}
                    className="glass-button-danger text-[11px] px-3.5 py-2 flex items-center gap-1.5"
                    title="Delete Teacher Registry"
                  >
                    <Trash2 size={12} /> Remove Teacher
                  </button>
                </div>
              </div>

              {/* Profile body Workspace layout */}
              <div className="p-5 space-y-6">
                {/* Contact grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl space-y-2.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Official Contact</span>
                    
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Mail size={14} className="text-teal-700 dark:text-teal shrink-0" />
                      <a href={`mailto:${activeTeacher.email}`} className="text-foreground hover:underline truncate">{activeTeacher.email}</a>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Phone size={14} className="text-teal-700 dark:text-teal shrink-0" />
                      <span className="text-foreground">{activeTeacher.phone}</span>
                    </div>
                  </div>

                  {/* Password Reset Section */}
                  <div className="p-4 bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl space-y-3.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                      <Lock size={12} className="text-teal-700 dark:text-teal" /> Reset Password
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={teacherPasswordResetVal}
                        onChange={(e) => setTeacherPasswordResetVal(e.target.value)}
                        className="glass-input flex-1 px-3 py-1.5 text-xs rounded-xl border-black/10 dark:border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPassword(activeTeacher.id)}
                        disabled={isResettingTeacher || !teacherPasswordResetVal}
                        className="glass-button text-xs px-3.5 py-1.5 rounded-xl disabled:opacity-50"
                      >
                        {isResettingTeacher ? "Saving..." : "Reset"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Matrix Active Teaching Assignments */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pl-1">
                    <UserCheck size={14} className="text-teal-700 dark:text-teal" /> Active Teaching Assignment Matrix
                  </h3>

                  <div className="glass-card-static rounded-xl overflow-hidden border border-black/5 dark:border-white/5">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
                          <th className="py-2.5 px-3 text-[10px] font-bold text-muted-foreground uppercase">Classroom Section</th>
                          <th className="py-2.5 px-3 text-[10px] font-bold text-muted-foreground uppercase">Assigned Subject</th>
                          <th className="py-2.5 px-3 text-[10px] font-bold text-muted-foreground uppercase">Subject Code</th>
                          <th className="py-2.5 px-3 text-[10px] font-bold text-muted-foreground uppercase text-right">Role Badge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {activeAssignments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground italic">
                              This teacher is currently not assigned to any standard curriculum subjects or classroom supervisions.
                            </td>
                          </tr>
                        ) : (
                          activeAssignments.map((assign, index) => (
                            <tr key={index} className="hover:bg-black/5 dark:hover:bg-white/3 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-foreground">
                                Grade {assign.standard} - Section {assign.sectionName}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assign.subjectColor }} />
                                  {assign.subjectName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-muted-foreground uppercase text-[10px]">
                                {assign.subjectCode}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {assign.isClassTeacher ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal/10 dark:bg-teal/20 text-teal-700 dark:text-teal border border-teal/20 dark:border-teal/30">
                                    Class Teacher
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/5 dark:bg-white/10 text-muted-foreground border border-black/5 dark:border-transparent">
                                    Subject Faculty
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground min-h-[300px] space-y-3">
              <Clipboard size={36} className="text-muted-foreground/30 animate-pulse" />
              <p className="text-sm italic">Please select a teacher from the registry list on the left to inspect their academic credentials and assignments matrix.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD TEACHER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative border border-black/10 dark:border-white/10">
            <h3 className="text-xl font-bold mb-4">Add New Teacher</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={newTeacher.name} 
                  onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                  placeholder="e.g. Rachel Green"
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={newTeacher.email} 
                  onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                  placeholder="e.g. rachel@school.edu"
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Password</label>
                <input 
                  type="password" 
                  value={newTeacher.password} 
                  onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                  placeholder="Min 6 characters"
                  required 
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Phone Number</label>
                  <input 
                    type="tel" 
                    value={newTeacher.phone} 
                    onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                    placeholder="e.g. +123456789"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Employee ID</label>
                  <input 
                    type="text" 
                    value={newTeacher.employeeId} 
                    onChange={e => setNewTeacher({...newTeacher, employeeId: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                    placeholder="e.g. EMP-202"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Primary Subject Speciality</label>
                <input 
                  type="text" 
                  value={newTeacher.primarySubject} 
                  onChange={e => setNewTeacher({...newTeacher, primarySubject: e.target.value})} 
                  placeholder="e.g. Mathematics"
                  className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative border border-black/10 dark:border-white/10">
            <h3 className="text-xl font-bold mb-4">Edit Teacher Details</h3>
            <form onSubmit={handleEditTeacher} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={editingTeacher.name} 
                  onChange={e => setEditingTeacher({...editingTeacher, name: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={editingTeacher.email} 
                  onChange={e => setEditingTeacher({...editingTeacher, email: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Password (Leave blank to keep current)</label>
                <input 
                  type="password" 
                  value={editingTeacher.password} 
                  onChange={e => setEditingTeacher({...editingTeacher, password: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Phone Number</label>
                  <input 
                    type="tel" 
                    value={editingTeacher.phone} 
                    onChange={e => setEditingTeacher({...editingTeacher, phone: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Employee ID</label>
                  <input 
                    type="text" 
                    value={editingTeacher.employeeId} 
                    onChange={e => setEditingTeacher({...editingTeacher, employeeId: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Primary Subject Speciality</label>
                <input 
                  type="text" 
                  value={editingTeacher.primarySubject} 
                  onChange={e => setEditingTeacher({...editingTeacher, primarySubject: e.target.value})} 
                  placeholder="e.g. Mathematics"
                  className="glass-input w-full px-4 py-2 text-sm border-black/10 dark:border-white/10" 
                />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
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

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: '', name: '' })}
        onConfirm={executeDeleteTeacher}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${confirmDelete.name}? This will remove their access to the platform. This action cannot be undone.`}
        confirmText="Delete Teacher"
      />
    </DashboardLayout>
  );
}
