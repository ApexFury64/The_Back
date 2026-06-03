"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Cpu, Activity, AlertTriangle, Database } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";

export default function SuperAdminAISystemPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/super-admin/ai-metrics')
      .then(res => res.json())
      .then(data => {
        if (data.models) setModels(data.models);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout role="super-admin" userName={userName || "Super Admin"} schoolName={schoolName || "AI Tutor Global"} pageTitle="AI System Dashboard" pageSubtitle="Monitor AI models, token usage, and inference health">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card-static p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Database size={18} className="text-teal" /> Model Performance (30 Days)</h3>
          
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Aggregating AI Logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4 rounded-tl-xl">Model Name</th>
                    <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4">Status</th>
                    <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4">Total Requests</th>
                    <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4">Avg Latency</th>
                    <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4 rounded-tr-xl">Error Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      key={m.name} className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium flex items-center gap-2"><Cpu size={14} className="text-cyan" /> {m.name}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className="bg-teal/15 text-teal px-2 py-0.5 rounded-full font-medium tracking-wide uppercase text-[10px]">{m.status}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">{m.requests}</td>
                      <td className="py-3 px-4 text-xs font-mono">{m.latency}</td>
                      <td className="py-3 px-4 text-xs font-mono">{m.errorRate}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card-static p-6 rounded-2xl">
            <h3 className="text-sm font-semibold mb-4">Resource Allocation</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Global API Quota</span>
                  <span className="font-mono">82%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber h-full" style={{ width: '82%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Context Window Usage Avg</span>
                  <span className="font-mono">45%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal h-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card-static p-6 rounded-2xl border border-coral/20 bg-coral/5">
            <h3 className="text-sm font-semibold text-coral flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Alerts</h3>
            <p className="text-xs text-muted-foreground">High latency detected on Embedding-001 endpoint in region ap-south-1. Re-routing traffic to fallback clusters.</p>
            <p className="text-[10px] text-muted-foreground mt-2 font-mono">System logged: 12 mins ago</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
