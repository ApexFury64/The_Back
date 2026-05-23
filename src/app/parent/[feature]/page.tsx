"use client";

import React from "react";
import { use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePlaceholder from "@/components/dashboard/FeaturePlaceholder";

export default function ParentFeaturePage({ params }: { params: Promise<{ feature: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <DashboardLayout
      role="parent"
      userName="Mr. Reddy"
      schoolName="Delhi Public School"
    >
      <FeaturePlaceholder title={resolvedParams.feature} role="parent" />
    </DashboardLayout>
  );
}
