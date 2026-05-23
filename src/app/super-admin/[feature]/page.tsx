"use client";

import React from "react";
import { use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePlaceholder from "@/components/dashboard/FeaturePlaceholder";

export default function SuperAdminFeaturePage({ params }: { params: Promise<{ feature: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <DashboardLayout
      role="super-admin"
      userName="Super Admin"
      schoolName="TechWing Platform"
    >
      <FeaturePlaceholder title={resolvedParams.feature} role="super-admin" />
    </DashboardLayout>
  );
}
