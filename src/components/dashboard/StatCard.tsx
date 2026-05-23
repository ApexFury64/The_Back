"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, Brain, Target, Flame, Award, CheckCircle, FileText, Users, BookOpen, FileCheck, School, Bot, GraduationCap, Building2, Cpu, IndianRupee, Activity, Briefcase, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  Clock: <Clock size={20} />,
  Brain: <Brain size={20} />,
  Target: <Target size={20} />,
  Flame: <Flame size={20} />,
  Award: <Award size={20} />,
  CheckCircle: <CheckCircle size={20} />,
  FileText: <FileText size={20} />,
  Users: <Users size={20} />,
  BookOpen: <BookOpen size={20} />,
  FileCheck: <FileCheck size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  School: <School size={20} />,
  Bot: <Bot size={20} />,
  GraduationCap: <GraduationCap size={20} />,
  Building2: <Building2 size={20} />,
  Cpu: <Cpu size={20} />,
  IndianRupee: <IndianRupee size={20} />,
  Activity: <Activity size={20} />,
  Briefcase: <Briefcase size={20} />,
  AlertCircle: <AlertCircle size={20} />,
};

interface StatCardProps {
  stat: any;
  index: number;
}

export default function StatCard({ stat, index }: StatCardProps) {
  // Let's alternate light and dark cards like the reference image's Reports
  const isLight = index % 2 !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        isLight ? "stat-card-light" : "stat-card"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "icon-circle flex-shrink-0",
              index % 4 === 0 ? "icon-circle-teal" :
              index % 4 === 1 ? "icon-circle-coral" :
              index % 4 === 2 ? "icon-circle-purple" : "icon-circle-amber"
            )}
          >
            <div className="text-white z-10 relative">
              {iconMap[stat.icon] || <Activity size={20} />}
            </div>
          </div>
          {stat.trend && (
             <span className={cn(
               "mt-1",
               stat.trendUp === true ? "badge-green" :
               stat.trendUp === false ? "badge-red" : "badge-amber"
             )}>
               {stat.trend}
             </span>
          )}
        </div>
        
        <div className="mt-auto">
          <p className={cn(
            "text-xs font-medium mb-1",
            isLight ? "text-slate-500" : "text-muted-foreground"
          )}>{stat.title}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
        </div>
      </div>
    </motion.div>
  );
}
