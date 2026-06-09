"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Brain, Plus, Search, Clock, Trash2, PlusCircle, X, HelpCircle, AlertTriangle
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getSubjectName = (q: any): string => {
    const s = q.subject;
    if (!s) return "General";
    return typeof s === "string" ? s : (s?.name ?? "General");
  };

  const getQuestionCount = (q: any): number =>
    q._count?.questions ?? q.questions ?? 0;

  // ── Question builder handlers ─────────────────────────────────────────────
  const handleAddQuestion = () =>
    setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: "" }]);

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("A quiz must have at least one question.");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    // If the old option text was the selected answer, update answer too
    if (updated[qIndex].answer === updated[qIndex].options[optIndex]) {
      updated[qIndex].answer = value;
    }
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSelectAnswer = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].answer = value;
    setQuestions(updated);
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
        body: JSON.stringify({
          title: quizTitle,
          duration: parseInt(quizDuration) || 15,
          questions: questions.map(q => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Quiz created successfully! Students can now attempt it.");
        setIsModalOpen(false);
        resetForm();
        fetchQuizzes();
      } else {
        toast.error(data.error || "Failed to create quiz");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setQuizTitle("");
    setQuizDuration("15");
    setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
  };

  // ── Delete quiz ───────────────────────────────────────────────────────────
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This cannot be undone.")) return;
    setDeletingId(quizId);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Quiz deleted");
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Failed to delete quiz");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredQuizzes = quizzes.filter(q =>
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      role="teacher"
      userName={userName || "Teacher"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Quizzes & Assessments"
      pageSubtitle="Design and assign quizzes to measure class comprehension"
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
            onClick={() => { resetForm(); setIsModalOpen(true); }}
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
              <p className="text-sm mt-1 opacity-70">Create a new quiz to get started.</p>
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
                    <h4 className="font-semibold text-sm group-hover:text-teal transition-colors">
                      {q.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="bg-white/5 px-2 py-0.5 rounded font-medium">
                        {getSubjectName(q)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {q.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle size={11} /> {getQuestionCount(q)} questions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-teal bg-teal/10 px-3 py-1.5 rounded-lg border border-teal/20">
                    Active
                  </span>
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
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div>
                  <h3 className="text-lg font-bold">Create New Quiz</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Build questions and set the correct answers
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateQuiz}>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                  {/* Meta */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
                        Quiz Title *
                      </label>
                      <input
                        type="text"
                        value={quizTitle}
                        onChange={e => setQuizTitle(e.target.value)}
                        placeholder="e.g. Chapter 1 Algebra Review"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
                        Duration (mins)
                      </label>
                      <input
                        type="number"
                        value={quizDuration}
                        onChange={e => setQuizDuration(e.target.value)}
                        className="glass-input w-full px-4 py-2.5 text-sm"
                        min="1"
                        max="180"
                        required
                      />
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="font-bold text-sm text-teal">
                        Questions ({questions.length})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="flex items-center gap-1.5 text-xs text-teal hover:underline"
                      >
                        <PlusCircle size={13} /> Add Question
                      </button>
                    </div>

                    {questions.map((q, qIndex) => (
                      <div
                        key={qIndex}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground">
                            Q{qIndex + 1}
                          </span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIndex)}
                              className="p-1 hover:bg-red-500/10 text-muted-foreground hover:text-coral rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Question text */}
                        <input
                          type="text"
                          value={q.question}
                          onChange={e => handleQuestionChange(qIndex, e.target.value)}
                          placeholder="Type your question here..."
                          className="glass-input w-full px-4 py-2 text-sm"
                          required
                        />

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.answer !== "" && q.answer === opt}
                                onChange={() => handleSelectAnswer(qIndex, opt)}
                                disabled={!opt.trim()}
                                className="shrink-0 accent-teal cursor-pointer"
                                title="Mark as correct answer"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="glass-input w-full px-3 py-1.5 text-xs"
                                required
                              />
                            </div>
                          ))}
                        </div>

                        {q.answer ? (
                          <p className="text-[10px] text-teal font-medium">
                            ✓ Correct answer: "{q.answer}"
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Click a radio button to mark the correct answer
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal footer — outside scroll area so always visible */}
                <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 glass-button px-4 py-2.5 text-sm justify-center bg-teal text-navy-900 font-semibold border-none disabled:opacity-50"
                  >
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
