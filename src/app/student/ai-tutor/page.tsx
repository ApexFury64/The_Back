"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Send, Mic, Paperclip, Sparkles, MoreVertical, 
  Trash2, Plus, FileText, Image as ImageIcon,
  Calculator, Search, BrainCircuit, Lock, Beaker,
  Hash, Dices, MinusCircle, Triangle, FlipHorizontal, Ruler,
  Divide, Percent, Variable, Equal, Superscript, Scale,
  BarChart3, PieChart, TrendingUp, LineChart, Square, Hexagon,
  Box, Pentagon, Split, Braces, Infinity, Sigma,
  FunctionSquare, Crosshair, Circle, ListOrdered, Mountain,
  Apple, Wheat, Leaf, Flower2, Activity, Layers, Filter,
  FlaskConical, TestTubes, Thermometer, Gauge, Sprout, Wind,
  HeartPulse, Move, Droplets, Sun, Eye, AudioLines, Zap,
  Flame, Microscope, Baby, Atom, ArrowRightCircle, Orbit,
  Grid3x3, Trees, Gem, Magnet, Dna,
  ALargeSmall, Type, Clock, BookOpen, Feather,
  Mail, NotebookPen, Repeat, MessageSquare, ScanText,
  Settings, CheckCircle, GitBranch, Music, Snowflake, Moon,
  Footprints, Landmark, Scroll, Castle, Crown, HandHeart,
  Church, Ship, Flag, Megaphone, ScrollText, Swords, Factory,
  ShieldAlert, Tractor,
  Globe, Compass, Rotate3d, CloudSun, MountainSnow, TreePalm,
  Users, MapIcon, Waves, LayoutDashboard, TrainFront,
  Monitor, Wifi, Code, Smartphone, Table, Database, Palette,
  Shield, Terminal, Brackets, Package, Video, Play,
  type LucideIcon
} from "lucide-react";

// Map icon name strings from the API to actual Lucide components
const topicIconMap: Record<string, LucideIcon> = {
  'hash': Hash, 'dices': Dices, 'minus-circle': MinusCircle, 'triangle': Triangle,
  'flip-horizontal': FlipHorizontal, 'ruler': Ruler, 'divide': Divide, 'percent': Percent,
  'variable': Variable, 'equal': Equal, 'superscript': Superscript, 'scale': Scale,
  'bar-chart-3': BarChart3, 'pie-chart': PieChart, 'trending-up': TrendingUp, 'line-chart': LineChart,
  'square': Square, 'hexagon': Hexagon, 'box': Box, 'pentagon': Pentagon,
  'split': Split, 'braces': Braces, 'infinity': Infinity, 'sigma': Sigma,
  'function-square': FunctionSquare, 'calculator': Calculator, 'axis-3d': Crosshair,
  'crosshair': Crosshair, 'circle': Circle, 'square-function': FunctionSquare,
  'list-ordered': ListOrdered, 'mountain': Mountain,
  'apple': Apple, 'wheat': Wheat, 'leaf': Leaf, 'flower-2': Flower2,
  'activity': Activity, 'layers': Layers, 'filter': Filter,
  'flask-conical': FlaskConical, 'test-tubes': TestTubes, 'thermometer': Thermometer,
  'gauge': Gauge, 'sprout': Sprout, 'wind': Wind, 'heart-pulse': HeartPulse,
  'move': Move, 'droplets': Droplets, 'sun': Sun, 'eye': Eye,
  'audio-lines': AudioLines, 'zap': Zap, 'flame': Flame,
  'microscope': Microscope, 'baby': Baby, 'atom': Atom, 'beaker': Beaker,
  'arrow-right-circle': ArrowRightCircle, 'orbit': Orbit, 'grid-3x3': Grid3x3,
  'trees': Trees, 'gem': Gem, 'magnet': Magnet, 'dna': Dna,
  'a-large-small': ALargeSmall, 'type': Type, 'clock': Clock,
  'book-open': BookOpen, 'feather': Feather, 'mail': Mail,
  'file-text': FileText, 'notebook-pen': NotebookPen, 'repeat': Repeat,
  'message-square': MessageSquare, 'scan-text': ScanText, 'settings': Settings,
  'check-circle': CheckCircle, 'git-branch': GitBranch, 'music': Music,
  'snowflake': Snowflake, 'moon': Moon,
  'footprints': Footprints, 'landmark': Landmark, 'scroll': Scroll,
  'castle': Castle, 'crown': Crown, 'hand-heart': HandHeart,
  'church': Church, 'ship': Ship, 'flag': Flag, 'megaphone': Megaphone,
  'scroll-text': ScrollText, 'swords': Swords, 'factory': Factory,
  'shield-alert': ShieldAlert, 'tractor': Tractor,
  'globe': Globe, 'compass': Compass, 'rotate-3d': Rotate3d,
  'cloud-sun': CloudSun, 'mountain-snow': MountainSnow, 'palm-tree': TreePalm,
  'users': Users, 'map': MapIcon, 'waves': Waves,
  'layout-dashboard': LayoutDashboard, 'train-front': TrainFront,
  'monitor': Monitor, 'wifi': Wifi, 'code': Code, 'smartphone': Smartphone,
  'table': Table, 'database': Database, 'palette': Palette,
  'shield': Shield, 'lock': Lock, 'terminal': Terminal,
  'brackets': Brackets, 'package': Package,
};
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import CustomDropdown from "@/components/ui/CustomDropdown";
import AILabPanel from "@/components/dashboard/AILabPanel";
import { type LabAsset, getLabAIResponse } from "@/lib/labAssets";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAppStore } from "@/lib/store";

