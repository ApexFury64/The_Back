"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle, Clock, AlertCircle, PlayCircle, X, Check, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

const USER_EMAIL = 'arjun@techwing.com'; // Hardcoded for prototype

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeSubject, setActiveSubject] = useState("All");
  
  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizData, setQuizData] = useState<any | null>(null); // Fetched questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState<any | null>(null); // Contains score info

  // Fetch initial data
  useEffect(() => {
    // For this prototype, we'll fetch the user by email just to get the ID, 
    // or we can hardcode the ID. Let's assume we fetch quizzes without user ID first, 
    // or we use a known user ID. We'll use a mock userId or fetch it.
    // For simplicity, let's fetch quizzes and assume any attempt by 'arjun' is ours.
    
    // We didn't make a /api/user route, so we will just fetch quizzes without userId 
    // and let the submit fail if we don't have a user, OR we add a hack to get the user ID.
    // Actually, let's fetch the first user from the DB.
    
    fetch('/api/quizzes?userEmail=' + USER_EMAIL) // Fetch all quizzes for the user
      .then(res => res.json())
      .then(data => {
        setQuizzes(data);
        setLoading(false);
      });
  }, []);

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
          timeTaken: 120, // 2 mins mock
          userEmail: USER_EMAIL // We will modify API to accept this
        })
      });
      
      const result = await res.json();
      setIsSubmitting(false);
      setQuizSuccess(result);
      
      // Refresh quizzes
      const qRes = await fetch('/api/quizzes?userEmail=' + USER_EMAIL);
      const qData = await qRes.json();
      setQuizzes(qData);
      
      setTimeout(() => {
        setActiveQuiz(null);
      }, 4000);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const subjects = ["All", ...Array.from(new Set(quizzes.map(q => q.subject?.name).filter(Boolean)))];
  const filteredQuizzes = activeSubject === "All" ? quizzes : quizzes.filter(q => q.subject?.name === activeSubject);
  
  // A quiz is pending if it has 0 attempts (or we can just check attempts array)
  // Since we didn't pass userId in GET /api/quizzes, attempts will be empty for all quizzes unless we change that.
  // Actually, we did pass userId? No, we didn't. 
  // For now, if a quiz has attempts, we'll consider it completed.
  const pending = filteredQuizzes.filter(q => !q.attempts || q.attempts.length === 0);
  const completed = filteredQuizzes.filter(q => q.attempts && q.attempts.length > 0);

  if (loading) return (
    <DashboardLayout role="student" userName="Arjun Reddy" schoolName="Class 7-B" pageTitle="AI Quizzes" pageSubtitle="Loading...">
      <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
    </DashboardLayout>
  );

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];

  return (
    <DashboardLayout
      role="student"
      userName="Arjun Reddy"
      schoolName="Class 7-B • Delhi Public School"
      pageTitle="AI Quizzes"
      pageSubtitle="Test your knowledge with real database-backed quizzes"
    >
      <div className="space-y-8">
        
        {/* Subject Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject as string)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                activeSubject === subject 
                  ? "bg-white text-navy-900" 
                  : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5"
              )}
            >
              {subject}
            </button>
          ))}
        </div>
        
        {/* Pending Quizzes */}
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-coral" /> Action Required ({pending.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 border-l-4 border-l-coral flex flex-col sm:flex-row gap-4 justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full">
                      {quiz.subject?.name}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> Due {quiz.due || 'Soon'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg">{quiz.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    <span>{quiz._count?.questions} Questions</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{quiz.timeLimit}m</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className={quiz.difficulty === 'Hard' ? 'text-coral' : 'text-amber'}>{quiz.difficulty}</span>
                  </p>
                </div>
                <div className="flex items-center sm:items-end">
                  <button 
                    onClick={() => handleStartQuiz(quiz)}
                    className="glass-button w-full sm:w-auto flex items-center justify-center gap-2 bg-coral hover:bg-coral/90 text-white"
                  >
                    <PlayCircle size={16} /> Start Quiz
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Completed Quizzes */}
        {completed.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-teal" /> Completed Quizzes
            </h3>
            <div className="glass-card-static overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Quiz Title</th>
                      <th className="px-6 py-4 font-semibold">Subject</th>
                      <th className="px-6 py-4 font-semibold">Questions</th>
                      <th className="px-6 py-4 font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {completed.map((quiz, i) => (
                      <motion.tr 
                        key={quiz.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium">{quiz.title}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md">{quiz.subject?.name}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{quiz._count?.questions}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold",
                              quiz.attempts[0].score >= 90 ? "text-teal" : quiz.attempts[0].score >= 80 ? "text-amber" : "text-coral"
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
                        <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
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
                    {currentQuestionIndex < quizData.questions.length - 1 ? (
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
