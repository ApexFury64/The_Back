"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Sparkles, FileCheck, BookOpen, PenTool, LayoutTemplate, Bot } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function TeacherAIToolsPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const tools = [
    { icon: <FileCheck size={24} />, title: "Generate Question Paper", desc: "Instantly create a balanced question paper based on your syllabus, difficulty requirements, and past exams.", color: "#00d4aa", status: "Ready" },
    { icon: <BookOpen size={24} />, title: "Auto-Create Quiz", desc: "Generate a quick 10-question multiple-choice quiz for any topic to test student understanding.", color: "#0ea5e9", status: "Ready" },
    { icon: <PenTool size={24} />, title: "Essay Grader", desc: "AI-assisted grading for long-form answers, providing rubric-based feedback and suggested scores.", color: "#a78bfa", status: "Beta" },
    { icon: <LayoutTemplate size={24} />, title: "Lesson Plan Generator", desc: "Draft a comprehensive 45-minute lesson plan complete with learning objectives and activities.", color: "#f59e0b", status: "Ready" },
  ];

  return (
    <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"} pageTitle="AI Teaching Assistant" pageSubtitle="Supercharge your workflow with AI-powered tools">
      <div className="grid md:grid-cols-2 gap-6">
        {tools.map((tool, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-teal/30 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tool.status === 'Beta' ? 'bg-amber/20 text-amber' : 'bg-teal/20 text-teal'}`}>
                {tool.status}
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: `${tool.color}15`, color: tool.color }}>
              {tool.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-teal transition-colors">{tool.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{tool.desc}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-teal opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles size={16} /> Try it now &rarr;
            </div>
          </div>
        ))}

        <div className="md:col-span-2 glass-card-static p-6 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border-teal/20 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-teal/20 flex items-center justify-center text-teal flex-shrink-0 shadow-[0_0_30px_rgba(0,212,170,0.3)]">
            <Bot size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Have a custom request?</h3>
            <p className="text-sm text-muted-foreground mb-4">Chat with the AI Assistant to ask for specific materials, translations, or teaching strategies.</p>
            <button className="glass-button bg-teal text-navy-900 border-none font-bold px-6 py-2.5">
              Open Assistant Chat
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
