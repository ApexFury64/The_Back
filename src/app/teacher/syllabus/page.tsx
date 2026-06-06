"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppStore } from "@/lib/store";
import { BookOpen, Upload, Download, Plus, Trash2, ArrowRight, FileText, ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherSyllabusPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add Topic Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    order: "",
    icon: "BookOpen"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/teacher/syllabus");
      const data = await res.json();
      if (data.subjects) {
        setSubjects(data.subjects);
        // Sync selected subject if active
        if (selectedSubject) {
          const updated = data.subjects.find((s: any) => s.id === selectedSubject.id);
          if (updated) setSelectedSubject(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSelectSubject = (subj: any) => {
    setSelectedSubject(subj);
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,title,description,order,icon\nIntroduction to Algebra,Equations and graphing,1,Sparkles\nLinear Functions,Slopes and intercepts,2,BookOpen\nQuadratic Equations,Solving equations and formulas,3,FileText\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "syllabus_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Syllabus template downloaded successfully!");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1) {
          toast.error("CSV file is empty or missing headers");
          return;
        }

        const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
        const titleIndex = headers.indexOf("title");
        if (titleIndex === -1) {
          toast.error("CSV file must contain a 'title' column");
          return;
        }

        const descIndex = headers.indexOf("description");
        const orderIndex = headers.indexOf("order");
        const iconIndex = headers.indexOf("icon");

        const parsedTopics = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim());
          if (cols[titleIndex]) {
            parsedTopics.push({
              title: cols[titleIndex],
              description: descIndex !== -1 ? cols[descIndex] : "",
              order: orderIndex !== -1 && cols[orderIndex] ? parseInt(cols[orderIndex]) : i,
              icon: iconIndex !== -1 ? cols[iconIndex] : "BookOpen"
            });
          }
        }

        if (parsedTopics.length === 0) {
          toast.error("No valid topics found in CSV");
          return;
        }

        const res = await fetch("/api/teacher/syllabus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: selectedSubject.id,
            topics: parsedTopics,
            clearExisting: true
          })
        });

        if (res.ok) {
          toast.success(`Successfully imported ${parsedTopics.length} topics!`);
          fetchSubjects();
        } else {
          const err = await res.json();
          toast.error(err.error || "Failed to import syllabus");
        }
      } catch (err) {
        console.error("Error reading CSV:", err);
        toast.error("Error parsing CSV file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAddTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title) {
      toast.error("Topic Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        subjectId: selectedSubject.id,
        topics: [{
          title: newTopic.title,
          description: newTopic.description,
          order: newTopic.order ? parseInt(newTopic.order) : undefined,
          icon: newTopic.icon
        }],
        clearExisting: false
      };

      const res = await fetch("/api/teacher/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Topic added to syllabus!");
        setIsAddModalOpen(false);
        setNewTopic({ title: "", description: "", order: "", icon: "BookOpen" });
        fetchSubjects();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add topic");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic from the syllabus?")) return;

    try {
      const res = await fetch(`/api/teacher/syllabus?topicId=${topicId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast.success("Topic deleted successfully!");
        fetchSubjects();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete topic");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  return (
    <DashboardLayout
      role="teacher"
      userName={userName || "Teacher"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Syllabus Management"
      pageSubtitle="Configure syllabus subjects, topics, and chapters"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
        {/* Left Side: Subjects List */}
        <div className="glass-card-static p-4 rounded-2xl flex flex-col h-full overflow-hidden border border-white/5 bg-white/5">
          <h3 className="text-sm font-bold mb-4 text-white">Your School Subjects</h3>
          
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="w-6 h-6 border-2 border-teal rounded-full animate-spin border-t-transparent" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {subjects.map((subj) => {
                const isSelected = selectedSubject?.id === subj.id;
                return (
                  <button
                    key={subj.id}
                    onClick={() => handleSelectSubject(subj)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                      isSelected
                        ? "bg-teal/15 border-teal text-teal shadow-md"
                        : "bg-white/3 border-white/5 text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-white group-hover:text-teal-400 transition-colors">
                        {subj.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Class {subj.standard} • {subj.code}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-medium">
                        {subj.topics?.length || 0} topics
                      </span>
                      <ChevronRight size={14} className="text-muted-foreground opacity-60" />
                    </div>
                  </button>
                );
              })}
              {subjects.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-10">No subjects found in school.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Topics List & Syllabus Management */}
        <div className="lg:col-span-2 glass-card-static p-6 rounded-2xl flex flex-col h-full overflow-hidden border border-white/5 bg-white/5 relative">
          {selectedSubject ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="border-b border-white/10 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedSubject.name} Syllabus</h3>
                  <p className="text-xs text-muted-foreground">Class {selectedSubject.standard} • {selectedSubject.code}</p>
                </div>
                
                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportCSV}
                    accept=".csv"
                    className="hidden"
                  />
                  <button
                    onClick={downloadTemplate}
                    className="glass-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Download size={14} /> Template
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-teal/40 text-teal hover:bg-teal/5"
                  >
                    <Upload size={14} /> Import CSV
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="glass-button py-1.5 px-3 text-xs flex items-center gap-1.5 bg-teal border-none text-navy-900 font-semibold"
                  >
                    <Plus size={14} /> Add Topic
                  </button>
                </div>
              </div>

              {/* Topics Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {selectedSubject.topics?.map((topic: any, idx: number) => (
                  <div
                    key={topic.id}
                    className="p-4 bg-white/3 border border-white/5 rounded-xl flex items-center justify-between hover:border-teal/20 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-teal/15 text-teal flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {topic.order || (idx + 1)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white">{topic.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{topic.description || "No description provided."}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="p-1.5 rounded-lg hover:bg-coral/10 text-muted-foreground hover:text-coral transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {(!selectedSubject.topics || selectedSubject.topics.length === 0) && (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-muted-foreground">
                      <FileText size={20} />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Syllabus is empty</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">No topics have been added yet. Click Add Topic, or download the template and import via CSV to set up the subject syllabus.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground">
                <BookOpen size={30} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Syllabus Editor</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Select a subject from the left panel to load and configure its syllabus topics.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD TOPIC MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10"
          >
            <h3 className="text-lg font-bold mb-4 text-white">Add Topic to Syllabus</h3>
            <form onSubmit={handleAddTopicSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Topic Title</label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
                  placeholder="e.g. Limits and Continuity"
                  className="glass-input w-full px-4 py-2 text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label>
                <textarea
                  value={newTopic.description}
                  onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
                  placeholder="Brief description of topics covered"
                  className="glass-input w-full px-4 py-2 text-sm min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Order / Sequence No.</label>
                  <input
                    type="number"
                    value={newTopic.order}
                    onChange={e => setNewTopic({ ...newTopic, order: e.target.value })}
                    placeholder="e.g. 1"
                    className="glass-input w-full px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Topic Icon</label>
                  <select
                    value={newTopic.icon}
                    onChange={e => setNewTopic({ ...newTopic, icon: e.target.value })}
                    className="glass-input w-full px-4 py-2 text-sm bg-navy-900"
                  >
                    <option value="BookOpen">BookOpen</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="FileText">FileText</option>
                    <option value="Target">Target</option>
                    <option value="Trophy">Trophy</option>
                  </select>
                </div>
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
                  disabled={isSubmitting}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center bg-teal border-none text-navy-900 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Topic"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
