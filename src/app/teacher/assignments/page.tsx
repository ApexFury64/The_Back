"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClipboardList, Plus, Search, Filter, CheckCircle, Clock, Users, X, FileText, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function TeacherAssignmentsPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userEmail = useAppStore(s => s.userEmail);
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [sectionSubjects, setSectionSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    sectionSubjectId: "",
  });

  const [activeReviewAssignment, setActiveReviewAssignment] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const email = userEmail || 'teacher@dps.edu';
      const res = await fetch(`/api/teacher/assignments?teacherEmail=${email}`);
      const data = await res.json();
      if (data.assignments) setAssignments(data.assignments);
      if (data.sectionSubjects) setSectionSubjects(data.sectionSubjects);
    } catch (error) {
      console.error("Failed to fetch assignments", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, [userEmail]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Failed to create assignment");
        return;
      }

      toast.success("Assignment created successfully");
      setIsModalOpen(false);
      setNewAssignment({ title: "", description: "", dueDate: "", sectionSubjectId: "" });
      fetchAssignments();
    } catch (error) {
      console.error("Failed to create assignment", error);
      toast.error("Network error");
    }
  };

  const handleReviewClick = async (assignment: any) => {
    setActiveReviewAssignment(assignment);
    setLoadingSubmissions(true);
    setSubmissions([]);
    try {
      const res = await fetch(`/api/teacher/assignments/submissions?assignmentId=${assignment.id}`);
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load submissions");
    }
    setLoadingSubmissions(false);
  };

  const handleSaveGrade = async () => {
    if (!gradingSubmissionId) return;
    setIsSubmittingGrade(true);
    try {
      const res = await fetch('/api/teacher/assignments/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: gradingSubmissionId,
          grade: gradeInput,
          feedback: feedbackInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Grade saved for ${data.submission.user.name}`);
        setSubmissions(submissions.map(s => s.id === gradingSubmissionId ? { ...s, grade: gradeInput, comments: feedbackInput, status: 'graded' } : s));
        setGradingSubmissionId(null);
        setGradeInput("");
        setFeedbackInput("");
        fetchAssignments();
      } else {
        toast.error(data.error || "Failed to save grade");
      }
    } catch (e) {
      toast.error("Network error");
    }
    setIsSubmittingGrade(false);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || a.status === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"} pageTitle="Assignments" pageSubtitle="Create and grade student assignments">
      <div className="glass-card-static p-6 rounded-2xl relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Search assignments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 pr-4 py-2 w-full text-sm" 
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={cn(
                  "glass-button-secondary px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center",
                  filterStatus !== "All" && "text-teal border-teal/30 bg-teal/5"
                )}
              >
                <Filter size={16} /> {filterStatus === "All" ? "Filter" : filterStatus}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 w-40 glass-card border border-white/10 rounded-xl p-2 z-10 shadow-xl">
                  <p className="text-xs text-muted-foreground font-medium px-2 py-1 mb-1">Status</p>
                  {["All", "Pending", "Completed"].map(status => (
                    <button 
                      key={status}
                      onClick={() => { setFilterStatus(status); setShowFilter(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors",
                        filterStatus === status && "text-teal bg-white/5 font-medium"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="glass-button px-4 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center bg-teal text-navy-900 border-none font-semibold"
            >
              <Plus size={16} /> Create Assignment
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading assignments...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded-xl">No assignments found.</div>
          ) : filteredAssignments.map(a => (
            <div key={a.id} className="glass-card p-5 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                  a.status === "completed" ? "bg-teal/15 text-teal" : "bg-cyan/15 text-cyan"
                )}>
                  {a.status === "completed" ? <CheckCircle size={20} /> : <ClipboardList size={20} />}
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-1 group-hover:text-teal transition-colors">{a.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium bg-white/5 px-2 py-0.5 rounded">{a.class}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> Due: {a.dueDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Submissions</p>
                  <p className="font-semibold"><span className="text-teal">{a.submitted}</span> / {a.total}</p>
                </div>
                <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className={cn("h-full", a.status === "completed" ? "bg-teal" : "bg-cyan")} 
                    style={{ width: `${a.total > 0 ? (a.submitted / a.total) * 100 : 0}%` }}
                  />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleReviewClick(a); }}
                  className="glass-button-secondary px-3 py-1.5 text-xs hover:bg-teal hover:text-white hover:border-teal/50"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10"
          >
            <h3 className="text-xl font-bold mb-4">Create Assignment</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Assignment Title</label>
                <input 
                  type="text" 
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label>
                <textarea 
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm min-h-[80px]" 
                  placeholder="Optional details for the students..."
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Assign to Class Section</label>
                <select 
                  value={newAssignment.sectionSubjectId}
                  onChange={e => setNewAssignment({...newAssignment, sectionSubjectId: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required
                >
                  <option value="" disabled>-- Select a Section --</option>
                  {sectionSubjects.map(ss => (
                    <option key={ss.id} value={ss.id}>
                      {ss.section.class.name}-{ss.section.name} ({ss.subject.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Due Date</label>
                <input 
                  type="date" 
                  value={newAssignment.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  style={{ colorScheme: 'dark' }}
                  className="glass-input w-full px-4 py-2.5 text-sm text-foreground bg-white/5 border border-white/10 rounded-xl cursor-pointer" 
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center bg-teal text-navy-900 font-semibold border-none"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* REVIEW SUBMISSIONS MODAL */}
      <AnimatePresence>
        {activeReviewAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl border-white/20"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div>
                  <h2 className="text-xl font-bold">Review Submissions</h2>
                  <p className="text-sm text-muted-foreground mt-1">{activeReviewAssignment.title} • {activeReviewAssignment.class}</p>
                </div>
                <button 
                  onClick={() => setActiveReviewAssignment(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
                {loadingSubmissions ? (
                  <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                    No submissions found for this assignment yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map(sub => (
                      <div key={sub.id} className="glass-card p-5 rounded-xl border border-white/10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-semibold">{sub.user.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">Submitted on {new Date(sub.submittedAt).toLocaleString()}</p>
                            {sub.comments && gradingSubmissionId !== sub.id && (
                              <p className="text-sm mt-3 bg-white/5 p-3 rounded-lg">Feedback: {sub.comments}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <a 
                              href={sub.filePath} 
                              target="_blank" 
                              rel="noreferrer"
                              className="glass-button-secondary px-3 py-1.5 text-xs flex items-center gap-2"
                            >
                              <FileText size={14}/> View Work
                            </a>
                            
                            {sub.status === 'graded' && gradingSubmissionId !== sub.id ? (
                              <div className="flex items-center gap-3 ml-4">
                                <div className="text-right">
                                  <span className="text-xs text-muted-foreground block">Grade</span>
                                  <span className="font-bold text-teal text-lg">{sub.grade}</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    setGradingSubmissionId(sub.id);
                                    setGradeInput(sub.grade || "");
                                    setFeedbackInput(sub.comments || "");
                                  }}
                                  className="text-xs text-teal hover:underline ml-2"
                                >
                                  Edit
                                </button>
                              </div>
                            ) : gradingSubmissionId !== sub.id ? (
                              <button 
                                onClick={() => {
                                  setGradingSubmissionId(sub.id);
                                  setGradeInput("");
                                  setFeedbackInput("");
                                }}
                                className="glass-button bg-teal text-navy-900 px-4 py-1.5 text-xs font-semibold"
                              >
                                Grade
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {/* Grading Form */}
                        <AnimatePresence>
                          {gradingSubmissionId === sub.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-white/10"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-1">
                                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Grade / Score</label>
                                  <input 
                                    type="text" 
                                    value={gradeInput}
                                    onChange={e => setGradeInput(e.target.value)}
                                    placeholder="e.g. 95/100 or A+"
                                    className="glass-input w-full px-3 py-2 text-sm"
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Feedback Comments</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      value={feedbackInput}
                                      onChange={e => setFeedbackInput(e.target.value)}
                                      placeholder="Great job on..."
                                      className="glass-input flex-1 px-3 py-2 text-sm"
                                    />
                                    <button 
                                      onClick={() => setGradingSubmissionId(null)}
                                      className="glass-button-secondary px-4 py-2 text-sm"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={handleSaveGrade}
                                      disabled={isSubmittingGrade || !gradeInput}
                                      className="glass-button bg-teal text-navy-900 px-6 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                                    >
                                      {isSubmittingGrade ? <div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" /> : <Check size={16} />}
                                      Save Grade
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
