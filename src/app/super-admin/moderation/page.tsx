"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Shield, AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";

export default function SuperAdminModerationPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmReject, setConfirmReject] = useState<{isOpen: boolean; id: string}>({isOpen: false, id: ''});

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/moderation');
      const data = await res.json();
      if (data.flags) setFlags(data.flags);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleAction = async (id: string, status: string) => {
    try {
      await fetch('/api/super-admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchFlags();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout role="super-admin" userName={userName || "Super Admin"} schoolName={schoolName || "AI Tutor Platform"} pageTitle="Content Moderation" pageSubtitle="Review flagged content and system safety alerts">
      <div className="glass-card-static p-6 rounded-2xl">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Shield size={18} className="text-teal" /> Moderation Queue</h3>
        
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading queue...</div>
        ) : (
          <div className="space-y-4">
            {flags.map((f, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                key={f.id} 
                className={cn("glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border", f.status === 'pending' ? 'border-white/10 bg-white/5' : 'border-white/5 opacity-60')}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                      f.severity === "urgent" ? "bg-coral/20 text-coral" :
                      f.severity === "high" ? "bg-amber/20 text-amber" : "bg-cyan/20 text-cyan"
                    )}>{f.severity}</span>
                    <span className="text-xs text-muted-foreground font-mono">{f.date} • {f.user} ({f.email})</span>
                  </div>
                  <p className="text-sm font-medium">"{f.content}"</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle size={12} className="text-amber"/> {f.reason}</p>
                </div>
                
                {f.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setConfirmReject({ isOpen: true, id: f.id })}
                      className="glass-button-secondary px-4 py-2 text-sm text-coral hover:bg-coral/10 hover:border-coral/20 flex items-center gap-1"
                    >
                      <X size={14}/> Reject & Warn
                    </button>
                    <button 
                      onClick={() => handleAction(f.id, 'dismissed')}
                      className="glass-button px-4 py-2 text-sm flex items-center gap-1 border-none bg-teal text-navy-900 font-bold"
                    >
                      <Check size={14}/> Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4">
                    {f.status}
                  </div>
                )}
              </motion.div>
            ))}
            {flags.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center border border-dashed border-white/10 rounded-xl">Queue is empty. Great job!</p>}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmReject.isOpen}
        onClose={() => setConfirmReject({ isOpen: false, id: '' })}
        onConfirm={() => handleAction(confirmReject.id, 'reviewed')}
        title="Reject Content & Warn Student"
        message="Are you sure you want to reject this content? The student will receive an official warning on their record. This action cannot be undone."
        confirmText="Reject & Warn"
      />
    </DashboardLayout>
  );
}
