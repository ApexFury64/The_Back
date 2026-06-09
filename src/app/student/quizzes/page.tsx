"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle, Clock, AlertCircle, PlayCircle, X, Check, ChevronRight, Filter } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function StudentQuizzesPage() {
  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  // Filter state — simple status filter (All / Pending / Completed)
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed">("All");

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizData, setQuizData] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState<any | null>(null);

  // Fetch quizzes
  const { data: rawQuizzes, isLoading: loading, isError, refetch } = useQuery<any[]>({
    queryKey: ["studentQuizzes", userEmail],
    queryFn: async () => {
      const res = await fetch("/api/quizzes");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load quizzes");
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000,
    retry: 1,
  });

  const quizzes: any[] = rawQuizzes ?? [];

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getSubjectName = (q: any): string => {
    const subj = q.subject;
    if (!subj) return "General";
    return typeof subj === "string" ? subj : (subj?.name ?? "General");
  };

  const isPending = (q: any) => !q.attempts || q.attempts.length === 0;
  const isCompleted = (q: any) => q.attempts && q.attempts.length > 0;

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredQuizzes =
    statusFilter === "All"
      ? quizzes
      : statusFilter === "Pending"
      ? quizzes.filter(isPending)
      : quizzes.filter(isCompleted);

  const pendingQuizzes = filteredQuizzes.filter(isPending);
  const completedQuizzes = filteredQuizzes.filter(isCompleted);

  // ── Quiz Actions ──────────────────────────────────────────────────────────
  const handleStartQuiz = async (quiz: any) => {
    setActiveQuiz(quiz);
    setQuizSuccess(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuizData(null);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`);
      if (!res.ok) throw new Error("Failed to load quiz");
      const data = await res.json();
      setQuizData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(c => c + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: activeQuiz.id, answers }),
      });
      const result = await res.json();
      setIsSubmitting(false);
      setQuizSuccess(result);
      refetch();
      setTimeout(() => setActiveQuiz(null), 4000);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  // ── Early returns ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout role="student" userName={userName || "Student"} schoolName={schoolName || "AI Tutor"} pageTitle="AI Quizzes" pageSubtitle="Loading your quizzes...">
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="student" userName={userName || "Student"} schoolName={schoolName || "AI Tutor"} pageTitle="AI Quizzes" pageSubtitle="">
        <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center">
            <AlertCircle size={32} className="text-coral" />
          </div>
          <h3 className="text-xl font-bold">Could not load quizzes</h3>
          <p className="text-muted-foreground max-w-sm">
            There was a problem fetching your quizzes. Please make sure you are logged in and try again.
          </p>
          <button onClick={() => refetch()} className="glass-button px-6 py-2.5">
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  // options is already a parsed array from the API; handle both cases defensively
  const currentOptions: string[] = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options
    : typeof currentQuestion?.options === "string"
    ? (() => { try { return JSON.parse(currentQuestion.options); } catch { return []; } })()
    : [];

  return (
    <DashboardLayout
      role="student"
      userName={userName || "Student"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="AI Quizzes"
      pageSubtitle="Test your knowledge with AI-powered assessments"
    >
      <div className="space-y-8">

        {/* ── Filter Bar ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Filter:</span>
            {(["All", "Pending", "Completed"] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
                  statusFilter === status
                    ? status === "Pending"
                      ? "bg-coral/15 border-coral/40 text-coral"
                      : status === "Completed"
                      ? "bg-teal/15 border-teal/40 text-teal"
                      : "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
              >
                {status}
                {status === "Pending" && quizzes.filter(isPending).length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-coral/20 text-coral px-1.5 py-0.5 rounded-full font-bold">
                    {quizzes.filter(isPending).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} available
          </p>
        </div>

        {/* ── Empty State ────────────────────────────────────────────────── */}
        {quizzes.length === 0 && (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Brain size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No Quizzes Yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your teacher hasn't assigned any quizzes yet. Check back later!
            </p>
          </div>
        )}

        {/* ── Pending Quizzes ────────────────────────────────────────────── */}
        {(statusFilter === "All" || statusFilter === "Pending") && pendingQuizzes.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-coral" />
              Action Required
              <span className="text-sm font-normal text-muted-foreground">({pendingQuizzes.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingQuizzes.map((quiz: any, i: number) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card p-5 border-l-4 border-l-coral flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-red-700 dark:text-coral bg-red-50 dark:bg-coral/10 px-2 py-0.5 rounded-full">
                        {getSubjectName(quiz)}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Clock size={11} /> {quiz.timeLimit || quiz.duration}m
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber">
                        {quiz.difficulty || "Medium"}
                      </span>
                    </div>
                    <h4 className="font-semibold text-base text-navy-900 dark:text-white leading-snug truncate">
                      {quiz.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quiz._count?.questions ?? quiz.questions ?? 0} Questions
                    </p>
                  </div>
                  <div className="flex items-center sm:items-end shrink-0">
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="glass-button w-full sm:w-auto flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 dark:bg-coral dark:hover:bg-coral/90 text-white border-0 text-sm"
                    >
                      <PlayCircle size={15} /> Start Quiz
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Completed Quizzes ──────────────────────────────────────────── */}
        {(statusFilter === "All" || statusFilter === "Completed") && completedQuizzes.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-teal-600 dark:text-teal" />
              Completed
              <span className="text-sm font-normal text-muted-foreground">({completedQuizzes.length})</span>
            </h3>
            <div className="glass-card-static overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Quiz</th>
                      <th className="px-6 py-4 font-semibold">Subject</th>
                      <th className="px-6 py-4 font-semibold">Questions</th>
                      <th className="px-6 py-4 font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {completedQuizzes.map((quiz: any, i: number) => {
                      const score = quiz.attempts?.[0]?.score ?? 0;
                      return (
                        <motion.tr
                          key={quiz.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-navy-900 dark:text-white">{quiz.title}</td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] bg-black/5 dark:bg-white/10 text-muted-foreground px-2 py-1 rounded-md">
                              {getSubjectName(quiz)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {quiz._count?.questions ?? quiz.questions ?? 0}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "font-bold text-base",
                                score >= 90
                                  ? "text-teal-700 dark:text-teal"
                                  : score >= 70
                                  ? "text-amber-600 dark:text-amber"
                                  : "text-red-600 dark:text-coral"
                              )}
                            >
                              {score}%
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Quiz Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl border-white/20"
            >
              {/* Success screen */}
              {quizSuccess ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-teal/20 text-teal flex items-center justify-center mb-6"
                  >
                    <Check size={40} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Quiz Submitted!</h2>
                  <p className="text-2xl font-bold text-teal mb-1">{quizSuccess.score ?? 0}%</p>
                  <p className="text-muted-foreground mb-6">
                    You got {quizSuccess.correctCount ?? "—"} out of {quizSuccess.totalQuestions ?? "—"} correct.
                  </p>
                  <p className="text-xs text-muted-foreground">Closing automatically…</p>
                </div>
              ) : !quizData ? (
                /* Loading questions */
                <div className="p-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Loading questions…</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                    <div>
                      <h2 className="text-lg font-bold leading-tight">{activeQuiz.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Question {currentQuestionIndex + 1} of {quizData.questions?.length ?? 0}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveQuiz(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-white/10">
                    <div
                      className="h-full bg-teal transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / (quizData.questions?.length ?? 1)) * 100}%` }}
                    />
                  </div>

                  {/* Question body */}
                  <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-5">
                    {currentQuestion && (
                      <div className="space-y-4">
                        <h3 className="text-base font-medium leading-relaxed">
                          {/* Support both 'text' and 'question' field names */}
                          {currentQuestion.text ?? currentQuestion.question}
                        </h3>
                        <div className="space-y-3">
                          {currentOptions.map((option: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setAnswers({ ...answers, [currentQuestion.id]: idx })}
                              className={cn(
                                "w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all",
                                answers[currentQuestion.id] === idx
                                  ? "bg-teal/10 border-teal text-white shadow-[0_0_15px_rgba(45,212,191,0.15)]"
                                  : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20 hover:text-white"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                  answers[currentQuestion.id] === idx ? "border-teal" : "border-white/30"
                                )}
                              >
                                {answers[currentQuestion.id] === idx && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-teal" />
                                )}
                              </div>
                              <span className="leading-relaxed text-sm">{option}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                    <button
                      onClick={() => setActiveQuiz(null)}
                      className="px-5 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium text-muted-foreground hover:text-white"
                    >
                      Cancel
                    </button>
                    {currentQuestionIndex < (quizData.questions?.length ?? 0) - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        disabled={answers[currentQuestion?.id] === undefined}
                        className="glass-button bg-white hover:bg-white/90 text-navy-900 px-7 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold"
                      >
                        Next <ChevronRight size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={answers[currentQuestion?.id] === undefined || isSubmitting}
                        className="glass-button bg-teal hover:bg-teal/90 text-navy-900 px-7 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                        ) : (
                          "Submit Quiz"
                        )}
                      </button>
                    )}
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
