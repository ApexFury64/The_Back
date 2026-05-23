"use client";

import React from "react";
import { use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePlaceholder from "@/components/dashboard/FeaturePlaceholder";

export default function AdminFeaturePage({ params }: { params: Promise<{ feature: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <DashboardLayout
      role="admin"
      userName="Admin Portal"
      schoolName="Delhi Public School"
    >
      <FeaturePlaceholder title={resolvedParams.feature} role="admin" />
    </DashboardLayout>
  );
}
