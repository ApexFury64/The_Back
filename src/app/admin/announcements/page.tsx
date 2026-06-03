"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Megaphone, Send } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function AdminAnnouncementsPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userEmail = useAppStore(s => s.userEmail);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "medium"
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const email = userEmail || 'admin@dps-hyd.edu';
      const res = await fetch(`/api/admin/announcements?adminEmail=${email}`);
      const data = await res.json();
      if (data.announcements) setAnnouncements(data.announcements);
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [userEmail]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const email = userEmail || 'admin@dps-hyd.edu';
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAnnouncement, adminEmail: email })
      });
      setNewAnnouncement({ title: "", content: "", priority: "medium" });
      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to broadcast announcement", error);
    }
  };

  return (
    <DashboardLayout role="admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor"} pageTitle="Announcements" pageSubtitle="Manage school-wide notices">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 glass-card-static p-6 rounded-2xl h-fit">
          <h3 className="text-lg font-semibold mb-4">Create Announcement</h3>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <input 
              type="text" 
              placeholder="Announcement Title" 
              value={newAnnouncement.title}
              onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
              className="glass-input w-full px-4 py-2 text-sm" 
              required
            />
            <textarea 
              placeholder="Type your message here..." 
              value={newAnnouncement.content}
              onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
              className="glass-input w-full px-4 py-2 text-sm min-h-[100px]" 
              required
            />
            <div className="flex items-center gap-4">
              <select 
                value={newAnnouncement.priority}
                onChange={e => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                className="glass-input px-4 py-2 text-sm flex-1 bg-navy-900"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <button type="submit" className="glass-button px-6 py-2 flex items-center gap-2 bg-teal text-navy-900 border-none font-semibold">
                <Send size={16} /> Broadcast
              </button>
            </div>
          </form>
        </div>

        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold px-2">Recent Broadcasts</h3>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="glass-card-static p-4 rounded-xl text-center text-muted-foreground text-sm border-dashed border-white/20">
              No announcements published yet.
            </div>
          ) : announcements.map(a => (
            <div key={a.id} className="glass-card-static p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Megaphone size={14} className={a.priority === 'urgent' ? 'text-coral' : a.priority === 'high' ? 'text-amber' : 'text-teal'} /> 
                  {a.title}
                </h4>
                <span className="text-[10px] text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{a.content}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium uppercase tracking-wider">Priority: {a.priority}</span>
                <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium text-muted-foreground">Author: {a.author?.name || 'Admin'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
