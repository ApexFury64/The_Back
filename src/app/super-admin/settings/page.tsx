"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings, Save, Server, Shield, Bell, Users } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { GlassSelect } from "@/components/ui/Select";

export default function SuperAdminSettingsPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  
  const [settings, setSettings] = useState({
    platformName: "AI Tutor Platform",
    maintenanceMode: false,
    maxSchools: 1000,
    globalModel: "gemini-1.5-pro",
    autoApproveSchools: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/super-admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each setting key-value pair to the database
      const promises = Object.entries(settings).map(([key, value]) => 
        fetch('/api/super-admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        })
      );
      
      await Promise.all(promises);
      toast.success("Platform Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="super-admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor Platform"} pageTitle="Platform Settings" pageSubtitle="Global configurations and preferences">
      <div className="max-w-2xl mx-auto glass-card-static p-6 rounded-2xl space-y-6">
        <h3 className="text-xl font-semibold border-b border-white/10 pb-4">Platform Identity</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Platform Name</label>
            <input 
              type="text" 
              value={settings.platformName}
              onChange={(e) => setSettings({...settings, platformName: e.target.value})}
              className="glass-input w-full px-4 py-2"
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold border-b border-white/10 pb-4 mt-8 pt-4 flex items-center gap-2"><Shield size={18}/> Access & Security</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="w-4 h-4 rounded bg-white/5 border-white/20 text-teal focus:ring-teal"
            />
            <span className="text-sm text-coral font-medium">Enable Maintenance Mode (Blocks all non-admin traffic)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.autoApproveSchools}
              onChange={(e) => setSettings({...settings, autoApproveSchools: e.target.checked})}
              className="w-4 h-4 rounded bg-white/5 border-white/20 text-teal focus:ring-teal"
            />
            <span className="text-sm">Auto-Approve New School Registrations</span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-1 mt-4">Default Global AI Model</label>
            <GlassSelect 
              value={settings.globalModel}
              onChange={(val) => setSettings({...settings, globalModel: val})}
              options={[
                { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Recommended)" },
                { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Fast)" },
                { value: "claude-3-opus", label: "Claude 3 Opus" }
              ]}
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button onClick={handleSave} className="glass-button px-6 py-2 flex items-center gap-2">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
