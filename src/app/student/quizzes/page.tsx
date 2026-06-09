"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle, Clock, AlertCircle, PlayCircle, X, Check, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import CustomDropdown from "@/components/ui/CustomDropdown";

export default function StudentQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  
  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userStandard = useAppStore(s => s.userStandard);
  
  const [activeSubject, setActiveSubject] = useState("All");
  const [selectedStandard, setSelectedStandard] = useState<string>(userStandard || "8");
  
  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizData, setQuizData] = useState<any | null>(null); // Fetched questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState<any | null>(null); // Contains score info

  // Fetch initial data
  const { data: rawQuizzes, isLoading: loading, isError, refetch } = useQuery<any[]>({
    queryKey: ['studentQuizzes', userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes`);
      if (!res.ok) throw new Error('Failed to load quizzes');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000,
    retry: 2,
  });

  const quizzes = rawQuizzes ?? [];

  const handleStartQuiz = async (quiz: any) => {
    setActiveQuiz(quiz);
    setQuizSuccess(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuizData(null);
    
    // Fetch full quiz with questions
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`);
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
    
    // Hardcode user ID to the first user in DB for this prototype
    // Ideally we should have auth context
    try {
      // Small hack to get user id from syllabus API or just assume we know it.
      // Wait, we don't have user ID. We can submit with a dummy ID and let the API fail if FK constraint is on.
      // Let's quickly get the user ID from the syllabus api or just pass an email?
      // Our API requires userId. I will change the API to lookup by email if userId is missing, or we can just fetch it here.
      
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers,
          timeTaken: 120,
          userEmail: userEmail || 'arjun@dps.edu'
        })
      });
      
      const result = await res.json();
      setIsSubmitting(false);
      setQuizSuccess(result);
      
      // Refresh quizzes
      const email = userEmail || 'arjun@dps.edu';
      await fetch(`/api/quizzes?userEmail=${email}`);
      refetch(); // Refresh list via React Query
      
      setTimeout(() => {
        setActiveQuiz(null);
      }, 4000);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const classes = ["All", ...Array.from(new Set(quizzes.map((q: any) => q.class || 'All Classes'))).sort((a: any, b: any) => b.toString().localeCompare(a.toString()))];
  const filteredByClass = selectedStandard === "All" ? quizzes : quizzes.filter((q: any) => (q.class || 'All Classes') === selectedStandard);

  const subjectNames = Array.from(new Set(
    filteredByClass.map((q: any) => {
      const subj = q.subject;
      if (!subj) return null;
      return typeof subj === 'string' ? subj : (subj?.name ?? null);
    }).filter(Boolean)
  )) as string[];
  const subjects = ["All", ...subjectNames];
  
  const getSubjectName = (q: any): string => {
    const subj = q.subject;
    if (!subj) return 'General';
    return typeof subj === 'string' ? subj : (subj?.name ?? 'General');
  };

  const filteredQuizzes = activeSubject === "All" 
    ? filteredByClass 
    : filteredByClass.filter((q: any) => getSubjectName(q) === activeSubject);
  
  // Quizzes with no attempts = pending; with attempts = completed
  const pending = filteredQuizzes.filter((q: any) => !q.attempts || q.attempts.length === 0);
  const completed = filteredQuizzes.filter((q: any) => q.attempts && q.attempts.length > 0);

  if (loading) return (
    <DashboardLayout role="student" userName={userName || "Student"} schoolName={schoolName || "AI Tutor"} pageTitle="AI Quizzes" pageSubtitle="Loading your quizzes...">
      <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
    </DashboardLayout>
  );

  if (isError) return (
    <DashboardLayout role="student" userName={userName || "Student"} schoolName={schoolName || "AI Tutor"} pageTitle="AI Quizzes" pageSubtitle="">
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center"><AlertCircle size={32} className="text-coral" /></div>
        <h3 className="text-xl font-bold">Could not load quizzes</h3>
        <p className="text-muted-foreground max-w-sm">There was a problem fetching your quizzes. Please try again.</p>
        <button onClick={() => refetch()} className="glass-button px-6 py-2.5">Try Again</button>
      </div>
    </DashboardLayout>
  );

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];

  return (
    <DashboardLayout
      role="student"
      userName={userName || "Student"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="AI Quizzes"
      pageSubtitle="Test your knowledge with real database-backed quizzes"
    >
      <div className="space-y-8">
        
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full sm:w-auto flex-1">
            {subjects.map(subject => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject as string)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                  activeSubject === subject 
                    ? "bg-white text-navy-900 shadow-sm" 
                    : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-navy-900/60 dark:text-muted-foreground hover:text-navy-900 dark:hover:text-white border border-black/5 dark:border-white/5"
                )}
              >
                {subject}
              </button>
            ))}
          </div>

          <CustomDropdown 
            options={classes}
            value={selectedStandard}
            onChange={(val) => {
              setSelectedStandard(val);
              setActiveSubject("All");
            }}
            labelPrefix="Standard"
            currentStandard={userStandard || "8"}
          />
        </div>
        
        {/* Pending Quizzes */}
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-coral" /> Action Required ({pending.length})
          </h3>
          <div className="space-y-6">
            {Object.entries(
              pending.reduce((acc, q) => {
                const c = q.class || 'Other';
                if (!acc[c]) acc[c] = [];
                acc[c].push(q);
                return acc;
              }, {} as Record<string, any[]>)
            ).sort((a, b) => b[0].localeCompare(a[0])).map((entry: any) => {
              const className = entry[0];
              const classQuizzes = entry[1];
              return (
              <div key={className} className="space-y-4">
                <h4 className="text-sm font-bold text-navy-900/70 dark:text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-coral">{className}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classQuizzes.map((quiz: any, i: number) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-5 border-l-4 border-l-coral flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-red-700 dark:text-coral bg-red-50 dark:bg-coral/10 px-2 py-0.5 rounded-full">
                            {getSubjectName(quiz)}
                          </span>
                          <span className="text-[10px] font-medium text-navy-900/70 dark:text-muted-foreground flex items-center gap-1">
                            <Clock size={12} /> Due {quiz.due || 'Soon'}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg text-navy-900 dark:text-white">{quiz.title}</h4>
                        <p className="text-xs text-navy-900/70 dark:text-muted-foreground mt-1 flex items-center gap-3">
                          <span>{quiz._count?.questions} Questions</span>
                          <span className="w-1 h-1 rounded-full bg-navy-900/20 dark:bg-white/20" />
                          <span>{quiz.timeLimit}m</span>
                          <span className="w-1 h-1 rounded-full bg-navy-900/20 dark:bg-white/20" />
                          <span className={quiz.difficulty === 'Hard' ? 'text-red-700 dark:text-coral font-bold' : 'text-amber-800 dark:text-amber font-bold'}>{quiz.difficulty}</span>
                        </p>
                      </div>
                      <div className="flex items-center sm:items-end">
                        <button 
                          onClick={() => handleStartQuiz(quiz)}
                          className="glass-button w-full sm:w-auto flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 dark:bg-coral dark:hover:bg-coral/90 text-white border-0"
                        >
                          <PlayCircle size={16} /> Start Quiz
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
            })}
          </div>
        </section>

        {/* Completed Quizzes */}
        {completed.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-teal-800 dark:text-teal" /> Completed Quizzes
            </h3>
            <div className="space-y-6">
              {Object.entries(
                completed.reduce((acc, q) => {
                  const c = q.class || 'Other';
                  if (!acc[c]) acc[c] = [];
                  acc[c].push(q);
                return acc;
              }, {} as Record<string, any[]>)
            ).sort((a, b) => b[0].localeCompare(a[0])).map((entry: any) => {
                const className = entry[0];
                const classQuizzes = entry[1];
                return (
                <div key={className} className="space-y-4">
                  <h4 className="text-sm font-bold text-navy-900/70 dark:text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-teal">{className}</h4>
                  <div className="glass-card-static overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-navy-900/70 dark:text-muted-foreground uppercase bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Quiz Title</th>
                            <th className="px-6 py-4 font-semibold">Subject</th>
                            <th className="px-6 py-4 font-semibold">Questions</th>
                            <th className="px-6 py-4 font-semibold">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                          {classQuizzes.map((quiz: any, i: number) => (
                            <motion.tr 
                              key={quiz.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium text-navy-900 dark:text-white">{quiz.title}</td>
                               <td className="px-6 py-4">
                                 <span className="text-[10px] bg-black/5 dark:bg-white/10 text-navy-900/70 dark:text-muted-foreground px-2 py-1 rounded-md">{getSubjectName(quiz)}</span>
                               </td>
                              <td className="px-6 py-4 text-navy-900/70 dark:text-muted-foreground">{quiz._count?.questions}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "font-bold",
                                    quiz.attempts[0].score >= 90 ? "text-teal-800 dark:text-teal" : quiz.attempts[0].score >= 80 ? "text-amber-800 dark:text-amber" : "text-red-700 dark:text-coral"
                                  )}>
                                    {quiz.attempts[0].score}%
                                  </span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </section>
        )}

      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl border-white/20"
            >
              {quizSuccess ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="w-20 h-20 rounded-full bg-teal/20 text-teal flex items-center justify-center mb-6"
                  >
                    <Check size={40} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Quiz Submitted!</h2>
                  <p className="text-xl font-medium mb-2 text-teal">Score: {quizSuccess.score}%</p>
                  <p className="text-muted-foreground mb-6">
                    You got {quizSuccess.correctCount} out of {quizSuccess.totalQuestions} correct.
                  </p>
                </div>
              ) : !quizData ? (
                <div className="p-12 flex justify-center"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
              ) : (
                <>
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div>
                      <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{activeQuiz.subject?.name}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>Question {currentQuestionIndex + 1} of {quizData.questions?.length || 0}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveQuiz(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-6">
                    {currentQuestion && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium leading-relaxed">
                          {currentQuestion.text}
                        </h3>
                        
                        <div className="space-y-3">
                          {JSON.parse(currentQuestion.options).map((option: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setAnswers({...answers, [currentQuestion.id]: idx})}
                              className={cn(
                                "w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all",
                                answers[currentQuestion.id] === idx 
                                  ? "bg-teal/10 border-teal text-white shadow-[0_0_15px_rgba(45,212,191,0.15)]" 
                                  : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                                answers[currentQuestion.id] === idx ? "border-teal" : "border-white/30"
                              )}>
                                {answers[currentQuestion.id] === idx && <div className="w-2.5 h-2.5 rounded-full bg-teal" />}
                              </div>
                              <span className="leading-relaxed">{option}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between">
                    <button 
                      onClick={() => setActiveQuiz(null)}
                      className="px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    {currentQuestionIndex < (quizData.questions?.length || 0) - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        disabled={answers[currentQuestion?.id] === undefined}
                        className="glass-button bg-white hover:bg-white/90 text-navy-900 px-8 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        Next Question <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={answers[currentQuestion?.id] === undefined || isSubmitting}
                        className="glass-button bg-teal hover:bg-teal/90 text-navy-900 px-8 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
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
