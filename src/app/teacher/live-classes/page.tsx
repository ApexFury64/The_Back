"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Video, Calendar as CalendarIcon, Users, Clock, Play } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";

export default function TeacherLiveClassesPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userEmail = useAppStore(s => s.userEmail);

  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [sectionSubjects, setSectionSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    title: "",
    sectionSubjectId: "",
    date: "",
    startTime: "",
    endTime: "",
    meetingLink: ""
  });

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      const email = userEmail || 'teacher@dps.edu';
      const res = await fetch(`/api/teacher/live-classes?teacherEmail=${email}`);
      const data = await res.json();
      if (data.liveClasses) setUpcomingClasses(data.liveClasses);
      if (data.sectionSubjects) setSectionSubjects(data.sectionSubjects);
    } catch (error) {
      console.error("Failed to fetch live classes", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveClasses();
  }, [userEmail]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/teacher/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      });
      setIsModalOpen(false);
      setNewClass({ title: "", sectionSubjectId: "", date: "", startTime: "", endTime: "", meetingLink: "" });
      fetchLiveClasses();
    } catch (error) {
      console.error("Failed to schedule class", error);
    }
  };

  return (
    <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"} pageTitle="Live Classes" pageSubtitle="Schedule and conduct virtual classroom sessions">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="glass-card-static p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-navy-800 to-navy-900 border-cyan/20">
            <div>
              <h3 className="text-lg font-bold mb-1">Schedule a new session</h3>
              <p className="text-sm text-muted-foreground">Set up a video link for your students.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="glass-button bg-cyan text-navy-900 border-none font-bold px-6 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <CalendarIcon size={18} /> Schedule
            </button>
          </div>

          <h3 className="font-semibold text-lg px-2">Upcoming Schedule</h3>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading schedule...</div>
          ) : upcomingClasses.length === 0 ? (
            <div className="glass-card-static p-6 text-center text-muted-foreground rounded-2xl border-dashed border-white/20">
              No upcoming classes scheduled.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingClasses.map(c => {
                const isNow = new Date(`${c.date}T${c.startTime}`).getTime() <= Date.now() && new Date(`${c.date}T${c.endTime}`).getTime() >= Date.now();
                return (
                  <div key={c.id} className={`glass-card p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isNow ? 'border-teal/30 bg-teal/5' : 'border-white/5 hover:bg-white/5'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isNow ? 'bg-teal/20 text-teal' : 'bg-cyan/20 text-cyan'}`}>
                        <Video size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-base mb-1">{c.title}</h4>
                        <p className="text-xs text-muted-foreground font-medium mb-2">{c.class} ({c.subject})</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock size={14}/> {c.date} @ {c.startTime} - {c.endTime}</span>
                        </div>
                      </div>
                    </div>
                    <a 
                      href={c.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${isNow ? 'bg-teal text-navy-900' : 'glass-button-secondary'}`}
                    >
                      <Play size={16} /> {isNow ? 'Join Now' : 'Join Link'}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Calendar Side Panel Mock */}
        <div className="w-full md:w-80 glass-card-static p-6 rounded-2xl h-fit hidden md:block">
          <h3 className="font-semibold mb-4">Calendar</h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium mb-2 text-muted-foreground">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {Array.from({length: 31}).map((_, i) => (
              <div key={i} className={`p-1.5 rounded-md ${i+1 === new Date().getDate() ? 'bg-teal text-navy-900 font-bold' : 'hover:bg-white/5'}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10"
          >
            <h3 className="text-xl font-bold mb-4">Schedule Live Class</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Topic / Title</label>
                <input 
                  type="text" 
                  value={newClass.title}
                  onChange={e => setNewClass({...newClass, title: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Class Section</label>
                <select 
                  value={newClass.sectionSubjectId}
                  onChange={e => setNewClass({...newClass, sectionSubjectId: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm bg-navy-900" 
                  required
                >
                  <option value="" disabled>-- Select a Section --</option>
                  {sectionSubjects.map(ss => (
                    <option key={ss.id} value={ss.id}>
                      {ss.section.class.name}-{ss.section.name} ({ss.subject.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Date</label>
                  <input 
                    type="date" 
                    value={newClass.date}
                    onChange={e => setNewClass({...newClass, date: e.target.value})}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (err) {
                        console.error("showPicker not supported", err);
                      }
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="glass-input w-full px-4 py-2 text-sm text-foreground bg-white/5 border border-white/10 rounded-xl cursor-pointer" 
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Start Time</label>
                  <input 
                    type="time" 
                    value={newClass.startTime}
                    onChange={e => setNewClass({...newClass, startTime: e.target.value})}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (err) {
                        console.error("showPicker not supported", err);
                      }
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="glass-input w-full px-2 py-2 text-sm text-foreground bg-white/5 border border-white/10 rounded-xl cursor-pointer" 
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">End Time</label>
                  <input 
                    type="time" 
                    value={newClass.endTime}
                    onChange={e => setNewClass({...newClass, endTime: e.target.value})}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (err) {
                        console.error("showPicker not supported", err);
                      }
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="glass-input w-full px-2 py-2 text-sm text-foreground bg-white/5 border border-white/10 rounded-xl cursor-pointer" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Meeting Link (Zoom / Meet)</label>
                <input 
                  type="url" 
                  value={newClass.meetingLink}
                  onChange={e => setNewClass({...newClass, meetingLink: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm" 
                  placeholder="https://zoom.us/j/..."
                  required 
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center bg-cyan text-navy-900 font-bold border-none"
                >
                  Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
