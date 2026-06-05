"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Download, MoreHorizontal, Filter, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminStudentsPage() {
  const userName = useAppStore((s) => s.userName);
  const schoolName = useAppStore((s) => s.schoolName);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", classId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any | null>(null);
  const [studentPasswordResetVal, setStudentPasswordResetVal] = useState("");
  const [parentPasswordResetVal, setParentPasswordResetVal] = useState("");
  const [isResettingStudent, setIsResettingStudent] = useState(false);
  const [isResettingParent, setIsResettingParent] = useState(false);

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

  const fetchStudents = () => {
    fetch('/api/admin/students')
      .then(res => res.json())
      .then(d => {
        if (d.classes) {
          setClasses(d.classes);
          // Expand first class by default if none are expanded
          if (d.classes.length > 0 && Object.keys(expandedClasses).length === 0) {
            setExpandedClasses({ [d.classes[0].id]: true });
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const toggleClass = (classId: string) => {
    setExpandedClasses(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  // Flatten classes/sections for the dropdown select options
  const flatClassRooms = classes.flatMap((cls) => 
    cls.sections.map((sec: any) => ({
      id: sec.id, // classRoom.id
      name: `${cls.name} - ${sec.name}`
    }))
  );

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
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="glass-button-secondary px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center border border-teal/30 text-teal hover:bg-teal/10"
          >
            <Download size={16} /> Bulk Import
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="glass-button px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
          >
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
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3 rounded-tl-lg">Student Details</th>
                                <th className="text-xs text-muted-foreground font-medium text-left py-2 px-3">Student ID</th>
                                <th className="text-xs text-muted-foreground font-medium text-right py-2 px-3 rounded-tr-lg">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sec.students.length === 0 ? (
                                <tr>
                                  <td colSpan={3} className="py-4 text-center text-sm text-muted-foreground">No students matched the search in this section.</td>
                                </tr>
                              ) : (
                                sec.students.map((student: any) => (
                                  <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-3">
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
                                    <td className="py-3 px-3 text-sm font-mono text-muted-foreground">
                                      STU-{student.id.substring(0, 5).toUpperCase()}
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                      <button 
                                        onClick={() => setSelectedStudentForDetails(student)}
                                        className="glass-button px-3 py-1.5 text-xs bg-teal/10 hover:bg-teal/20 text-teal border border-teal/20"
                                      >
                                        Actions
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
                  className="glass-input w-full px-4 py-2 text-sm bg-navy-900" 
                  required 
                >
                  <option value="" disabled>-- Select a Class Section --</option>
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
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
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
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  First, download the template CSV file. Fill in the student and parent details, then upload the file back here.
                </p>
                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="w-full glass-button-secondary py-2 text-xs flex items-center justify-center gap-2 border border-teal/20 text-teal"
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
                  className="glass-input w-full px-4 py-2 text-sm text-muted-foreground file:bg-white/10 file:border-none file:text-white file:px-3 file:py-1 file:rounded-md file:mr-3 file:cursor-pointer" 
                  required 
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
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

      {/* STUDENT DETAILS MODAL */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl relative border border-white/10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="text-teal" size={24} /> Student Profile
            </h3>
            
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-base font-bold text-teal">
                  {selectedStudentForDetails.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <h4 className="text-base font-bold">{selectedStudentForDetails.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">ID: STU-{selectedStudentForDetails.id.substring(0, 5).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enrolled: {selectedStudentForDetails.enrollmentYear}</p>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Academic Performance</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] text-muted-foreground block">Average Grade</span>
                    <span className={cn("text-lg font-bold block", selectedStudentForDetails.avgScore >= 80 ? "text-teal" : selectedStudentForDetails.avgScore >= 60 ? "text-amber" : "text-coral")}>
                      {selectedStudentForDetails.avgScore}%
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[10px] text-muted-foreground block">Attendance</span>
                    <span className="text-lg font-bold block text-teal">{selectedStudentForDetails.attendancePercent}%</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">AI Tutor Usage</span>
                  <span className={cn(
                    "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                    selectedStudentForDetails.aiUsage === "High" ? "bg-cyan/15 text-cyan" : selectedStudentForDetails.aiUsage === "Medium" ? "bg-amber/15 text-amber" : "bg-white/10 text-muted-foreground"
                  )}>
                    {selectedStudentForDetails.aiUsage}
                  </span>
                </div>
              </div>

              {/* Account Credentials & Password Management */}
              <div className="space-y-4 border-t border-white/5 pt-4">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Credentials & Access</h5>
                
                {/* Student Account */}
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Student Login ID (Email):</span>
                    <span className="font-semibold text-teal truncate max-w-[200px]">{selectedStudentForDetails.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Default Password:</span>
                    <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[11px] text-teal">demo123</span>
                  </div>
                  
                  {/* Reset Password Form */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <label className="text-[10px] text-muted-foreground font-medium block">Reset Student Password</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="New student password"
                        value={studentPasswordResetVal}
                        onChange={(e) => setStudentPasswordResetVal(e.target.value)}
                        className="glass-input flex-1 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPassword(selectedStudentForDetails.id, false)}
                        disabled={isResettingStudent || !studentPasswordResetVal}
                        className="glass-button px-3 py-1.5 text-xs disabled:opacity-50 bg-teal text-navy-900 border-none font-bold"
                      >
                        {isResettingStudent ? "Saving..." : "Reset"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Parent Account */}
                {selectedStudentForDetails.parent ? (
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Parent Login ID (Email):</span>
                      <span className="font-semibold text-teal truncate max-w-[200px]">{selectedStudentForDetails.parent.email}</span>
                    </div>
                    {selectedStudentForDetails.parent.phone !== 'N/A' && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Parent Login ID (Phone):</span>
                        <span className="font-semibold text-teal">{selectedStudentForDetails.parent.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Default Password:</span>
                      <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[11px] text-teal">demo123</span>
                    </div>
                    
                    {/* Reset Password Form */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <label className="text-[10px] text-muted-foreground font-medium block">Reset Parent Password</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="New parent password"
                          value={parentPasswordResetVal}
                          onChange={(e) => setParentPasswordResetVal(e.target.value)}
                          className="glass-input flex-1 px-3 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleResetPassword(selectedStudentForDetails.parent.id, true)}
                          disabled={isResettingParent || !parentPasswordResetVal}
                          className="glass-button px-3 py-1.5 text-xs disabled:opacity-50 bg-teal text-navy-900 border-none font-bold"
                        >
                          {isResettingParent ? "Saving..." : "Reset"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic text-center p-2 bg-white/5 rounded-xl border border-white/5">
                    Parent account details unavailable (no parent linked).
                  </p>
                )}
              </div>

              {/* Parent Contact Details */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent Contact Info</h5>
                {selectedStudentForDetails.parent ? (
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Parent Name:</span>
                      <span className="font-semibold">{selectedStudentForDetails.parent.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Parent Email:</span>
                      <span className="font-semibold">{selectedStudentForDetails.parent.email}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Parent Phone:</span>
                      <span className="font-semibold">{selectedStudentForDetails.parent.phone !== 'N/A' ? selectedStudentForDetails.parent.phone : 'Not Provided'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                    No parent linked to this student.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedStudentForDetails(null);
                    setStudentPasswordResetVal("");
                    setParentPasswordResetVal("");
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-teal/20 text-teal hover:bg-teal/30 transition-colors text-sm font-medium border border-teal/30"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
