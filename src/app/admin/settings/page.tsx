"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings, Save, School, Shield, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  
  const [settings, setSettings] = useState({
    schoolName: schoolName || "AI Tutor",
    contactEmail: "admin@dps.edu",
    allowParentRegistration: true,
    aiFeaturesEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
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
      const promises = Object.entries(settings).map(([key, value]) => 
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        })
      );
      
      await Promise.all(promises);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor"} pageTitle="Settings" pageSubtitle="Manage school configurations">
      <div className="max-w-2xl mx-auto glass-card-static p-6 rounded-2xl space-y-6">
        <h3 className="text-xl font-semibold border-b border-white/10 pb-4">General Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">School Name</label>
            <input 
              type="text" 
              value={settings.schoolName}
              onChange={(e) => setSettings({...settings, schoolName: e.target.value})}
              className="glass-input w-full px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Email</label>
            <input 
              type="email" 
              value={settings.contactEmail}
              onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
              className="glass-input w-full px-4 py-2"
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold border-b border-white/10 pb-4 mt-8 pt-4">Feature Toggles</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.allowParentRegistration}
              onChange={(e) => setSettings({...settings, allowParentRegistration: e.target.checked})}
              className="w-4 h-4 rounded bg-white/5 border-white/20 text-teal focus:ring-teal"
            />
            <span className="text-sm">Allow Self-Registration for Parents</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.aiFeaturesEnabled}
              onChange={(e) => setSettings({...settings, aiFeaturesEnabled: e.target.checked})}
              className="w-4 h-4 rounded bg-white/5 border-white/20 text-teal focus:ring-teal"
            />
            <span className="text-sm">Enable AI Tutor Features School-wide</span>
          </label>
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
