"use client";

import React from "react";
import { use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePlaceholder from "@/components/dashboard/FeaturePlaceholder";
import { useAppStore } from "@/lib/store";

export default function TeacherFeaturePage({ params }: { params: Promise<{ feature: string }> }) {
  const resolvedParams = use(params);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  
  return (
    <DashboardLayout
      role="teacher"
      userName={userName || "Teacher"}
      schoolName={schoolName || "AI Tutor"}
    >
      <FeaturePlaceholder title={resolvedParams.feature} role="teacher" />
    </DashboardLayout>
  );
}