const initialMessages = [
  {
    id: 1,
    role: "ai",
    content: "Hi there! 👋 I'm your **AI Tutor**. We were last working on **Calculus Integration Rules**. Would you like to continue that, or start a new topic today?\n\nHere are some things I can help with:\n1. Explaining complex concepts\n2. Helping with homework\n3. Preparing for quizzes",
    time: "10:00 AM"
  }
];

const parseMarkdown = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\n\n)/g);
  return parts.map((part, i) => {
    if (part === '\n\n') return <br key={i} className="my-2" />;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('1. ') || part.startsWith('2. ') || part.startsWith('3. ')) {
      return <div key={i} className="ml-4 my-1 text-teal flex items-start gap-2"><span className="mt-1 flex-shrink-0 w-1.5 h-1.5 bg-teal rounded-full" /> {part.substring(3)}</div>;
    }
    return <span key={i}>{part}</span>;
  });
};

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
  const userStandard = useAppStore(s => s.userStandard);
  const [selectedStandard, setSelectedStandard] = useState<string>(userStandard || "8");

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

  const standards = ["All", ...Array.from(new Set(subjects.map(s => s.standard || 'Other'))).sort((a: any, b: any) => b.toString().localeCompare(a.toString()))];
  const filteredSubjects = selectedStandard === "All" ? subjects : subjects.filter(s => (s.standard || 'Other') === selectedStandard);

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    const std = subject.standard || 'Other';
    if (!acc[std]) acc[std] = [];
    acc[std].push(subject);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="relative mb-2">
        <CustomDropdown 
          options={standards}
          value={selectedStandard}
          onChange={setSelectedStandard}
          labelPrefix="Standard"
          currentStandard={userStandard || "8"}
        />
      </div>

      {(Object.entries(groupedSubjects) as [string, any[]][])
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([standard, stdSubjects]) => (
          <div key={standard} className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-teal/50">
              {standard}{standard !== 'Other' && 'th Standard'}
            </h3>
            {stdSubjects.map((subject: any) => (
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
                                  const TopicIcon = topic.icon ? topicIconMap[topic.icon] : null;
                                  
                                  return (
                                    <button 
                                      key={j} 
                                      onClick={() => !isLocked && onSelectTopic(topic.title, subject.name)}
                                      disabled={isLocked}
                                      className={cn(
                                        "w-full flex items-center gap-2 text-[11px] p-1.5 rounded-lg transition-all text-left group",
                                        isSelected 
                                          ? "bg-teal/10 border border-teal/30 text-teal font-bold shadow-[0_0_10px_rgba(45,212,191,0.1)] scale-[1.02]" 
                                          : "text-muted-foreground border border-transparent",
                                        !isLocked && !isSelected && "hover:bg-white/10 hover:text-teal",
                                        isLocked && "opacity-50 cursor-not-allowed"
                                      )}
                                    >
                                      {isLocked ? (
                                        <Lock size={12} className="flex-shrink-0 text-white/30" />
                                      ) : TopicIcon ? (
                                        <TopicIcon size={12} className={cn(
                                          "flex-shrink-0 transition-colors",
                                          isSelected ? "text-teal" :
                                          topic.status === 'completed' ? "text-teal" :
                                          topic.status === 'in-progress' ? "text-amber" :
                                          "text-white/40 group-hover:text-teal"
                                        )} />
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
      ))}
    </div>
  );
};

function AITutorContent() {
  const searchParams = useSearchParams();
  const urlSubject = searchParams.get('subject');
  const urlMessage = searchParams.get('message');

  const [subjects, setSubjects] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userStandard = useAppStore(s => s.userStandard);

  useEffect(() => {
    const email = userEmail || 'arjun@dps.edu';
    fetch(`/api/syllabus?userEmail=${email}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSubjects(data);
          if (data.length > 0 && !urlSubject && !activeLabSubject) {
            setActiveLabSubject(data[0].name);
          }
        }
      });
    fetch(`/api/quizzes?userEmail=${email}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setQuizzes(data); });
  }, [userEmail, urlSubject]);

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
      const email = userEmail || 'arjun@dps.edu';
      await fetch('/api/syllabus/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email, topicId })
      });
      // Refresh syllabus
      const res = await fetch(`/api/syllabus?userEmail=${email}`);
      setSubjects(await res.json());
    }
  };

  const [activeTab, setActiveTab] = useState<'history'|'syllabus'|'quizzes'>('syllabus');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTopicTitle, setActiveTopicTitle] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLabPanel, setShowLabPanel] = useState(false);
  const [activeLabSubject, setActiveLabSubject] = useState<string | null>(null);
  const [activeLabStandard, setActiveLabStandard] = useState<string | null>('8');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync activeLabStandard with userStandard once loaded
  useEffect(() => {
    if (userStandard) {
      setActiveLabStandard(userStandard);
    }
  }, [userStandard]);

  // Helper to extract YouTube ID and build clean embed URL
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    let videoId = null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      const shortMatch = url.trim();
      if (shortMatch.length === 11) {
        videoId = shortMatch;
      }
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    return null;
  };

  // Sync active video url with the selected syllabus topic
  useEffect(() => {
    if (activeTopicTitle && subjects.length > 0) {
      let foundUrl = null;
      for (const sub of subjects) {
        for (const mod of sub.modules) {
          for (const t of mod.subTopics) {
            if (t.title === activeTopicTitle) {
              foundUrl = t.ebookVideoUrl || null;
              break;
            }
          }
          if (foundUrl) break;
        }
        if (foundUrl) break;
      }
      setActiveVideoUrl(foundUrl);
    } else {
      setActiveVideoUrl(null);
    }
  }, [activeTopicTitle, subjects]);

  const suggestedPrompts = [
    "Explain Newton's Laws of Motion",
    "Help me solve fractions step by step",
    "What are the main causes of friction?"
  ];

  useEffect(() => {
    if (urlMessage && urlSubject) {
      const decodedMsg = decodeURIComponent(urlMessage);
      const decodedSub = decodeURIComponent(urlSubject);
      
      let topicTitle = decodedMsg.replace("Let's study ", "").replace("Let's take the quiz on ", "").replace("Help me submit assignment: ", "");
      setActiveTopicTitle(topicTitle);
      setActiveLabSubject(decodedSub);

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
    setActiveLabSubject(subjectName);
    const sub = subjects.find(s => s.name === subjectName);
    if (sub?.standard) setActiveLabStandard(sub.standard);
    setIsNavCollapsed(true);
    setShowLabPanel(true);

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

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        content: `I can help you with **"${userMsg.content}"**. Here's a step-by-step breakdown...\n\n1. First, we identify the core formula.\n2. Apply the rule carefully.\n3. Verify the result.\n\nDoes this make sense?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  const handleLabAssetDrop = (asset: LabAsset) => {
    setActiveTopicTitle(asset.title);
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: `🧪 [AI Lab] Tell me about **${asset.title}** from ${asset.subject}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setIsDragOver(false);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        content: getLabAIResponse(asset),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const onChatDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const onChatDragLeave = () => {
    setIsDragOver(false);
  };

  const onChatDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        const asset: LabAsset = JSON.parse(data);
        handleLabAssetDrop(asset);
      }
    } catch {}
  };

  // Reusable component to render the chat view container cleanly
  const renderChatConsole = () => {
    return (
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Drag overlay */}
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-navy-900/70 backdrop-blur-sm rounded-xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-teal/20 border-2 border-dashed border-teal flex items-center justify-center">
                <Beaker size={28} className="text-teal animate-bounce" />
              </div>
              <p className="text-teal font-bold text-sm">Drop here to learn!</p>
              <p className="text-muted-foreground text-xs mt-1">Release the card to start a lesson</p>
            </div>
          </motion.div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex max-w-[85%]",
                  msg.role === "user" ? "ml-auto justify-end" : "mr-auto"
                )}
              >
                <div className={cn(
                  "flex gap-3.5",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold border border-teal/10",
                    msg.role === "ai" 
                      ? "bg-gradient-to-br from-teal to-cyan text-navy-900" 
                      : "bg-white/10 text-white"
                  )}>
                    {msg.role === "ai" ? <Bot size={16} /> : "AR"}
                  </div>
                  
                  <div>
                    <div className={cn(
                      "p-3.5 rounded-2xl relative group",
                      msg.role === "user" 
                        ? "bg-teal text-navy-900 rounded-tr-none font-medium" 
                        : "bg-white/5 border border-white/5 rounded-tl-none shadow-lg"
                    )}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.role === 'ai' ? parseMarkdown(msg.content) : msg.content}
                      </p>
                    </div>
                    <p className={cn(
                      "text-[9px] text-muted-foreground mt-1 px-1",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex max-w-[80%] mr-auto">
                <div className="flex gap-3.5 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-gradient-to-br from-teal to-cyan text-navy-900">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none shadow-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-teal animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-teal animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>

        {/* Suggestion prompts overlay when chat is empty or has only greeting */}
        {messages.length === 1 && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
            {suggestedPrompts.map((p, i) => (
              <button 
                key={i} 
                onClick={() => { setInput(p); handleSend(p); }} 
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-muted-foreground hover:text-white hover:bg-white/10 transition-colors pointer-events-auto"
              >
                {p}
              </button>
            ))}
          </motion.div>
        )}

        {/* Chat Input Area */}
        <div className="p-4 bg-navy-950/80 border-t border-white/5 flex-shrink-0">
          <div className="flex gap-1.5 mb-2.5 px-0.5 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setInput("Solve this math problem step by step: ")}
              className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-white/3 hover:bg-white/5 border border-white/5 text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
            >
              <Calculator size={11} className="text-teal" /> Solve Math
            </button>
            <button 
              onClick={() => setInput("Explain this concept in simple terms: ")}
              className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-white/3 hover:bg-white/5 border border-white/5 text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
            >
              <BrainCircuit size={11} className="text-cyan" /> Explain Concept
            </button>
            <button 
              onClick={() => setInput("Summarize the following notes: ")}
              className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-white/3 hover:bg-white/5 border border-white/5 text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
            >
              <FileText size={11} className="text-purple" /> Summarize Notes
            </button>
            {activeTopicTitle && urlSubject && (
              <button 
                onClick={() => completeTopic(urlSubject, activeTopicTitle)}
                className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-teal/10 hover:bg-teal/20 border border-teal/20 text-teal font-bold transition-all whitespace-nowrap ml-auto"
              >
                Mark Complete
              </button>
            )}
          </div>
          
          {/* Chat Input Box */}
          <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-teal/30 focus-within:bg-white/8 transition-all">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/10 transition-colors mb-0.5" title="Attach Notes">
              <Paperclip size={18} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/10 transition-colors mb-0.5" title="Attach Image">
              <ImageIcon size={18} />
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
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-24 min-h-[36px] py-2 text-xs text-foreground placeholder-muted-foreground/60"
              rows={1}
            />
            
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/10 transition-colors mb-0.5" title="Voice Input">
              <Mic size={18} />
            </button>
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-gradient-to-r from-teal to-cyan text-navy-900 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-center text-[9px] text-muted-foreground/60 mt-1.5">
            AI Tutor can make mistakes. Double-check important facts.
          </p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      role="student"
      userName={userName || "Student"}
      schoolName={schoolName || "AI Tutor"}
    >
      <div className="h-[calc(100vh-120px)] flex gap-6">
        {/* Left Navigation Accordion */}
        <AnimatePresence>
          {!isNavCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="hidden lg:flex w-80 flex-col gap-4 flex-shrink-0 overflow-hidden"
            >
              <button className="glass-button w-full flex items-center justify-center gap-2">
                <Plus size={18} /> New Chat
              </button>
              
              <div className="glass-card flex-1 p-4 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl mb-4 flex-shrink-0">
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
                      {subjects.slice(0, 4).map((sub: any) => {
                        const inProgressTopic = sub.modules?.flatMap((m: any) => m.subTopics || []).find((t: any) => t.status === 'in-progress');
                        const topicName = inProgressTopic?.title || sub.name;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleTopicSelect(topicName, sub.name)}
                            className="p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group relative border border-transparent hover:border-white/5"
                          >
                            <p className="text-sm font-medium truncate pr-6">Help with {topicName}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-[10px] text-teal">{sub.name}</p>
                              <p className="text-[10px] text-muted-foreground">{sub.progress}% done</p>
                            </div>
                            <button className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-coral transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
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
                      {quizzes.map((quiz: any) => {
                        const isCompleted = quiz.attempts && quiz.attempts.length > 0;
                        return (
                          <div key={quiz.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5">
                            <p className="text-sm font-medium leading-tight mb-1">{quiz.title}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{quiz.subject?.name}</span>
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full",
                                isCompleted ? "bg-teal/20 text-teal" : "bg-coral/20 text-coral"
                              )}>
                                {isCompleted ? 'completed' : 'pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CONSOLE AREA */}
        <div
          className={cn(
            "flex-1 glass-card flex flex-col overflow-hidden relative transition-all duration-200",
            isDragOver && "ring-2 ring-teal/50 ring-inset bg-teal/5"
          )}
          onDragOver={onChatDragOver}
          onDragLeave={onChatDragLeave}
          onDrop={onChatDrop}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between glass-navbar z-10 rounded-t-xl flex-shrink-0">
            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200 border flex-shrink-0",
                  isNavCollapsed 
                    ? "bg-teal/10 border-teal/20 text-teal hover:bg-teal/20" 
                    : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
                )}
                title={isNavCollapsed ? "Expand Syllabus Navigation" : "Collapse Syllabus Navigation"}
              >
                <BookOpen size={16} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center text-teal flex-shrink-0">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLabPanel(!showLabPanel)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  showLabPanel
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/5"
                )}
              >
                <Beaker size={14} />
                AI Lab
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Split Pane side-by-side or full width chat console */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {activeVideoUrl ? (
              <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/5">
                {/* Left Column: Video Lesson Screen (58% width) */}
                <div className="flex-[5.8] min-h-0 relative bg-black/40 flex flex-col justify-center items-center overflow-hidden">
                  <div className="w-full h-full relative">
                    {getEmbedUrl(activeVideoUrl) ? (
                      <iframe
                        src={getEmbedUrl(activeVideoUrl) || ""}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={activeVideoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    )}
                    {/* Small floating topic title overlay on top of video */}
                    <div className="absolute top-3 left-3 bg-navy-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-1.5 pointer-events-none">
                      <Play size={10} className="text-teal animate-pulse" />
                      <span className="truncate max-w-[200px]">{activeTopicTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Chat Console (4.2 / 10 width) */}
                <div className="flex-[4.2] flex flex-col min-h-0 relative bg-navy-950/10">
                  {renderChatConsole()}
                </div>
              </div>
            ) : (
              /* Full Width Chat console */
              <div className="flex-1 flex flex-col min-h-0 relative">
                {renderChatConsole()}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — AI Lab */}
        <AnimatePresence>
          {showLabPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="hidden lg:flex flex-col glass-card overflow-hidden flex-shrink-0"
            >
              <AILabPanel
                onAssetSelect={handleLabAssetDrop}
                activeSubject={activeLabSubject}
                activeStandard={activeLabStandard}
                activeTopicTitle={activeTopicTitle}
                onClose={() => setShowLabPanel(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

export default function StudentAITutor() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-teal">Loading AI Tutor...</div>}>
      <AITutorContent />
    </Suspense>
  );
}
