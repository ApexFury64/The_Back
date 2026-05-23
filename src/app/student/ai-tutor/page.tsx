"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Send, Mic, Paperclip, Sparkles, MoreVertical, 
  Trash2, Plus, FileText, Image as ImageIcon,
  Calculator, Search, BrainCircuit, Lock
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

import { useSearchParams } from "next/navigation";
import { recentAIChats, studentQuizzesData } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";

// Mock Initial Messages
const initialMessages = [
  {
    id: 1,
    role: "ai",
    content: "Hi Arjun! 👋 I'm your AI Tutor. We were last working on Calculus Integration Rules. Would you like to continue that, or start a new topic today?",
    time: "10:00 AM"
  }
];

const SyllabusAccordion = ({ 
  subjects,
  onSelectTopic, 
  defaultSubjectName,
  activeTopicTitle
}: { 
  subjects: any[];
  onSelectTopic: (topicTitle: string, subjectName: string) => void;
  defaultSubjectName?: string | null;
  activeTopicTitle?: string | null;
}) => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(subjects[0]?.id || null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  useEffect(() => {
    if (defaultSubjectName) {
      const sub = subjects.find(s => s.name === defaultSubjectName);
      if (sub) {
        setExpandedSubject(sub.id);
        
        if (activeTopicTitle) {
          const unitIndex = sub.modules?.findIndex((u:any) => u.subTopics?.some((t:any) => t.title === activeTopicTitle));
          if (unitIndex !== undefined && unitIndex !== -1) {
            setExpandedUnit(`${sub.id}-u${unitIndex}`);
          }
        }
      }
    }
  }, [defaultSubjectName, activeTopicTitle, subjects]);

  return (
    <div className="space-y-3">
      {subjects.map(subject => (
        <div key={subject.id} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
          {/* Subject Header */}
          <button 
            onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: subject.color }}>
              {subject.name}
            </h4>
            <span className="text-muted-foreground text-xs">
              {expandedSubject === subject.id ? '−' : '+'}
            </span>
          </button>
          
          {/* Units Container */}
          <AnimatePresence>
            {expandedSubject === subject.id && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-3 pb-3 space-y-2"
              >
                {subject.modules?.map((unit: any, i: number) => {
                  const unitId = `${subject.id}-u${i}`;
                  return (
                    <div key={i} className="pl-2 border-l border-white/10">
                      <button 
                        onClick={() => setExpandedUnit(expandedUnit === unitId ? null : unitId)}
                        className="w-full flex items-center justify-between text-left py-1 hover:text-teal transition-colors text-muted-foreground"
                      >
                        <p className="text-xs font-semibold">{unit.title}</p>
                        <span className="text-[10px]">{expandedUnit === unitId ? '▼' : '▶'}</span>
                      </button>
                      
                      {expandedUnit === unitId && (
                        <div className="pt-1 pb-2 space-y-1">
                          {unit.subTopics?.map((topic: any, j: number) => {
                            const isSelected = activeTopicTitle === topic.title;
                            const isLocked = topic.status === 'locked';
                            
                            return (
                              <button 
                                key={j} 
                                onClick={() => !isLocked && onSelectTopic(topic.title, subject.name)}
                                disabled={isLocked}
                                className={cn(
                                  "w-full flex items-center gap-2 text-[10px] p-1.5 rounded-lg transition-all text-left group",
                                  isSelected 
                                    ? "bg-teal/10 border border-teal/30 text-teal font-bold shadow-[0_0_10px_rgba(45,212,191,0.1)] scale-[1.02]" 
                                    : "text-muted-foreground border border-transparent",
                                  !isLocked && !isSelected && "hover:bg-white/10 hover:text-teal",
                                  isLocked && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                {isLocked ? (
                                  <Lock size={10} className="flex-shrink-0 text-white/30" />
                                ) : (
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
                                    topic.status === 'completed' ? "bg-teal" : 
                                    topic.status === 'in-progress' ? "bg-amber" : "bg-white/10 group-hover:bg-white/30",
                                    isSelected && topic.status !== 'completed' && topic.status !== 'in-progress' && "bg-teal"
                                  )} />
                                )}
                                <span className={cn(
                                  "truncate flex-1", 
                                  topic.status === 'completed' && !isSelected && "text-teal opacity-80 group-hover:opacity-100"
                                )}>
                                  {topic.title}
                                </span>
                                {topic.status === 'completed' && (
                                  <span className="px-1.5 py-0.5 bg-teal/20 text-teal text-[8px] uppercase tracking-wider font-bold rounded ml-2 flex-shrink-0">
                                    Done
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default function StudentAITutor() {
  const searchParams = useSearchParams();
  const urlSubject = searchParams.get('subject');
  const urlMessage = searchParams.get('message');

  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/syllabus?userEmail=arjun@techwing.com')
      .then(res => res.json())
      .then(data => setSubjects(data));
  }, []);

  const completeTopic = async (subjectName: string, topicTitle: string) => {
    let topicId = null;
    for (const sub of subjects) {
      if (sub.name === subjectName) {
        for (const mod of sub.modules) {
          for (const t of mod.subTopics) {
            if (t.title === topicTitle) {
              topicId = t.id;
            }
          }
        }
      }
    }
    if (topicId) {
      await fetch('/api/syllabus/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: 'arjun@techwing.com', topicId })
      });
      // Refresh syllabus
      const res = await fetch('/api/syllabus?userEmail=arjun@techwing.com');
      setSubjects(await res.json());
    }
  };

  const [activeTab, setActiveTab] = useState<'history' | 'syllabus' | 'quizzes'>('syllabus');
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTopicTitle, setActiveTopicTitle] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle URL params auto-start
  useEffect(() => {
    if (urlMessage && urlSubject) {
      const decodedMsg = decodeURIComponent(urlMessage);
      const decodedSub = decodeURIComponent(urlSubject);
      
      let topicTitle = decodedMsg.replace("Let's study ", "").replace("Let's take the quiz on ", "").replace("Help me submit assignment: ", "");
      setActiveTopicTitle(topicTitle);

      const userMsg = {
        id: Date.now(),
        role: "user",
        content: `${decodedMsg} in ${decodedSub}.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([initialMessages[0], userMsg]);
      setIsTyping(true);

      const isQuiz = decodedMsg.includes("quiz");
      const isAssignment = decodedMsg.includes("assignment");

      const aiResponse = isQuiz
        ? `Alright, let's start the quiz on "${topicTitle}".\n\nQuestion 1: What is the most important fundamental concept here?`
        : isAssignment
        ? `I can absolutely help you with your assignment on "${topicTitle}". Where are you stuck?`
        : `Great choice! "${topicTitle}" is a fantastic topic in ${decodedSub}.\n\nLet's break it down. What do you already know about it, or should I explain the core concept first?`;

      const timer = setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          role: "ai",
          content: aiResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [urlSubject, urlMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTopicSelect = (topicTitle: string, subjectName: string) => {
    setActiveTopicTitle(topicTitle);
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: `Let's study ${topicTitle} from ${subjectName}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        content: `Great choice! "${topicTitle}" is a fantastic topic in ${subjectName}.\n\nLet's break it down. What do you already know about it, or should I explain the core concept first?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        content: `I can help you with "${userMsg.content}". Here's a step-by-step breakdown...\n\n1. First, we identify the core formula.\n2. Apply the rule carefully.\n3. Verify the result.\n\nDoes this make sense?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <DashboardLayout
      role="student"
      userName="Arjun Reddy"
      schoolName="Class 7-B • Delhi Public School"
    >
      <div className="h-[calc(100vh-120px)] flex gap-6">
        
        {/* ── Sidebar: Chat History & Syllabus ── */}
        <div className="hidden lg:flex w-80 flex-col gap-4">
          <button className="glass-button w-full flex items-center justify-center gap-2">
            <Plus size={18} /> New Chat
          </button>
          
          <div className="glass-card flex-1 p-4 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl mb-4">
              {['History', 'Syllabus', 'Quizzes'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase() as 'history'|'syllabus'|'quizzes')}
                  className={cn(
                    "flex-1 text-xs font-bold py-1.5 rounded-lg transition-all",
                    activeTab === tab.toLowerCase() ? "bg-teal text-navy-900 shadow-md scale-105" : "text-muted-foreground hover:text-teal hover:bg-white/5"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {activeTab === 'history' && (
                <div className="space-y-2">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search history..." 
                      className="glass-input w-full pl-9 pr-4 py-2 text-sm"
                    />
                  </div>
                  {recentAIChats.map((chat) => (
                    <div key={chat.id} className="p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group relative">
                      <p className="text-sm font-medium truncate pr-6">{chat.topic}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-teal">{chat.subject}</p>
                        <p className="text-[10px] text-muted-foreground">{chat.time}</p>
                      </div>
                      <button className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-coral transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'syllabus' && (
                <SyllabusAccordion 
                  subjects={subjects}
                  onSelectTopic={handleTopicSelect} 
                  defaultSubjectName={urlSubject}
                  activeTopicTitle={activeTopicTitle}
                />
              )}

              {activeTab === 'quizzes' && (
                <div className="space-y-2">
                  {studentQuizzesData.map(quiz => (
                    <div key={quiz.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5">
                      <p className="text-sm font-medium leading-tight mb-1">{quiz.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{quiz.subject}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full",
                          quiz.status === 'completed' ? "bg-teal/20 text-teal" : "bg-coral/20 text-coral"
                        )}>
                          {quiz.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 glass-card flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between glass-navbar absolute top-0 left-0 right-0 z-10 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-teal">
                <Bot size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  AI Tutor <Sparkles size={16} className="text-amber" />
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" /> Always active
                </p>
              </div>
            </div>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 pt-24 pb-6 space-y-6 no-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex max-w-[80%]",
                    msg.role === "user" ? "ml-auto justify-end" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
                    {/* Avatar */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                      msg.role === "ai" 
                        ? "bg-gradient-to-br from-teal to-cyan text-navy-900" 
                        : "bg-white/10 text-white"
                    )}>
                      {msg.role === "ai" ? <Bot size={16} /> : "AR"}
                    </div>
                    
                    {/* Bubble */}
                    <div>
                      <div className={cn(
                        "px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm",
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-white/5 border border-white/10 rounded-tl-sm text-foreground"
                      )}>
                        {msg.content}
                      </div>
                      <p className={cn(
                        "text-[10px] text-muted-foreground mt-1 px-1",
                        msg.role === "user" ? "text-right" : "text-left"
                      )}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex max-w-[80%] mr-auto gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal to-cyan text-navy-900 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} />
                </div>
                <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-navy-900/50 backdrop-blur-md">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-3 px-1 overflow-x-auto no-scrollbar">
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors whitespace-nowrap">
                <Calculator size={12} className="text-teal" /> Solve Math
              </button>
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors whitespace-nowrap">
                <BrainCircuit size={12} className="text-cyan" /> Explain Concept
              </button>
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors whitespace-nowrap">
                <FileText size={12} className="text-purple" /> Summarize Notes
              </button>
              {activeTopicTitle && urlSubject && (
                <button 
                  onClick={() => completeTopic(urlSubject, activeTopicTitle)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-teal text-navy-900 font-bold hover:opacity-90 transition-opacity whitespace-nowrap ml-auto shadow-[0_0_10px_rgba(45,212,191,0.2)]"
                >
                  Mark Topic Complete
                </button>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-teal/50 focus-within:bg-white/10 transition-all">
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/10 transition-colors mb-0.5">
                <Paperclip size={20} />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/10 transition-colors mb-0.5">
                <ImageIcon size={20} />
              </button>
              
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask your AI Tutor anything..."
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[44px] py-3 text-sm"
                rows={1}
              />
              
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/10 transition-colors mb-0.5">
                <Mic size={20} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-gradient-to-r from-teal to-cyan text-navy-900 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-3">
              AI Tutor can make mistakes. Consider verifying important information.
            </p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
