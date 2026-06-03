"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Sparkles, Send, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface AILabPanelProps {
  subject: any;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  imagePreview?: string;
  timestamp: Date;
}

export default function AILabPanel({ subject }: AILabPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "init",
    role: "ai",
    content: `Welcome to the ${subject.name} AI Lab! Drop an image here (like a math shape, a science diagram, or historical photo), and I'll explain it in the context of your Class ${subject.standard || '8'} syllabus.`,
    timestamp: new Date()
  }]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgData = e.target?.result as string;
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: "What does this image relate to in my syllabus?",
        imagePreview: imgData,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();
      simulateAIResponse(subject.name, subject.standard);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImage(e.target.files[0]);
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    scrollToBottom();
    simulateAIResponse(subject.name, subject.standard);
  };

  const simulateAIResponse = (subj: string, standard: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = "";
      const lowerSubj = subj.toLowerCase();
      
      if (lowerSubj.includes("math")) {
        response = `Based on the image provided, this appears to be related to **Geometry**. \n\nIn your Class ${standard || '8'} syllabus, this falls under **Chapter 4: Understanding Shapes**.\n\nKey concepts you should focus on:\n- Properties of polygons\n- Calculating area and perimeter\n- Understanding interior and exterior angles\n\nWould you like a quick quiz on this topic?`;
      } else if (lowerSubj.includes("sci")) {
        response = `This looks like a diagram of a **Plant Cell**. \n\nIn Class ${standard || '8'} Science, you can find this in **Chapter 8: Cell Structure and Functions**.\n\nNotice the distinct cell wall and large vacuole which differentiates it from an animal cell. Let me know if you want me to highlight the mitochondria!`;
      } else {
        response = `I've analyzed the image. This relates directly to your **${subj}** syllabus for Class ${standard || '8'}. We can dive deeper into this topic if you'd like. What specific part would you like me to explain?`;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: response,
        timestamp: new Date()
      }]);
      
      setIsTyping(false);
      scrollToBottom();
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-navy-900/40 border border-white/10 rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3" style={{ borderBottomColor: `${subject.color}30` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: subject.color }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">AI Lab</h3>
          <p className="text-xs text-muted-foreground">{subject.name} Context Active</p>
        </div>
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-teal/20 backdrop-blur-md border-2 border-dashed border-teal flex flex-col items-center justify-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 bg-teal/20 rounded-full flex items-center justify-center text-teal mb-4 animate-bounce">
              <Upload size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Drop Image Here</h3>
            <p className="text-teal-100">AI will analyze it instantly</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
        onDragOver={handleDragOver}
      >
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === "ai" ? "bg-teal/20 text-teal" : "bg-white/10 text-white"
            )}>
              {msg.role === "ai" ? <Bot size={16} /> : <div className="text-[10px] font-bold">ME</div>}
            </div>
            
            <div className={cn(
              "p-3 rounded-2xl text-sm",
              msg.role === "user" ? "bg-white/10 text-white rounded-tr-none" : "bg-teal/10 text-teal-50 border border-teal/20 rounded-tl-none"
            )}>
              {msg.imagePreview && (
                <div className="mb-3 rounded-xl overflow-hidden border border-white/20">
                  <img src={msg.imagePreview} alt="Uploaded" className="w-full object-cover max-h-48" />
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 max-w-[85%]"
          >
            <div className="w-8 h-8 rounded-full bg-teal/20 text-teal flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl bg-teal/10 border border-teal/20 rounded-tl-none flex items-center gap-2">
              <Loader2 size={16} className="text-teal animate-spin" />
              <span className="text-sm text-teal">Analyzing...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-navy-950/50">
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
          >
            <ImageIcon size={18} />
          </button>
          
          <input 
            type="text" 
            placeholder="Ask a question or drop an image..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendText()}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal/50 transition-colors"
          />
          
          <button 
            onClick={handleSendText}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-teal hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal flex items-center justify-center text-navy-900 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
