"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import type { UserRole } from "@/types";

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
  userName,
  schoolName,
  pageTitle,
  pageSubtitle,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} userName={userName} schoolName={schoolName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={pageTitle} subtitle={pageSubtitle} />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
