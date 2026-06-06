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

  // eBook Editor Modal State
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [selectedTopicForEbook, setSelectedTopicForEbook] = useState<any>(null);
  const [ebookContent, setEbookContent] = useState({ ebookHtml: "", ebookVideoUrl: "" });
  const [isSavingEbook, setIsSavingEbook] = useState(false);

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
    const csvContent = 'title,description,order,icon,ebookHtml,ebookVideoUrl\n' +
      '"Introduction to Algebra","Basic equations and graphing",1,"Sparkles","<h3>1. What is Algebra?</h3><p>Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In its simplest form, algebra involves solving equations where variables stand in for unknown values.</p><h4>Key Concepts</h4><ul><li><b>Variables:</b> Letters like x or y used to represent numbers.</li><li><b>Coefficients:</b> The numbers multiplying the variables.</li></ul>","https://www.youtube.com/watch?v=NybHckSEQBI"\n' +
      '"Linear Functions","Slopes and intercepts",2,"BookOpen","<h3>Linear Equations & Graphs</h3><p>A linear equation is an equation for a straight line. The standard form is y = mx + c, where m is the slope of the line and c is the y-intercept (the point where the line crosses the y-axis).</p>","https://www.youtube.com/watch?v=9_C8pY4c2rc"\n' +
      '"Quadratic Equations","Solving formulas",3,"FileText","<h3>Quadratic Formula</h3><p>A quadratic equation is a second-order polynomial equation in a single variable. The general form is ax² + bx + c = 0. We can solve for x using the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.</p>","https://www.youtube.com/watch?v=i7idZhlqkyw"\n';
      
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "syllabus_ebooks_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("eBook-enabled syllabus template downloaded successfully!");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parseCsvLine = (line: string): string[] => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1) {
          toast.error("CSV file is empty or missing headers");
          return;
        }

        const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
        const titleIndex = headers.indexOf("title");
        if (titleIndex === -1) {
          toast.error("CSV file must contain a 'title' column");
          return;
        }

        const descIndex = headers.indexOf("description");
        const orderIndex = headers.indexOf("order");
        const iconIndex = headers.indexOf("icon");
        const ebookHtmlIndex = headers.indexOf("ebookhtml");
        const ebookVideoUrlIndex = headers.indexOf("ebookvideourl");

        const parsedTopics = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          if (cols[titleIndex]) {
            parsedTopics.push({
              title: cols[titleIndex],
              description: descIndex !== -1 ? cols[descIndex] : "",
              order: orderIndex !== -1 && cols[orderIndex] ? parseInt(cols[orderIndex]) : i,
              icon: iconIndex !== -1 ? cols[iconIndex] : "BookOpen",
              ebookHtml: ebookHtmlIndex !== -1 ? cols[ebookHtmlIndex] : "",
              ebookVideoUrl: ebookVideoUrlIndex !== -1 ? cols[ebookVideoUrlIndex] : ""
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
          toast.success(`Successfully imported ${parsedTopics.length} topics and eBooks!`);
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

  const handleSaveEbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicForEbook) return;

    setIsSavingEbook(true);
    try {
      const res = await fetch("/api/teacher/ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicForEbook.id,
          ebookHtml: ebookContent.ebookHtml,
          ebookVideoUrl: ebookContent.ebookVideoUrl
        })
      });

      if (res.ok) {
        toast.success("eBook content updated successfully!");
        setIsEbookModalOpen(false);
        fetchSubjects();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save eBook content");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setIsSavingEbook(false);
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
        <div className="glass-card-static p-4 rounded-2xl flex flex-col h-full overflow-hidden">
          <h3 className="text-sm font-bold mb-4 text-navy-900 dark:text-white">Your School Subjects</h3>
          
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
                        : "bg-black/5 dark:bg-white/3 border-black/5 dark:border-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/5 hover:text-navy-900 dark:hover:text-white"
                    )}
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-navy-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {subj.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Class {subj.standard} • {subj.code}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded text-navy-900/70 dark:text-slate-300 font-medium">
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
        <div className="lg:col-span-2 glass-card-static p-6 rounded-2xl flex flex-col h-full overflow-hidden relative">
          {selectedSubject ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="border-b border-black/10 dark:border-white/10 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">{selectedSubject.name} Syllabus</h3>
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
                    className="p-4 bg-black/5 dark:bg-white/3 border border-black/5 dark:border-white/5 rounded-xl flex items-center justify-between hover:border-teal/20 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-teal/15 text-teal flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {topic.order || (idx + 1)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-navy-900 dark:text-white">{topic.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{topic.description || "No description provided."}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedTopicForEbook(topic);
                          setEbookContent({
                            ebookHtml: topic.ebookHtml || "",
                            ebookVideoUrl: topic.ebookVideoUrl || ""
                          });
                          setIsEbookModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-teal/15 text-muted-foreground hover:text-teal transition-colors"
                        title="Manage eBook Content"
                      >
                        <BookOpen size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="p-1.5 rounded-lg hover:bg-coral/10 text-muted-foreground hover:text-coral transition-colors"
                        title="Delete Topic"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                {(!selectedSubject.topics || selectedSubject.topics.length === 0) && (
                  <div className="text-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center">
                    <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-3 text-muted-foreground">
                      <FileText size={20} />
                    </div>
                    <h4 className="text-sm font-semibold text-navy-900 dark:text-white">Syllabus is empty</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">No topics have been added yet. Click Add Topic, or download the template and import via CSV to set up the subject syllabus.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4">
              <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-muted-foreground">
                <BookOpen size={30} />
              </div>
              <div>
                <h4 className="font-bold text-navy-900 dark:text-white text-base">Syllabus Editor</h4>
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
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-black/10 dark:border-white/10"
          >
            <h3 className="text-lg font-bold mb-4 text-navy-900 dark:text-white">Add Topic to Syllabus</h3>
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
                    className="glass-input w-full px-4 py-2 text-sm bg-white dark:bg-navy-900 text-navy-900 dark:text-white border border-black/10 dark:border-white/10"
                  >
                    <option value="BookOpen">BookOpen</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="FileText">FileText</option>
                    <option value="Target">Target</option>
                    <option value="Trophy">Trophy</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium text-navy-900 dark:text-white"
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

      {/* EBOOK EDIT MODAL */}
      {isEbookModalOpen && selectedTopicForEbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-2xl p-6 rounded-2xl border border-black/10 dark:border-white/10"
          >
            <h3 className="text-lg font-bold mb-1 text-navy-900 dark:text-white">Manage eBook: {selectedTopicForEbook.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">Add lesson text, inline HTML (supporting text/images), and a YouTube explanation video.</p>
            <form onSubmit={handleSaveEbookSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">YouTube Explanation Video URL</label>
                <input
                  type="url"
                  value={ebookContent.ebookVideoUrl}
                  onChange={e => setEbookContent({ ...ebookContent, ebookVideoUrl: e.target.value })}
                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="glass-input w-full px-4 py-2 text-sm"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-muted-foreground font-medium block">eBook Content (HTML Format)</label>
                  <span className="text-[10px] text-teal-800 dark:text-teal font-medium">Supports inline HTML, &lt;img&gt;, &lt;p&gt;, &lt;h3&gt;, etc.</span>
                </div>
                <textarea
                  value={ebookContent.ebookHtml}
                  onChange={e => setEbookContent({ ...ebookContent, ebookHtml: e.target.value })}
                  placeholder="<h3>1. Overview</h3><p>Enter the text and content here...</p>"
                  className="glass-input w-full px-4 py-3 text-sm min-h-[280px] font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEbookModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium text-navy-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEbook}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center bg-teal border-none text-navy-900 font-semibold disabled:opacity-50"
                >
                  {isSavingEbook ? "Saving..." : "Save eBook"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
