"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Video, BookOpen, Bot } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudentStudyPlannerPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userEmail = useAppStore(s => s.userEmail);

  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const email = userEmail || 'student@dps.edu';
        // Ensure date is formatted YYYY-MM-DD
        const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
        
        const res = await fetch(`/api/student/planner?userEmail=${email}&date=${formattedDate}`);
        const data = await res.json();
        if (data.schedule) setSchedule(data.schedule);
      } catch (error) {
        console.error("Failed to fetch schedule", error);
      }
      setLoading(false);
    };

    fetchSchedule();
  }, [userEmail, selectedDate, currentMonth, currentYear]);

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "self-study", time: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create Date objects for start/end time on the selected date
    const [hours, minutes] = newEvent.time.split(':');
    const startTime = new Date(currentYear, currentMonth, selectedDate, parseInt(hours), parseInt(minutes));
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration default

    try {
      const email = userEmail || 'student@dps.edu';
      const res = await fetch('/api/student/planner/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newEvent.title,
          type: newEvent.type,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          studentEmail: email
        })
      });
      
      if (res.ok) {
        toast.success("Event added successfully");
        setIsModalOpen(false);
        setNewEvent({ title: "", type: "self-study", time: "" });
        // Refresh schedule
        const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
        const fetchRes = await fetch(`/api/student/planner?userEmail=${email}&date=${formattedDate}`);
        const data = await fetchRes.json();
        if (data.schedule) setSchedule(data.schedule);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add event");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout
      role="student"
      userName={userName || "Student"}
      schoolName={schoolName || "Delhi Public School"}
      pageTitle="Study Planner"
      pageSubtitle="Organize your learning schedule"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        
        {/* Left: Mini Calendar & Stats */}
        <div className="space-y-6">
          <div className="glass-card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{monthName} {currentYear}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(p => p === 0 ? 11 : p - 1)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setCurrentMonth(p => p === 11 ? 0 : p + 1)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {days.map(day => (
                <div key={day} className="text-[10px] font-bold text-muted-foreground uppercase">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {[...Array(new Date(currentYear, currentMonth, 1).getDay())].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const date = i + 1;
                const isSelected = date === selectedDate;
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "aspect-square rounded-full flex flex-col items-center justify-center text-sm relative transition-all",
                      isSelected ? "bg-teal text-navy-900 font-bold" : "hover:bg-white/10 text-muted-foreground"
                    )}
                  >
                    {date}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="glass-card-static p-6 bg-gradient-to-br from-indigo-500/10 to-transparent">
            <h3 className="font-bold text-indigo-400 mb-2">Upcoming Exam</h3>
            <p className="text-2xl font-bold mb-1">Term 1 Finals</p>
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <CalendarIcon size={14} /> Starts in 12 days
            </p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
              <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-[10px] text-right text-muted-foreground">Syllabus 60% covered</p>
          </div>
        </div>

        {/* Right: Daily Schedule */}
        <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Schedule for {monthName} {selectedDate}</h2>
              <p className="text-sm text-muted-foreground">{schedule.length} events scheduled</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="glass-button text-sm py-2">Add Event</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading schedule...</div>
            ) : schedule.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                No events scheduled for this day. Enjoy your free time!
              </div>
            ) : (
              schedule.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group"
                >
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-3 h-3 rounded-full mt-1.5"
                      style={{ backgroundColor: event.color, boxShadow: `0 0 10px ${event.color}40` }}
                    />
                    {i !== schedule.length - 1 && (
                      <div className="w-[2px] flex-1 bg-white/10 my-1 group-hover:bg-white/20 transition-colors" />
                    )}
                  </div>
                  
                  {/* Event Card */}
                  <div className="glass-card-static p-4 flex-1 mb-4 hover:-translate-y-1 transition-transform border-l-4" style={{ borderLeftColor: event.color }}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white/5" style={{ color: event.color }}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {event.time}</span>
                        {event.type === 'live' && <span className="flex items-center gap-1.5 text-teal"><Video size={14} /> Live Video</span>}
                        {event.type === 'assignment' && <span className="flex items-center gap-1.5 text-sky-400"><BookOpen size={14} /> Submission Due</span>}
                        {event.type === 'ai' && <span className="flex items-center gap-1.5 text-emerald-400"><Bot size={14} /> AI Session</span>}
                        {event.type === 'self-study' && <span className="flex items-center gap-1.5 text-purple-400"><BookOpen size={14} /> Self Study</span>}
                      </div>
                      
                      {event.type === 'live' && event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-xs bg-teal text-navy-900 font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 w-full sm:w-auto hover:bg-teal/80 transition-colors">
                          <Video size={12} /> Join Class
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10"
          >
            <h3 className="text-xl font-bold mb-1">Add Study Event</h3>
            <p className="text-xs text-muted-foreground mb-4">For {monthName} {selectedDate}, {currentYear}</p>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Title</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Time</label>
                  <input 
                    type="time" 
                    value={newEvent.time}
                    onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                    className="glass-input w-full px-4 py-2 text-sm [color-scheme:dark]" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Type</label>
                  <select 
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                    className="glass-input w-full px-4 py-2 text-sm bg-navy-900" 
                    required
                  >
                    <option value="self-study">Self Study</option>
                    <option value="ai">AI Session</option>
                  </select>
                </div>
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
                  disabled={isSubmitting}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center bg-teal text-navy-900 font-semibold border-none disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Event"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
