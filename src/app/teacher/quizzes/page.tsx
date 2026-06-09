"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Brain, Plus, Search, Clock, Trash2, PlusCircle, X, Check, HelpCircle } from "lucide-react";
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

  // New Quiz state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState("15");
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { question: "", options: ["", "", "", ""], answer: "" }
  ]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      } else {
        toast.error("Failed to load quizzes");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: "" }]);
  };

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
    updated[qIndex].options[optIndex] = value;
    // If the changed option was selected as the answer, update the answer field too
    if (updated[qIndex].answer === updated[qIndex].options[optIndex]) {
      updated[qIndex].answer = value;
    }
    setQuestions(updated);
  };

  const handleSelectAnswer = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].answer = value;
    setQuestions(updated);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!quizTitle.trim()) {
      toast.error("Please provide a quiz title");
      return;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Please fill in the text for Question ${i + 1}`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        toast.error(`Please fill in all options for Question ${i + 1}`);
        return;
      }
      if (!q.answer) {
        toast.error(`Please select the correct answer for Question ${i + 1}`);
        return;
      }
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
            answer: q.answer
          }))
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Quiz created successfully");
        setIsModalOpen(false);
        // Reset state
        setQuizTitle("");
        setQuizDuration("15");
        setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
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

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      role="teacher"
      userName={userName || "Teacher"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Quizzes & Assessments"
      pageSubtitle="Design and assign quizzes to measure class comprehension"
    >
      <div className="glass-card-static p-6 rounded-2xl relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Search quizzes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 pr-4 py-2 w-full text-sm" 
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="glass-button px-4 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center bg-teal text-navy-900 border-none font-semibold"
          >
            <Plus size={16} /> Create Quiz
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading quizzes...</div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded-xl">
              No quizzes found. Create a new quiz to get started.
            </div>
          ) : (
            filteredQuizzes.map(q => (
              <div key={q.id} className="glass-card p-5 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 bg-teal/15 text-teal">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1 group-hover:text-teal transition-colors">{q.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium bg-white/5 px-2 py-0.5 rounded">{q.subject}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/> {q.duration} Minutes</span>
                      <span className="flex items-center gap-1"><HelpCircle size={12}/> {q.questions} Questions</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">Active</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE QUIZ MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl p-6 rounded-2xl border border-white/10 my-8 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
                <div>
                  <h3 className="text-xl font-bold">Create Quiz</h3>
                  <p className="text-xs text-muted-foreground">Define quiz metadata and build questions</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateQuiz} className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-6">
                {/* Meta Inputs */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Quiz Title</label>
                    <input 
                      type="text" 
                      value={quizTitle}
                      onChange={e => setQuizTitle(e.target.value)}
                      placeholder="e.g. Chapter 1 Algebra Review"
                      className="glass-input w-full px-4 py-2.5 text-sm" 
                      required 
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Duration (Mins)</label>
                    <input 
                      type="number" 
                      value={quizDuration}
                      onChange={e => setQuizDuration(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-sm" 
                      min="1"
                      required 
                    />
                  </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-bold text-sm text-teal">Quiz Questions</h4>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1.5 text-xs text-teal hover:underline bg-transparent border-none cursor-pointer"
                    >
                      <PlusCircle size={14} /> Add Question
                    </button>
                  </div>

                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Question {qIndex + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="p-1 hover:bg-red-500/10 text-muted-foreground hover:text-coral rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {/* Question text */}
                      <div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={e => handleQuestionChange(qIndex, e.target.value)}
                          placeholder="Type question text..."
                          className="glass-input w-full px-4 py-2 text-sm"
                          required
                        />
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-answer-${qIndex}`}
                              checked={q.answer !== "" && q.answer === opt}
                              onChange={() => handleSelectAnswer(qIndex, opt)}
                              disabled={!opt.trim()}
                              className="rounded-full border-white/20 text-teal focus:ring-teal cursor-pointer shrink-0"
                              title="Set as correct answer"
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

                      <div className="text-[10px] text-muted-foreground mt-1">
                        * Select the radio button next to the option that represents the correct answer.
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10 shrink-0">
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
