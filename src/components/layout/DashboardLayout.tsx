"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import type { UserRole } from "@/types";
import { useAppStore } from "@/lib/store";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
  schoolName?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function DashboardLayout({
  children,
  role,
  userName: userNameProp,
  schoolName: schoolNameProp,
  pageTitle,
  pageSubtitle,
}: DashboardLayoutProps) {
  // Always prefer store values (populated by SessionSync) over prop-drilled values
  const storeUserName = useAppStore((s) => s.userName);
  const storeSchoolName = useAppStore((s) => s.schoolName);

  const resolvedUserName = storeUserName || userNameProp || "User";
  const resolvedSchoolName = storeSchoolName || schoolNameProp || "AI Tutor";

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} userName={resolvedUserName} schoolName={resolvedSchoolName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={pageTitle} subtitle={pageSubtitle} />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
