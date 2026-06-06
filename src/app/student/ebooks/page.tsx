"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, PlayCircle, FileText, Sparkles, ChevronRight, HelpCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentEbookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  const [subject, setSubject] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [ebookData, setEbookData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [ebookLoading, setEbookLoading] = useState(false);

  // Parse YouTube video URL to clean embed URL
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      let videoId = "";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      } else {
        return null;
      }
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!subjectId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/syllabus");
        if (!res.ok) throw new Error("Failed to fetch subjects");
        const data = await res.json();
        
        // Find selected subject
        const foundSubject = data.find((s: any) => s.id === subjectId);
        if (foundSubject) {
          setSubject(foundSubject);
          
          // Re-map topics if nested inside modules
          let allSubtopics: any[] = [];
          if (foundSubject.modules) {
            foundSubject.modules.forEach((mod: any) => {
              if (mod.subTopics) {
                allSubtopics.push(...mod.subTopics);
              }
            });
          }
          
          setTopics(allSubtopics);
          
          if (allSubtopics.length > 0) {
            setSelectedTopic(allSubtopics[0]);
          }
        }
      } catch (err) {
        console.error("Error loading subject details:", err);
        toast.error("Failed to load subject eBook details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [subjectId]);

  useEffect(() => {
    const fetchEbookContent = async () => {
      if (!selectedTopic) return;

      setEbookLoading(true);
      try {
        const res = await fetch(`/api/student/ebook?topicId=${selectedTopic.id}`);
        if (res.ok) {
          const data = await res.json();
          setEbookData(data);
        } else {
          setEbookData(null);
        }
      } catch (err) {
        console.error("Error fetching eBook content:", err);
        setEbookData(null);
      } finally {
        setEbookLoading(false);
      }
    };

    fetchEbookContent();
  }, [selectedTopic]);

  if (loading) {
    return (
      <DashboardLayout role="student" userName={userName || "Student"} schoolName={schoolName || "AI Tutor"} pageTitle="Course eBook" pageSubtitle="Loading subject topics...">
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!subject) {
    return (
      <DashboardLayout role="student" userName={userName || "Student"} schoolName={schoolName || "AI Tutor"} pageTitle="Course eBook" pageSubtitle="eBook Reader">
        <div className="glass-card-static p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto mt-12">
          <BookOpen className="text-muted-foreground" size={48} />
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">Subject Not Found</h2>
          <p className="text-muted-foreground text-sm">Please return to the Curriculum Explorer and select a valid subject card to read its eBook.</p>
          <button onClick={() => router.push("/student/subjects")} className="glass-button bg-teal text-navy-900 px-6 py-2 border-none font-semibold">
            Back to Subjects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const embedUrl = ebookData?.ebookVideoUrl ? getYoutubeEmbedUrl(ebookData.ebookVideoUrl) : null;

  return (
    <DashboardLayout
      role="student"
      userName={userName || "Student"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle={`${subject.name} eBook`}
      pageSubtitle={`Class ${subject.standard} • Study guide and lesson modules`}
    >
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.push("/student/subjects")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-navy-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Subjects
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)] min-h-[550px]">
        {/* Left Side: Chapter Navigation Sidebar */}
        <div className="glass-card-static p-4 rounded-2xl flex flex-col h-full overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal mb-4 px-2">Table of Contents</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {topics.map((topic, index) => {
              const isSelected = selectedTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                    isSelected
                      ? "bg-teal/15 border-teal text-teal shadow-md font-semibold"
                      : "bg-black/5 dark:bg-white/3 border-black/5 dark:border-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/5 hover:text-navy-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0",
                      isSelected ? "bg-teal text-navy-900" : "bg-black/5 dark:bg-white/10 text-muted-foreground group-hover:text-navy-900 dark:group-hover:text-white"
                    )}>
                      {index + 1}
                    </span>
                    <span className="text-xs truncate max-w-[170px] text-navy-900 dark:text-white">
                      {topic.title}
                    </span>
                  </div>
                  <ChevronRight size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
            
            {topics.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-10">No chapters found for this subject.</p>
            )}
          </div>
        </div>

        {/* Right Side: Reading Area */}
        <div className="lg:col-span-3 glass-card-static p-6 rounded-2xl flex flex-col h-full overflow-hidden relative">
          {selectedTopic ? (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* Header */}
              <div className="border-b border-black/10 dark:border-white/10 pb-4 mb-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">{selectedTopic.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Lesson Companion &amp; Multimedia</p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 no-scrollbar">
                {ebookLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" />
                    <span className="text-xs text-muted-foreground">Loading eBook resources...</span>
                  </div>
                ) : ebookData?.ebookHtml || embedUrl ? (
                  <div className="space-y-6">
                    {/* Embedded Video Explanation */}
                    {embedUrl && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal flex items-center gap-1.5">
                          <PlayCircle size={14} /> Video Explanation
                        </h4>
                        <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg bg-black">
                          <iframe
                            src={embedUrl}
                            title={`${selectedTopic.title} Explanation Video`}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Lesson Text */}
                    {ebookData?.ebookHtml && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal flex items-center gap-1.5">
                          <FileText size={14} /> Study Guide &amp; Text
                        </h4>
                        <div className="bg-black/5 dark:bg-white/3 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                          <div 
                            className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-navy-900/90 dark:text-white/90"
                            dangerouslySetInnerHTML={{ __html: ebookData.ebookHtml }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-3 text-muted-foreground">
                      <HelpCircle size={20} />
                    </div>
                    <h4 className="text-sm font-semibold text-navy-900 dark:text-white">eBook Pending</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">No eBook or explanation video has been uploaded for this lesson yet. Check back soon or contact your subject teacher.</p>
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
                <h4 className="font-bold text-navy-900 dark:text-white text-base">Course eBook Reader</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Select a lesson from the left chapters sidebar to start reading.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
