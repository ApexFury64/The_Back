"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Brain, Plus, Search, Clock, Trash2, PlusCircle, X, HelpCircle,
  AlertTriangle, Eye, ChevronDown, ChevronUp, Users, TrendingUp,
  CheckCircle2, XCircle, Award, BarChart3, ArrowLeft
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuestionInput {
  question: string;
  options: string[];
  answer: string;
}

export default function TeacherQuizzesPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Review state
  const [reviewQuiz, setReviewQuiz] = useState<any | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("All");

  // New Quiz form state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState("15");
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { question: "", options: ["", "", "", ""], answer: "" }
  ]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to load quizzes");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error loading quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleOpenReview = async (quiz: any) => {
    setReviewLoading(true);
    setReviewQuiz(null);
    setActiveSection("All");
    setExpandedStudent(null);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/attempts`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setReviewQuiz(data);
    } catch {
      toast.error("Failed to load quiz review");
    } finally {
      setReviewLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getSubjectName = (q: any): string => {
    const s = q.subject;
    if (!s) return "General";
    return typeof s === "string" ? s : (s?.name ?? "General");
  };

  const getQuestionCount = (q: any): number =>
    q._count?.questions ?? q.questions ?? 0;

  const getScoreColor = (score: number) =>
    score >= 90 ? "text-teal" : score >= 60 ? "text-amber" : "text-coral";

  const getScoreBg = (score: number) =>
    score >= 90 ? "bg-teal/10 border-teal/20" : score >= 60 ? "bg-amber/10 border-amber/20" : "bg-coral/10 border-coral/20";

  // ── Question builder handlers ─────────────────────────────────────────────
  const handleAddQuestion = () =>
    setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: "" }]);

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) { toast.error("A quiz must have at least one question."); return; }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const u = [...questions]; u[index].question = value; setQuestions(u);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const u = [...questions];
    if (u[qIndex].answer === u[qIndex].options[optIndex]) u[qIndex].answer = value;
    u[qIndex].options[optIndex] = value;
    setQuestions(u);
  };

  const handleSelectAnswer = (qIndex: number, value: string) => {
    const u = [...questions]; u[qIndex].answer = value; setQuestions(u);
  };

  // ── Create quiz ───────────────────────────────────────────────────────────
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) { toast.error("Please provide a quiz title"); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { toast.error(`Fill in Question ${i + 1}`); return; }
      if (q.options.some(o => !o.trim())) { toast.error(`Fill all options for Q${i + 1}`); return; }
      if (!q.answer) { toast.error(`Select the correct answer for Q${i + 1}`); return; }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: quizTitle, duration: parseInt(quizDuration) || 15, questions: questions.map(q => ({ question: q.question, options: q.options, answer: q.answer })) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Quiz created! Students can now attempt it.");
        setIsModalOpen(false);
        setQuizTitle(""); setQuizDuration("15");
        setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
        fetchQuizzes();
      } else {
        toast.error(data.error || "Failed to create quiz");
      }
    } catch { toast.error("Network error"); }
    finally { setSubmitting(false); }
  };

  // ── Delete quiz ───────────────────────────────────────────────────────────
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz? This cannot be undone.")) return;
    setDeletingId(quizId);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Quiz deleted"); setQuizzes(prev => prev.filter(q => q.id !== quizId)); }
      else { const d = await res.json().catch(() => ({})); toast.error(d.error || "Failed to delete"); }
    } catch { toast.error("Network error"); }
    finally { setDeletingId(null); }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredQuizzes = quizzes.filter(q =>
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Review: section filter ────────────────────────────────────────────────
  const reviewSections = reviewQuiz
    ? ["All", ...Array.from(new Set(reviewQuiz.attempts.map((a: any) => a.student.className)))] as string[]
    : ["All"];

  const filteredAttempts = reviewQuiz?.attempts.filter((a: any) =>
    activeSection === "All" || a.student.className === activeSection
  ) ?? [];

  // ── REVIEW PANEL ──────────────────────────────────────────────────────────
  if (reviewQuiz !== null || reviewLoading) {
    return (
      <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"}
        pageTitle="Quiz Review" pageSubtitle={reviewQuiz?.title ?? "Loading..."}>
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setReviewQuiz(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Quizzes
          </button>

          {reviewLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Attempts", value: reviewQuiz.totalAttempts, icon: Users, color: "text-teal", bg: "bg-teal/10" },
                  { label: "Avg Score", value: `${reviewQuiz.stats.avgScore}%`, icon: BarChart3, color: "text-amber", bg: "bg-amber/10" },
                  { label: "High Score", value: `${reviewQuiz.stats.highScore}%`, icon: Award, color: "text-teal", bg: "bg-teal/10" },
                  { label: "Pass Rate", value: reviewQuiz.totalAttempts > 0 ? `${Math.round((reviewQuiz.stats.passCount / reviewQuiz.totalAttempts) * 100)}%` : "—", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
                ].map(stat => (
                  <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Student attempts */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="glass-card-static p-5 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <Users size={17} className="text-teal" /> Student Results
                      </h3>
                      {/* Section filter */}
                      <div className="flex gap-2 flex-wrap">
                        {reviewSections.map(sec => (
                          <button
                            key={sec}
                            onClick={() => setActiveSection(sec)}
                            className={cn(
                              "px-3 py-1 rounded-lg text-xs font-medium transition-all border",
                              activeSection === sec
                                ? "bg-teal/15 border-teal/40 text-teal"
                                : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                            )}
                          >
                            {sec}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredAttempts.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <Users size={32} className="mx-auto mb-3 opacity-20" />
                        <p>No attempts yet{activeSection !== "All" ? ` from ${activeSection}` : ""}.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredAttempts.map((attempt: any, i: number) => (
                          <motion.div
                            key={attempt.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <button
                              onClick={() => setExpandedStudent(expandedStudent === attempt.id ? null : attempt.id)}
                              className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors flex items-center justify-between gap-3 text-left"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold">
                                  {attempt.student.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{attempt.student.name}</p>
                                  <p className="text-xs text-muted-foreground">{attempt.student.className} · {new Date(attempt.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={cn("text-lg font-bold", getScoreColor(attempt.score))}>
                                  {attempt.score}%
                                </span>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", getScoreBg(attempt.score), getScoreColor(attempt.score))}>
                                  {attempt.score >= 90 ? "Excellent" : attempt.score >= 60 ? "Pass" : "Fail"}
                                </span>
                                {expandedStudent === attempt.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                              </div>
                            </button>

                            <AnimatePresence>
                              {expandedStudent === attempt.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-1 ml-4 p-4 rounded-xl bg-white/3 border border-white/5 space-y-2">
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                      <div className="bg-white/5 rounded-lg p-2">
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="font-medium truncate">{attempt.student.email}</p>
                                      </div>
                                      <div className="bg-white/5 rounded-lg p-2">
                                        <p className="text-muted-foreground">Class</p>
                                        <p className="font-medium">{attempt.student.className}</p>
                                      </div>
                                      <div className="bg-white/5 rounded-lg p-2">
                                        <p className="text-muted-foreground">Score</p>
                                        <p className={cn("font-bold text-base", getScoreColor(attempt.score))}>{attempt.score}%</p>
                                      </div>
                                      <div className="bg-white/5 rounded-lg p-2">
                                        <p className="text-muted-foreground">Correct</p>
                                        <p className="font-medium">
                                          ~{Math.round((attempt.score / 100) * reviewQuiz.totalQuestions)} / {reviewQuiz.totalQuestions}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Submitted: {new Date(attempt.submittedAt).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Quiz Questions + Answers */}
                <div className="lg:col-span-2">
                  <div className="glass-card-static p-5 rounded-2xl sticky top-4">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <HelpCircle size={17} className="text-amber" />
                      Questions & Answers
                      <span className="text-xs text-muted-foreground font-normal">({reviewQuiz.totalQuestions})</span>
                    </h3>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                      {reviewQuiz.questions.map((q: any, i: number) => (
                        <div key={q.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                          <p className="text-xs font-bold text-muted-foreground">Q{i + 1}</p>
                          <p className="text-sm font-medium leading-snug">{q.text}</p>
                          <div className="space-y-1.5 mt-2">
                            {q.options.map((opt: string, idx: number) => {
                              const isCorrect = opt === q.answer;
                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border",
                                    isCorrect
                                      ? "bg-teal/10 border-teal/30 text-teal font-semibold"
                                      : "bg-white/3 border-white/5 text-muted-foreground"
                                  )}
                                >
                                  {isCorrect
                                    ? <CheckCircle2 size={12} className="shrink-0 text-teal" />
                                    : <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" />
                                  }
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ── QUIZ LIST VIEW ────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      role="teacher"
      userName={userName || "Teacher"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Quizzes & Assessments"
      pageSubtitle="Create quizzes and review student performance"
    >
      <div className="glass-card-static p-6 rounded-2xl">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="glass-input pl-10 pr-4 py-2 w-full text-sm"
            />
          </div>
          <button
            onClick={() => { setIsModalOpen(true); }}
            className="glass-button px-4 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center bg-teal text-navy-900 border-none font-semibold"
          >
            <Plus size={16} /> Create Quiz
          </button>
        </div>

        {/* Quiz List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="w-7 h-7 border-2 border-teal rounded-full animate-spin border-t-transparent" />
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground border border-dashed border-white/10 rounded-xl">
              <Brain size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No quizzes found.</p>
              <p className="text-sm mt-1 opacity-70">Create a quiz to get started.</p>
            </div>
          ) : (
            filteredQuizzes.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-teal/10 text-teal">
                    <Brain size={19} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm group-hover:text-teal transition-colors">{q.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="bg-white/5 px-2 py-0.5 rounded font-medium">{getSubjectName(q)}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {q.duration} min</span>
                      <span className="flex items-center gap-1"><HelpCircle size={11} /> {getQuestionCount(q)} Qs</span>
                      <span className="flex items-center gap-1"><Users size={11} />
                        {Array.isArray(q.attempts) ? q.attempts.length : 0} attempts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenReview(q)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-teal/10 hover:border-teal/20 hover:text-teal transition-all"
                  >
                    <Eye size={13} /> Review
                  </button>
                  <span className="text-xs text-teal bg-teal/10 px-3 py-1.5 rounded-lg border border-teal/20">Active</span>
                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    disabled={deletingId === q.id}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-coral transition-colors disabled:opacity-40"
                    title="Delete quiz"
                  >
                    {deletingId === q.id
                      ? <div className="w-4 h-4 border-2 border-coral/40 border-t-coral rounded-full animate-spin" />
                      : <Trash2 size={15} />
                    }
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ── CREATE QUIZ MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-navy-900/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="glass-card w-full max-w-2xl rounded-2xl border border-white/10 mb-8 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div>
                  <h3 className="text-lg font-bold">Create New Quiz</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Build questions and mark correct answers</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateQuiz}>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Quiz Title *</label>
                      <input type="text" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. Chapter 1 Algebra Review" className="glass-input w-full px-4 py-2.5 text-sm" required />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Duration (mins)</label>
                      <input type="number" value={quizDuration} onChange={e => setQuizDuration(e.target.value)} className="glass-input w-full px-4 py-2.5 text-sm" min="1" max="180" required />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="font-bold text-sm text-teal">Questions ({questions.length})</h4>
                      <button type="button" onClick={handleAddQuestion} className="flex items-center gap-1.5 text-xs text-teal hover:underline">
                        <PlusCircle size={13} /> Add Question
                      </button>
                    </div>

                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground">Q{qIndex + 1}</span>
                          {questions.length > 1 && (
                            <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="p-1 hover:bg-red-500/10 text-muted-foreground hover:text-coral rounded transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <input type="text" value={q.question} onChange={e => handleQuestionChange(qIndex, e.target.value)} placeholder="Type your question here..." className="glass-input w-full px-4 py-2 text-sm" required />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input type="radio" name={`correct-${qIndex}`} checked={q.answer !== "" && q.answer === opt} onChange={() => handleSelectAnswer(qIndex, opt)} disabled={!opt.trim()} className="shrink-0 accent-teal cursor-pointer" title="Mark as correct answer" />
                              <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} className="glass-input w-full px-3 py-1.5 text-xs" required />
                            </div>
                          ))}
                        </div>
                        {q.answer ? (
                          <p className="text-[10px] text-teal font-medium">✓ Correct: "{q.answer}"</p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <AlertTriangle size={10} /> Click radio to mark the correct answer
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 glass-button px-4 py-2.5 text-sm justify-center bg-teal text-navy-900 font-semibold border-none disabled:opacity-50">
                    {submitting ? "Saving..." : "Save Quiz"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
