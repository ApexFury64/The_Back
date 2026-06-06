"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Brain, Target, FileText, BarChart3,
  Calendar, Trophy, Users, MessageSquare, Settings, LogOut,
  GraduationCap, Bot, ClipboardList, Video, Upload, School,
  Building2, Cpu, Shield, Activity, ChevronLeft, ChevronRight,
  Sparkles, UserCheck, Bell, Home, Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { useAppStore } from "@/lib/store";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
}

const sidebarConfig: Record<UserRole, { title: string; items: SidebarItem[] }> = {
  student: {
    title: "Student",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/student" },
      { label: "AI Tutor", icon: <Bot size={20} />, href: "/student/ai-tutor", badge: "AI" },
      { label: "Subjects", icon: <BookOpen size={20} />, href: "/student/subjects" },
      { label: "Quizzes", icon: <Brain size={20} />, href: "/student/quizzes" },
      { label: "Assignments", icon: <FileText size={20} />, href: "/student/assignments", badge: 3 },
      { label: "Study Planner", icon: <Calendar size={20} />, href: "/student/study-planner" },
      { label: "Leaderboard", icon: <Trophy size={20} />, href: "/student/leaderboard" },
      { label: "Notifications", icon: <Bell size={20} />, href: "/student/notifications" },
    ],
  },
  parent: {
    title: "Parent",
    items: [
      { label: "Dashboard", icon: <Home size={20} />, href: "/parent" },
      { label: "Child Progress", icon: <Target size={20} />, href: "/parent/child-progress" },
      { label: "Reports", icon: <BarChart3 size={20} />, href: "/parent/reports" },
      { label: "Activity Log", icon: <Activity size={20} />, href: "/parent/activity" },
      { label: "Communication", icon: <MessageSquare size={20} />, href: "/parent/communication" },
      { label: "Notifications", icon: <Bell size={20} />, href: "/parent/notifications" },
    ],
  },
  teacher: {
    title: "Teacher",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/teacher" },
      { label: "My Classes", icon: <School size={20} />, href: "/teacher/classes" },
      { label: "Materials", icon: <Upload size={20} />, href: "/teacher/materials" },
      { label: "Assignments", icon: <ClipboardList size={20} />, href: "/teacher/assignments", badge: 5 },
      { label: "AI Tools", icon: <Sparkles size={20} />, href: "/teacher/ai-tools", badge: "AI" },
      { label: "Live Classes", icon: <Video size={20} />, href: "/teacher/live-classes" },
      { label: "Notifications", icon: <Bell size={20} />, href: "/teacher/notifications" },
    ],
  },
  admin: {
    title: "School Admin",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
      { label: "Students", icon: <GraduationCap size={20} />, href: "/admin/students" },
      { label: "Teachers", icon: <UserCheck size={20} />, href: "/admin/teachers" },
      { label: "Classes", icon: <School size={20} />, href: "/admin/classes" },
      { label: "Announcements", icon: <Megaphone size={20} />, href: "/admin/announcements" },
      { label: "Analytics", icon: <BarChart3 size={20} />, href: "/admin/analytics" },
      { label: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
    ],
  },
  "super-admin": {
    title: "Platform Admin",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/super-admin" },
      { label: "Schools", icon: <Building2 size={20} />, href: "/super-admin/schools" },
      { label: "Analytics", icon: <BarChart3 size={20} />, href: "/super-admin/analytics" },
      { label: "AI System", icon: <Cpu size={20} />, href: "/super-admin/ai-system" },
      { label: "Moderation", icon: <Shield size={20} />, href: "/super-admin/moderation" },
      { label: "System Health", icon: <Activity size={20} />, href: "/super-admin/system" },
      { label: "Settings", icon: <Settings size={20} />, href: "/super-admin/settings" },
    ],
  },
};

interface SidebarProps {
  role: UserRole;
  userName?: string;
  schoolName?: string;
}

import AILogo from "@/components/ui/AILogo";

export default function Sidebar({ role, userName = "User", schoolName = "AI Tutor" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const config = sidebarConfig[role];

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="glass-sidebar hidden lg:flex flex-col h-screen sticky top-0 z-40"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="flex items-center justify-center flex-shrink-0">
            <AILogo size={36} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <h1 className="text-base font-bold gradient-text whitespace-nowrap">AI Tutor</h1>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">{config.title} Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {config.items.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${role}` && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-teal/10 text-teal"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-teal"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="flex-shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && item.badge && (
                    <span className={cn(
                      "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      item.badge === "AI"
                        ? "bg-gradient-to-r from-teal/20 to-cyan/20 text-teal"
                        : "bg-coral/15 text-coral"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal/30 to-cyan/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-teal">
              {userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{schoolName}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                useAppStore.getState().logout();
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 mt-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-coral rounded-lg hover:bg-coral/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-navy-700 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-teal hover:border-teal/30 transition-all z-50"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-navbar border-t border-white/5">
        <div className="flex items-center justify-around px-2 py-2">
          {config.items.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                  isActive ? "text-teal" : "text-muted-foreground"
                )}>
                  {item.icon}
                  <span className="text-[9px] font-medium">{item.label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-teal" />}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
