"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Download, Filter, ChevronDown, ChevronRight, GraduationCap,
  X, Mail, Phone, Calendar, Award, Activity, UserCheck, UserX, Lock, ShieldAlert,
  Percent, ArrowRight
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import AcademicNavigationTabs from "@/components/ui/AcademicNavigationTabs";

export default function AdminStudentsPage() {
  const userName = useAppStore((s) => s.userName);
  const userEmail = useAppStore((s) => s.userEmail);
  const schoolName = useAppStore((s) => s.schoolName);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedAiUsage, setSelectedAiUsage] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All"); // All, Assigned, Unassigned

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", classId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Drawer state for Student Profile
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any | null>(null);
  const [studentPasswordResetVal, setStudentPasswordResetVal] = useState("");
  const [parentPasswordResetVal, setParentPasswordResetVal] = useState("");
  const [isResettingStudent, setIsResettingStudent] = useState(false);
  const [isResettingParent, setIsResettingParent] = useState(false);

  const fetchStudents = () => {
    fetch('/api/admin/students')
      .then(res => res.json())
      .then(d => {
        if (d.classes) setClasses(d.classes);
        if (d.students) setStudents(d.students);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleResetPassword = async (targetUserId: string, isParent: boolean) => {
    const password = isParent ? parentPasswordResetVal : studentPasswordResetVal;
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    if (isParent) setIsResettingParent(true);
    else setIsResettingStudent(true);
    
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, password })
      });
      if (res.ok) {
        toast.success(`${isParent ? 'Parent' : 'Student'} password reset successfully!`);
        if (isParent) setParentPasswordResetVal("");
        else setStudentPasswordResetVal("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      if (isParent) setIsResettingParent(false);
      else setIsResettingStudent(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        toast.success("Student added successfully");
        setIsAddModalOpen(false);
        setNewStudent({ name: "", email: "", classId: "" });
        fetchStudents();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add student");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student Name,Student Email,Standard,Section,Parent Name,Parent Email,Parent Phone\n"
      + "John Doe,john.doe@school.com,8,A,Robert Doe,robert.doe@mail.com,+1234567890\n"
      + "Jane Smith,jane.smith@school.com,8,B,Sarah Smith,sarah.smith@mail.com,+1987654321\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_parent_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template downloaded!");
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await fetch('/api/admin/students/bulk', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Successfully imported ${data.count} students!`);
        setIsBulkModalOpen(false);
        setSelectedFile(null);
        fetchStudents();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to import students");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleReassignClassInDrawer = async (studentId: string, sectionId: string) => {
    if (!sectionId) {
      // Unassign student
      try {
        const res = await fetch('/api/admin/sections/remove-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId })
        });
        if (res.ok) {
          toast.success("Student unassigned from section");
          setSelectedStudentForDetails((prev: any) => prev ? { ...prev, class: null } : null);
          fetchStudents();
        } else {
          toast.error("Failed to unassign student");
        }
      } catch (err) {
        toast.error("Network error");
      }
      return;
    }

    // Assign student
    try {
      const res = await fetch('/api/admin/sections/assign-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sectionId, 
          studentIds: [studentId],
          adminEmail: userEmail || 'admin@dps-hyd.edu'
        })
      });
      if (res.ok) {
        toast.success("Student reassigned successfully");
        const matchedRoom = flatClassRooms.find(r => r.id === sectionId);
        if (matchedRoom) {
          const parts = matchedRoom.name.split(" - ");
          setSelectedStudentForDetails((prev: any) => prev ? {
            ...prev,
            class: {
              id: sectionId,
              name: parts[1],
              standard: parts[0].replace("Grade ", ""),
              section: parts[1]
            }
          } : null);
        }
        fetchStudents();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to reassign student");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  // Flatten classrooms for dropdowns
  const flatClassRooms = classes.flatMap((cls) => 
    cls.sections.map((sec: any) => ({
      id: sec.id,
      name: `Grade ${cls.grade} - Section ${sec.name}`
    }))
  );

  // Extract unique grades and sections for search filtering
  const uniqueGrades = Array.from(new Set(classes.map(c => c.grade.toString()))).sort((a, b) => parseInt(a) - parseInt(b));
  const uniqueSections = Array.from(new Set(classes.flatMap(c => c.sections.map((s: any) => s.name)))).sort() as string[];

  // Filter students based on all states
  const filteredStudents = students.filter((student) => {
    // Search filter
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Grade filter
    const matchesGrade = selectedGrade === "All" || (student.class && student.class.standard.toString() === selectedGrade);
    
    // Section filter
    const matchesSection = selectedSection === "All" || (student.class && student.class.section === selectedSection);
    
    // AI activity level filter
    const matchesAiUsage = selectedAiUsage === "All" || student.aiUsage === selectedAiUsage;
    
    // Enrolled status filter
    const matchesStatus = 
      selectedStatus === "All" || 
      (selectedStatus === "Assigned" && student.class !== null) ||
      (selectedStatus === "Unassigned" && student.class === null);

    return matchesSearch && matchesGrade && matchesSection && matchesAiUsage && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={userName || "Loading..."} schoolName={schoolName || "Loading..."} pageTitle="Academic Workspace" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
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

      {/* FILTER HUB & SEARCH BAR */}
      <div className="glass-card-static p-4 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, or system ID..." 
              className="glass-input pl-11 pr-4 py-2.5 w-full text-sm rounded-xl" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="glass-button-secondary px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl border border-teal/20 dark:border-teal/30 text-teal-700 dark:text-teal hover:bg-teal/10 dark:hover:bg-teal/20 transition-all"
            >
              <Download size={14} /> Bulk Import
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="glass-button px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl transition-all"
            >
              <Plus size={14} /> Add Student
            </button>
          </div>
        </div>

        {/* Dropdown Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider pl-1">Grade Level</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="glass-input w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-950 text-teal-700 dark:text-teal border-black/10 dark:border-white/10 rounded-xl"
            >
              <option value="All" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">All Grades</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade} className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Grade {grade}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider pl-1">Section Letter</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="glass-input w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-950 text-teal-700 dark:text-teal border-black/10 dark:border-white/10 rounded-xl"
            >
              <option value="All" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">All Sections</option>
              {uniqueSections.map(sec => (
                <option key={sec} value={sec} className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Section {sec}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider pl-1">AI Tutor Activity</span>
            <select
              value={selectedAiUsage}
              onChange={(e) => setSelectedAiUsage(e.target.value)}
              className="glass-input w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-950 text-teal-700 dark:text-teal border-black/10 dark:border-white/10 rounded-xl"
            >
              <option value="All" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">All Activity Levels</option>
              <option value="High" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">High Activity</option>
              <option value="Medium" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Medium Activity</option>
              <option value="Low" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Low Activity</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider pl-1">Roster Assignment</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="glass-input w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-950 text-teal-700 dark:text-teal border-black/10 dark:border-white/10 rounded-xl"
            >
              <option value="All" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">All Students</option>
              <option value="Assigned" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Assigned to Class</option>
              <option value="Unassigned" className="bg-white dark:bg-navy-950 text-slate-800 dark:text-white">Unassigned (Pending)</option>
            </select>
          </div>
        </div>
      </div>

      {/* STUDENT DATATABLE */}
      <div className="glass-card-static rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
                <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Student Details</th>
                <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Classroom Room</th>
                <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">System ID</th>
                <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Parent Contact</th>
                <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Grade</th>
                <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Activity</th>
                <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground italic text-sm">
                    No students matched the active search filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-black/[0.03] dark:hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal flex-shrink-0 border border-teal/10 dark:border-teal/20">
                          {student.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p 
                            onClick={() => setSelectedStudentForDetails(student)}
                            className="text-sm font-semibold text-foreground hover:text-teal-700 dark:hover:text-teal cursor-pointer hover:underline"
                          >
                            {student.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {student.class ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal/10 text-teal-800 dark:text-teal border border-teal/20 dark:border-teal/30">
                          Grade {student.class.standard} - {student.class.section}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-coral/10 text-coral border border-dashed border-coral/30">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      STU-{student.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      {student.parent ? (
                        <div>
                          <p className="text-xs font-medium text-foreground">{student.parent.name}</p>
                          <p className="text-[10px] text-muted-foreground">{student.parent.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">None linked</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-sm">
                      <span className={cn(
                        student.avgScore >= 80 ? "text-teal-700 dark:text-teal" : student.avgScore >= 60 ? "text-amber-800 dark:text-amber" : "text-coral"
                      )}>
                        {student.avgScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        student.aiUsage === "High" ? "bg-cyan/10 dark:bg-cyan/15 text-cyan-700 dark:text-cyan border-cyan/20 dark:border-transparent" : 
                        student.aiUsage === "Medium" ? "bg-amber/10 dark:bg-amber/15 text-amber-800 dark:text-amber border-amber/20 dark:border-transparent" : 
                        "bg-black/5 dark:bg-white/10 text-muted-foreground border-black/5 dark:border-white/5"
                      )}>
                        {student.aiUsage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => setSelectedStudentForDetails(student)}
                        className="glass-button text-xs px-3 py-1.5 hover:bg-teal/20"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table footer with counts */}
        <div className="bg-black/5 dark:bg-white/3 px-4 py-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <span className="font-semibold text-teal-700 dark:text-teal">{students.filter(s => !s.class).length} unassigned students pending classroom allocation</span>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative border border-white/10">
            <h3 className="text-xl font-bold mb-4">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={newStudent.name} 
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  placeholder="e.g. Arjun Kumar"
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={newStudent.email} 
                  onChange={e => setNewStudent({...newStudent, email: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  placeholder="e.g. student@school.edu"
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Class & Section Assignment</label>
                <select 
                  value={newStudent.classId} 
                  onChange={e => setNewStudent({...newStudent, classId: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm bg-white dark:bg-navy-950 text-slate-800 dark:text-white border-black/10 dark:border-white/10" 
                  required 
                >
                  <option value="" disabled className="bg-white dark:bg-navy-950 text-muted-foreground">-- Select a Class Section --</option>
                  {flatClassRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                {flatClassRooms.length === 0 && (
                  <p className="text-xs text-coral mt-2">No active classes found. Create a class section first.</p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newStudent.classId}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative border border-white/10">
            <h3 className="text-xl font-bold mb-1">Bulk Import Students</h3>
            <p className="text-xs text-muted-foreground mb-4">Upload a CSV file to add multiple students and link their parents automatically.</p>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div className="p-4 bg-black/[0.02] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  First, download the template CSV file. Fill in the student and parent details, then upload the file back here.
                </p>
                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="w-full glass-button-secondary py-2 text-xs flex items-center justify-center gap-2 border border-teal/20 dark:border-teal/30 text-teal-700 dark:text-teal hover:bg-teal/10 dark:hover:bg-teal/20 transition-colors"
                >
                  <Download size={14} /> Download Example CSV Template
                </button>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Choose CSV File</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="glass-input w-full px-4 py-2 text-sm text-muted-foreground file:bg-black/5 dark:file:bg-white/10 file:border-none file:text-foreground dark:file:text-white file:px-3 file:py-1 file:rounded-md file:mr-3 file:cursor-pointer" 
                  required 
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                     setIsBulkModalOpen(false);
                     setSelectedFile(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isImporting || !selectedFile}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isImporting ? "Importing..." : "Upload & Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER (STUDENT DETAILS) */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur */}
          <div 
            onClick={() => {
              setSelectedStudentForDetails(null);
              setStudentPasswordResetVal("");
              setParentPasswordResetVal("");
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            {/* Drawer Container */}
            <div className="w-screen max-w-md bg-white dark:bg-navy-950 border-l border-black/10 dark:border-white/10 flex flex-col justify-between shadow-2xl relative">
              <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6 no-scrollbar">
                
                {/* Header details */}
                <div className="flex items-start justify-between border-b border-black/5 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal/10 dark:bg-teal/20 text-teal-700 dark:text-teal flex items-center justify-center border border-teal/20 dark:border-teal/30 shadow-inner">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{selectedStudentForDetails.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">ID: STU-{selectedStudentForDetails.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedStudentForDetails(null);
                      setStudentPasswordResetVal("");
                      setParentPasswordResetVal("");
                    }}
                    className="p-1 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Academic Metrics Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Average Score</span>
                      <Award size={14} className="text-teal-700 dark:text-teal" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-2xl font-black", selectedStudentForDetails.avgScore >= 80 ? "text-teal-700 dark:text-teal" : selectedStudentForDetails.avgScore >= 60 ? "text-amber-800 dark:text-amber" : "text-coral")}>
                        {selectedStudentForDetails.avgScore}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold">%</span>
                    </div>
                    <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", selectedStudentForDetails.avgScore >= 80 ? "bg-teal" : selectedStudentForDetails.avgScore >= 60 ? "bg-amber" : "bg-coral")}
                        style={{ width: `${selectedStudentForDetails.avgScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Attendance</span>
                      <Percent size={14} className="text-cyan" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-cyan">{selectedStudentForDetails.attendancePercent}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">%</span>
                    </div>
                    <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan rounded-full"
                        style={{ width: `${selectedStudentForDetails.attendancePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Class Assignment & Reassignment Matrix */}
                <div className="p-4 bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Class Allocation</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold",
                      selectedStudentForDetails.class ? "bg-teal/10 text-teal-800 dark:text-teal border border-teal/20 dark:border-teal/30" : "bg-coral/10 text-coral border border-dashed border-coral/30"
                    )}>
                      {selectedStudentForDetails.class ? "Enrolled" : "Pending Assignment"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider pl-1">Assign Classroom</label>
                      <select
                        value={selectedStudentForDetails.class?.id || ""}
                        onChange={(e) => handleReassignClassInDrawer(selectedStudentForDetails.id, e.target.value)}
                        className="glass-input w-full px-3 py-2 text-xs bg-white dark:bg-navy-950 text-teal-700 dark:text-teal border-black/10 dark:border-white/10 rounded-xl"
                      >
                        <option value="" className="bg-white dark:bg-navy-950 text-muted-foreground">-- Unassigned (Remove from Class) --</option>
                        {flatClassRooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Parent Contact Details */}
                <div className="p-4 bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Linked Parent / Guardian</span>
                  {selectedStudentForDetails.parent ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold text-foreground">{selectedStudentForDetails.parent.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-semibold text-teal-700 dark:text-teal">{selectedStudentForDetails.parent.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-semibold text-foreground">
                          {selectedStudentForDetails.parent.phone !== 'N/A' ? selectedStudentForDetails.parent.phone : 'Not Provided'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic text-center py-2">No linked parent account exists.</p>
                  )}
                </div>

                {/* Password reset controls */}
                <div className="p-4 bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl space-y-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                    <Lock size={14} className="text-teal-700 dark:text-teal" /> Account Access Management
                  </span>
                  
                  {/* Student Access */}
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">Student Username (Email)</span>
                      <span className="font-mono text-[11px] text-teal-700 dark:text-teal truncate max-w-[180px]">{selectedStudentForDetails.email}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="password"
                        placeholder="New student password"
                        value={studentPasswordResetVal}
                        onChange={(e) => setStudentPasswordResetVal(e.target.value)}
                        className="glass-input flex-1 px-3 py-1.5 text-xs rounded-xl border-black/10 dark:border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPassword(selectedStudentForDetails.id, false)}
                        disabled={isResettingStudent || !studentPasswordResetVal}
                        className="glass-button text-xs px-3 py-1.5 rounded-xl disabled:opacity-50 shrink-0"
                      >
                        {isResettingStudent ? "Saving..." : "Reset"}
                      </button>
                    </div>
                  </div>

                  {/* Parent Access */}
                  {selectedStudentForDetails.parent && (
                    <div className="space-y-2 pt-3 border-t border-black/5 dark:border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Parent Username (Email)</span>
                        <span className="font-mono text-[11px] text-teal-700 dark:text-teal truncate max-w-[180px]">{selectedStudentForDetails.parent.email}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="password"
                          placeholder="New parent password"
                          value={parentPasswordResetVal}
                          onChange={(e) => setParentPasswordResetVal(e.target.value)}
                          className="glass-input flex-1 px-3 py-1.5 text-xs rounded-xl border-black/10 dark:border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => handleResetPassword(selectedStudentForDetails.parent.id, true)}
                          disabled={isResettingParent || !parentPasswordResetVal}
                          className="glass-button text-xs px-3 py-1.5 rounded-xl disabled:opacity-50 shrink-0"
                        >
                          {isResettingParent ? "Saving..." : "Reset"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom drawer controls */}
              <div className="p-4 bg-black/[0.02] dark:bg-white/3 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentForDetails(null);
                    setStudentPasswordResetVal("");
                    setParentPasswordResetVal("");
                  }}
                  className="w-full glass-button-secondary py-2 text-xs font-semibold rounded-xl"
                >
                  Close Profile Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
