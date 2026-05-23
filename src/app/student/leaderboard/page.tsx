"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Flame, Star, ChevronUp, ChevronDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderboard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function StudentLeaderboardPage() {
  const [activeSubject, setActiveSubject] = useState("Overall");
  const subjects = ["Overall", "Math", "Science", "English", "Social Science", "Hindi"];

  // Mock deterministic shuffle based on subject to show different leaderboards
  const getSubjectLeaderboard = () => {
    if (activeSubject === "Overall") return leaderboard;
    const offset = activeSubject.length % leaderboard.length;
    return [...leaderboard.slice(offset), ...leaderboard.slice(0, offset)].map((s, i) => ({ ...s, rank: i + 1 }));
  };

  const currentLeaderboard = getSubjectLeaderboard();
  const top3 = [currentLeaderboard[1], currentLeaderboard[0], currentLeaderboard[2]];

  return (
    <DashboardLayout
      role="student"
      userName="Arjun Reddy"
      schoolName="Class 7-B • Delhi Public School"
      pageTitle="Class Leaderboard"
      pageSubtitle="See how you stack up against your peers"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Subject Filter */}
        <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
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

        {/* Podium */}
        <div className="flex justify-center items-end gap-2 sm:gap-6 pt-10 h-64">
          {top3.map((student, index) => {
            const isFirst = index === 1;
            const isSecond = index === 0;
            const isThird = index === 2;
            
            return (
              <motion.div
                key={student.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, type: "spring" }}
                className={cn(
                  "flex flex-col items-center w-24 sm:w-32 relative",
                  isFirst ? "z-10" : "z-0"
                )}
              >
                {/* Crown/Medal */}
                <div className="absolute -top-10">
                  {isFirst && <Trophy size={32} className="text-amber drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />}
                  {isSecond && <Medal size={24} className="text-slate-300" />}
                  {isThird && <Medal size={24} className="text-amber-700" />}
                </div>

                {/* Avatar */}
                <div className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xl z-10 border-4",
                  isFirst ? "bg-gradient-to-br from-amber-300 to-amber-600 border-amber text-white" : 
                  isSecond ? "bg-gradient-to-br from-slate-200 to-slate-400 border-slate-300 text-slate-800" : 
                  "bg-gradient-to-br from-amber-600 to-amber-800 border-amber-700 text-white"
                )}>
                  {student.avatar}
                </div>

                {/* Name & Score */}
                <div className="text-center mt-3 mb-2">
                  <p className="font-bold text-sm sm:text-base truncate w-full">{student.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Flame size={12} className={isFirst ? "text-amber" : "text-muted-foreground"} /> 
                    {student.score}
                  </p>
                </div>

                {/* Podium Block */}
                <div className={cn(
                  "w-full rounded-t-xl glass-card-static border-b-0",
                  isFirst ? "h-24 bg-amber/10 border-amber/20" : 
                  isSecond ? "h-16 bg-slate-300/10 border-slate-300/20" : 
                  "h-12 bg-amber-700/10 border-amber-700/20"
                )}>
                  <div className="w-full h-full flex items-center justify-center font-bold opacity-50 text-2xl">
                    {student.rank}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* List */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="font-semibold">Top Performers</h3>
            <span className="text-xs text-muted-foreground">Updated hourly</span>
          </div>
          
          <div className="divide-y divide-white/5">
            {currentLeaderboard.map((student, i) => (
              <motion.div
                key={student.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-white/5 transition-colors",
                  student.name === "Arjun Reddy" && "bg-teal/5 border-l-2 border-l-teal"
                )}
              >
                <div className="w-8 font-bold text-muted-foreground text-center">
                  #{student.rank}
                </div>
                
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                  {student.avatar}
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold flex items-center gap-2">
                    {student.name}
                    {student.name === "Arjun Reddy" && <span className="text-[10px] bg-teal/20 text-teal px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold flex items-center gap-1.5 justify-end">
                    {student.score} <Star size={14} className="text-teal" />
                  </p>
                  {i % 2 === 0 ? (
                    <p className="text-[10px] text-teal flex items-center justify-end"><ChevronUp size={12} /> 2 ranks</p>
                  ) : (
                    <p className="text-[10px] text-coral flex items-center justify-end"><ChevronDown size={12} /> 1 rank</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
