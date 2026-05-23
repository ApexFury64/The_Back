"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, UploadCloud, CheckCircle, X, Check } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const USER_ID = "cuid-arjun"; // Ideally fetched from auth

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeSubject, setActiveSubject] = useState("All");

  // Assignment Modal State
  const [activeAssignment, setActiveAssignment] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [comments, setComments] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // In our seed, we didn't specify the user's ID, but we created a user with email arjun@techwing.com.
    // We should fetch the user first, or we just pass the email or a known ID.
    // For this prototype, I'll fetch all assignments and we'll just query submissions via the user's ID.
    // Let's first fetch the user to get their ID.
    const fetchAssignments = async () => {
      // Actually we don't have an api for user, let's just fetch all assignments
      // For a prototype, passing a hardcoded ID works if it matches. But we don't know the exact CUID.
      // We will update the API to accept userEmail later if needed, or just fetch without userId 
      // and let the submit use the email.
      // Wait, we need userId for GET /api/assignments?userId=...
      // Let's just fetch all assignments without userId for now and assume they are pending if no submissions.
      const res = await fetch('/api/assignments?userEmail=arjun@techwing.com');
      const data = await res.json();
      setAssignments(data);
      setLoading(false);
    };
    fetchAssignments();
  }, []);

  const handleStartSubmit = (assignment: any) => {
    setActiveAssignment(assignment);
    setSubmitSuccess(false);
    setComments("");
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!file || !activeAssignment) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', activeAssignment.id);
    formData.append('comments', comments);
    
    // Hack: We don't have the exact CUID of the user in the UI, 
    // so we'll just send the email and update the API to resolve the CUID from the email.
    formData.append('userEmail', 'arjun@techwing.com');

    try {
      const res = await fetch('/api/assignments/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setSubmitSuccess(true);
        // Refresh assignments
        const aRes = await fetch('/api/assignments?userEmail=arjun@techwing.com');
        const aData = await aRes.json();
        setAssignments(aData);
        
        setTimeout(() => {
          setActiveAssignment(null);
        }, 2000);
      }
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjects = ["All", ...Array.from(new Set(assignments.map(a => a.subject?.name).filter(Boolean)))];
  const filteredAssignments = activeSubject === "All" ? assignments : assignments.filter(a => a.subject?.name === activeSubject);

  if (loading) return (
    <DashboardLayout role="student" userName="Arjun Reddy" schoolName="Class 7-B" pageTitle="Assignments" pageSubtitle="Loading...">
      <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      role="student"
      userName="Arjun Reddy"
      schoolName="Class 7-B • Delhi Public School"
      pageTitle="Assignments"
      pageSubtitle="Manage and submit your coursework"
    >
      <div className="space-y-6">
        
        {/* Subject Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {subjects.map(subject => (
            <button
              key={subject as string}
              onClick={() => setActiveSubject(subject as string)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                activeSubject === subject 
                  ? "bg-white text-navy-900" 
                  : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5"
              )}
            >
              {subject as string}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredAssignments.map((assignment, i) => {
              const status = assignment.submissions && assignment.submissions.length > 0 ? "submitted" : "pending";
              
              return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1"
                    style={{ backgroundColor: `${assignment.subject?.color || '#fff'}20`, color: assignment.subject?.color || '#fff' }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assignment.subject?.color || '#fff' }} />
                        {assignment.subject?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto flex flex-col items-end gap-2">
                  {status === "pending" ? (
                    <button 
                      onClick={() => handleStartSubmit(assignment)}
                      className="glass-button w-full sm:w-auto text-sm py-2 hover:bg-teal hover:text-white transition-colors"
                    >
                      Submit Work
                    </button>
                  ) : (
                    <span className="badge-amber flex items-center gap-1">
                      <UploadCloud size={12} /> In Review
                    </span>
                  )}
                </div>
              </motion.div>
            )})}
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <div className="glass-card-static p-6">
              <h3 className="font-bold mb-4">Submission Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-bold text-teal">94%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card-static p-6 bg-gradient-to-br from-teal/10 to-transparent border-teal/20">
              <h3 className="font-bold text-teal mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4 text-balance">
                Stuck on an assignment? Your AI Tutor can help break down complex problems without giving away the final answer.
              </p>
              <button 
                onClick={() => router.push('/student/ai-tutor')}
                className="glass-button-secondary w-full text-sm hover:bg-white/10"
              >
                Ask AI Tutor
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Assignment Submit Modal */}
      <AnimatePresence>
        {activeAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl border-white/20"
            >
              {submitSuccess ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="w-20 h-20 rounded-full bg-teal/20 text-teal flex items-center justify-center mb-6"
                  >
                    <Check size={40} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Assignment Submitted!</h2>
                  <p className="text-muted-foreground mb-6">Your file has been securely uploaded to the server.</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div>
                      <h2 className="text-xl font-bold">Submit Assignment</h2>
                      <p className="text-sm text-muted-foreground mt-1">{activeAssignment.title}</p>
                    </div>
                    <button 
                      onClick={() => setActiveAssignment(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                        file 
                          ? "border-teal/50 bg-teal/5" 
                          : "border-white/20 hover:bg-white/5 hover:border-white/40"
                      )}
                    >
                      {file ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center text-teal">
                            <FileText size={20} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-teal">{file.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground">
                            <UploadCloud size={20} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Click to upload actual file</p>
                            <p className="text-[10px] text-muted-foreground mt-1">PDF, DOCX, Images will be saved to server</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Comments (Optional)</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="glass-input w-full p-3 h-24 resize-none text-sm"
                        placeholder="Add a note for your teacher..."
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between">
                    <button 
                      onClick={() => setActiveAssignment(null)}
                      className="px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitAssignment}
                      disabled={!file || isSubmitting}
                      className="glass-button bg-teal hover:bg-teal/90 text-navy-900 px-8 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                      ) : (
                        "Upload & Submit"
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
