"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Video } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

// Mock schedule data
const schedule = [
  { id: 1, title: "Mathematics Live Class", time: "09:00 AM - 10:00 AM", type: "live", subject: "Math", color: "#00d4aa" },
  { id: 2, title: "Physics Lab Simulation", time: "10:30 AM - 11:30 AM", type: "assignment", subject: "Physics", color: "#0ea5e9" },
  { id: 3, title: "AI Tutor Session (Biology)", time: "01:00 PM - 02:00 PM", type: "ai", subject: "Biology", color: "#34d399" },
  { id: 4, title: "English Essay Review", time: "03:00 PM - 04:00 PM", type: "self-study", subject: "English", color: "#8b5cf6" },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudentStudyPlannerPage() {
  const [selectedDate, setSelectedDate] = useState(15);

  return (
    <DashboardLayout
      role="student"
      userName="Arjun Reddy"
      schoolName="Class 7-B • Delhi Public School"
      pageTitle="Study Planner"
      pageSubtitle="Organize your learning schedule"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        
        {/* Left: Mini Calendar & Stats */}
        <div className="space-y-6">
          <div className="glass-card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">October 2026</h3>
              <div className="flex gap-2">
                <button className="p-1 text-muted-foreground hover:text-foreground"><ChevronLeft size={18} /></button>
                <button className="p-1 text-muted-foreground hover:text-foreground"><ChevronRight size={18} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {days.map(day => (
                <div key={day} className="text-[10px] font-bold text-muted-foreground uppercase">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {[...Array(31)].map((_, i) => {
                const date = i + 1;
                const isSelected = date === selectedDate;
                const hasEvent = [4, 12, 15, 18, 24].includes(date);
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "aspect-square rounded-full flex flex-col items-center justify-center text-sm relative transition-all",
                      isSelected ? "bg-teal text-white font-bold" : "hover:bg-white/10",
                      !isSelected && hasEvent && "font-bold text-teal"
                    )}
                  >
                    {date}
                    {hasEvent && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-teal absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="glass-card-static p-6 bg-gradient-to-br from-indigo-500/10 to-transparent">
            <h3 className="font-bold text-indigo-400 mb-2">Upcoming Exam</h3>
            <p className="text-2xl font-bold mb-1">Term 1 Finals</p>
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <CalendarIcon size={14} /> Starts in 12 days
            </p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
              <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-[10px] text-right text-muted-foreground">Syllabus 60% covered</p>
          </div>
        </div>

        {/* Right: Daily Schedule */}
        <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Schedule for Oct {selectedDate}</h2>
              <p className="text-sm text-muted-foreground">4 events scheduled</p>
            </div>
            <button className="glass-button text-sm py-2">Add Event</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {schedule.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 group"
              >
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div 
                    className="w-3 h-3 rounded-full mt-1.5"
                    style={{ backgroundColor: event.color, boxShadow: `0 0 10px ${event.color}40` }}
                  />
                  {i !== schedule.length - 1 && (
                    <div className="w-[2px] flex-1 bg-white/10 my-1 group-hover:bg-white/20 transition-colors" />
                  )}
                </div>
                
                {/* Event Card */}
                <div className="glass-card-static p-4 flex-1 mb-4 hover:-translate-y-1 transition-transform border-l-4" style={{ borderLeftColor: event.color }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{event.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white/5" style={{ color: event.color }}>
                      {event.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {event.time}</span>
                    {event.type === 'live' ? (
                      <span className="flex items-center gap-1.5 text-teal"><Video size={14} /> Zoom Link</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> TechWing Portal</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
