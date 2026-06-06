"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Mail, Phone, BookOpen, Trash2, Edit } from "lucide-react";
import { useAppStore } from "@/lib/store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import AcademicNavigationTabs from "@/components/ui/AcademicNavigationTabs";

export default function AdminTeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "", phone: "", employeeId: "", primarySubject: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean; id: string; name: string}>({isOpen: false, id: '', name: ''});
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState({ id: "", name: "", email: "", password: "", phone: "", employeeId: "", primarySubject: "" });

  const userName = useAppStore(s => s.userName);
  const userEmail = useAppStore(s => s.userEmail);
  const schoolName = useAppStore(s => s.schoolName);

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
        fetchTeachers();
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

  const fetchTeachers = () => {
    fetch('/api/admin/teachers')
      .then(res => res.json())
      .then(d => {
        if (d.teachers) setTeachers(d.teachers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

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
        fetchTeachers(); // Refresh list
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
        fetchTeachers();
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

  const filteredTeachers = teachers.filter((t) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subjects?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachers by name or subject..." 
              className="glass-input pl-10 pr-4 py-2 w-full text-sm" 
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="glass-button px-4 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> Add Teacher
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="glass-card-static p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <button 
                  onClick={() => handleOpenEditModal(teacher)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-teal transition-colors"
                  title="Edit Teacher"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-coral transition-colors"
                  title="Delete Teacher"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-lg font-bold text-teal flex-shrink-0">
                  {teacher.name.split(" ").map((n: string) => n[0]).join("").substring(0,2)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{teacher.name}</h3>
                  <p className="text-sm text-teal font-medium truncate w-40" title={teacher.primarySubject || teacher.subjects}>
                    {teacher.primarySubject || teacher.subjects}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-foreground/50 shrink-0" />
                    <span className="truncate" title={teacher.classes}>Classes: {teacher.classes}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail size={16} className="text-foreground/50 shrink-0" />
                  <span className="truncate" title={teacher.email}>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone size={16} className="text-foreground/50 shrink-0" />
                  <span>{teacher.phone}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredTeachers.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No teachers found matching "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      {/* ADD TEACHER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-4">Add New Teacher</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={newTeacher.name} 
                  onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={newTeacher.email} 
                  onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Password</label>
                <input 
                  type="password" 
                  value={newTeacher.password} 
                  onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
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
                    className="glass-input w-full px-4 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Employee ID</label>
                  <input 
                    type="text" 
                    value={newTeacher.employeeId} 
                    onChange={e => setNewTeacher({...newTeacher, employeeId: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Default Subject</label>
                <input 
                  type="text" 
                  value={newTeacher.primarySubject} 
                  onChange={e => setNewTeacher({...newTeacher, primarySubject: e.target.value})} 
                  placeholder="e.g. Mathematics"
                  className="glass-input w-full px-4 py-2 text-sm" 
                />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
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
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold mb-4">Edit Teacher Details</h3>
            <form onSubmit={handleEditTeacher} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={editingTeacher.name} 
                  onChange={e => setEditingTeacher({...editingTeacher, name: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={editingTeacher.email} 
                  onChange={e => setEditingTeacher({...editingTeacher, email: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Password (Leave blank to keep current)</label>
                <input 
                  type="password" 
                  value={editingTeacher.password} 
                  onChange={e => setEditingTeacher({...editingTeacher, password: e.target.value})} 
                  className="glass-input w-full px-4 py-2 text-sm" 
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
                    className="glass-input w-full px-4 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Employee ID</label>
                  <input 
                    type="text" 
                    value={editingTeacher.employeeId} 
                    onChange={e => setEditingTeacher({...editingTeacher, employeeId: e.target.value})} 
                    className="glass-input w-full px-4 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Default Subject</label>
                <input 
                  type="text" 
                  value={editingTeacher.primarySubject} 
                  onChange={e => setEditingTeacher({...editingTeacher, primarySubject: e.target.value})} 
                  placeholder="e.g. Mathematics"
                  className="glass-input w-full px-4 py-2 text-sm" 
                />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
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
