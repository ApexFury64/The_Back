"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { School, UserCheck, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AcademicNavigationTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: "classes", label: "Classes & Curriculum", href: "/admin/classes", icon: <School size={16} /> },
    { id: "teachers", label: "Teacher Registry", href: "/admin/teachers", icon: <UserCheck size={16} /> },
    { id: "students", label: "Student Directory", href: "/admin/students", icon: <GraduationCap size={16} /> },
  ];

  return (
    <div className="flex bg-black/30 p-1.5 rounded-2xl border border-white/5 w-full sm:w-fit mb-6 overflow-x-auto no-scrollbar gap-1">
      {tabs.map((tab) => {
        // Match active status either exactly or if page is nested
        const isActive = pathname === tab.href;
        
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap border border-transparent",
              isActive
                ? "bg-teal/10 text-teal-700 dark:text-teal border-teal/20 dark:border-teal/20 shadow-lg shadow-teal/5"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
