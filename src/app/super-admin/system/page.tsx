"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Activity, Server, Database, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function SuperAdminSystemPage() {
  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const email = userEmail || 'super@techwing.com';
    fetch(`/api/super-admin/dashboard?superAdminEmail=${email}`).then(res => res.json()).then(setData).catch(console.error);
  }, [userEmail]);

  if (!data) return <DashboardLayout role="super-admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor Platform"} pageTitle="System Health" pageSubtitle="Loading..."><div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="super-admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor Platform"} pageTitle="System Health & Logs" pageSubtitle="Monitor infrastructure and real-time logs">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card-static p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity size={18} className="text-teal" /> Global Services</h3>
          <div className="space-y-3">
            {data.systemHealthData.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  {item.status === "healthy" ? <CheckCircle size={16} className="text-teal" /> : <AlertCircle size={16} className="text-amber" />}
                  <span className="font-medium text-sm">{item.metric}</span>
                </div>
                <span className={cn(
                  "text-sm font-mono",
                  item.status === "healthy" ? "text-teal" : "text-amber"
                )}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-static p-6 rounded-2xl bg-[#0a0a0a] border-white/10 font-mono">
          <h3 className="text-sm font-semibold mb-4 text-white/70 flex items-center gap-2"><Server size={14} /> Server Logs (Live)</h3>
          <div className="space-y-1 text-xs overflow-hidden h-[300px]">
            <p className="text-teal">[INFO] Server started on port 3000</p>
            <p className="text-teal">[INFO] Connected to primary database</p>
            <p className="text-cyan">[DEBUG] Client connected: ws://localhost:3000/realtime</p>
            <p className="text-amber">[WARN] High latency on /api/ai/chat (245ms)</p>
            <p className="text-teal">[INFO] Auto-scaling event: adding 2 nodes to cluster-api-prod</p>
            <p className="text-cyan">[DEBUG] Garbage collection complete (1.2s)</p>
            <p className="text-coral">[ERROR] Rate limit exceeded for IP 192.168.1.104</p>
            <p className="text-teal animate-pulse">_</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
