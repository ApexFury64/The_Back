"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Phone, Video, Search, User, Megaphone } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function CommunicationPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userEmail = useAppStore(s => s.userEmail);
  // Wait, if userId isn't in store, the API uses session cookie anyway for senderId. 
  // But we need receiverId for sending. 

  const [activeTab, setActiveTab] = useState<"messages" | "announcements">("announcements");
  
  // Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [teachers, setTeachers] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "announcements") {
      setLoading(true);
      const email = userEmail || 'parent@dps.edu';
      fetch(`/api/parent/communication?parentEmail=${email}`)
        .then(res => res.json())
        .then(data => {
          if (data.announcements) setAnnouncements(data.announcements);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else if (activeTab === "messages") {
      // Fetch teachers
      fetch('/api/messages/teachers')
        .then(res => res.json())
        .then(data => {
          if (data.teachers) {
            setTeachers(data.teachers);
            if (data.teachers.length > 0 && !activeChat) {
              setActiveChat(data.teachers[0]);
            }
          }
        });
    }
  }, [activeTab, userEmail]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeTab === "messages" && activeChat) {
      setChatLoading(true);
      fetch(`/api/messages?withUserId=${activeChat.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) setMessages(data.messages);
          setChatLoading(false);
        });
    }
  }, [activeChat, activeTab]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    const msgContent = input;
    setInput(""); // Optimistic clear
    
    // Optimistic append
    const tempMsg = {
      id: Date.now().toString(),
      senderId: 'me', // Hack for UI rendering
      receiverId: activeChat.id,
      content: msgContent,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activeChat.id, content: msgContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Update with real message ID (optional, we can just refetch)
    } catch (error) {
      console.error("Failed to send message", error);
      // Remove optimistic message on fail
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  return (
    <DashboardLayout
      role="parent"
      userName={userName || "Parent"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Communication"
      pageSubtitle="Announcements & Direct messaging"
    >
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 mb-6 pb-2">
        <button 
          onClick={() => setActiveTab("announcements")}
          className={cn("text-sm font-semibold transition-colors pb-2 border-b-2", activeTab === "announcements" ? "text-teal border-teal" : "text-muted-foreground border-transparent hover:text-white")}
        >
          <Megaphone size={16} className="inline mr-2" /> School Announcements
        </button>
        <button 
          onClick={() => setActiveTab("messages")}
          className={cn("text-sm font-semibold transition-colors pb-2 border-b-2", activeTab === "messages" ? "text-teal border-teal" : "text-muted-foreground border-transparent hover:text-white")}
        >
          <User size={16} className="inline mr-2" /> Direct Messages
        </button>
      </div>

      <div className="h-[calc(100vh-220px)] min-h-[500px]">
        {activeTab === "announcements" ? (
          <div className="glass-card-static rounded-2xl p-6 h-full overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">School Announcements</h3>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded-xl">No announcements available.</div>
            ) : (
              <div className="space-y-4">
                {announcements.map(a => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={a.id} className="glass-card p-5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Megaphone size={16} className={a.priority === 'urgent' ? 'text-coral' : a.priority === 'high' ? 'text-amber' : 'text-teal'} /> 
                        {a.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-4 whitespace-pre-wrap">{a.content}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium uppercase tracking-wider">Priority: {a.priority}</span>
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium text-muted-foreground">From: {a.author?.name || 'School Admin'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-full gap-6">
            {/* Contacts Sidebar */}
            <div className="w-full md:w-80 flex flex-col gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search teachers..." className="glass-input pl-10 pr-4 py-2 w-full text-sm" />
              </div>
              
              <div className="glass-card-static flex-1 overflow-y-auto rounded-2xl p-2 space-y-1">
                {teachers.map(teacher => (
                  <button 
                    key={teacher.id}
                    onClick={() => setActiveChat(teacher)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                      activeChat?.id === teacher.id ? "bg-teal/20 text-white" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center text-teal">
                        <User size={18} />
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-medium text-sm truncate">{teacher.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{teacher.primarySubject || 'Teacher'}</p>
                    </div>
                  </button>
                ))}
                {teachers.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">No teachers found.</div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col glass-card-static rounded-2xl overflow-hidden">
              {activeChat ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center text-teal">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{activeChat.name}</h3>
                        <p className="text-xs text-muted-foreground">{activeChat.primarySubject || 'Teacher'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatLoading ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">No messages yet. Send a message to start the conversation!</div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId === 'me' || msg.receiverId === activeChat.id; // basic hack to identify parent messages for now without having parent ID directly
                        
                        return (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                            <div className={cn("px-4 py-2.5 rounded-2xl text-sm", isMe ? "bg-teal text-navy-900 rounded-br-none" : "bg-white/10 text-foreground rounded-bl-none")}>
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 px-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex items-center gap-2 bg-white/5">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="glass-input flex-1 px-4 py-2.5 text-sm" />
                    <button type="submit" disabled={!input.trim()} className="glass-button p-2.5 disabled:opacity-50">
                      <Send size={18} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a teacher to start messaging
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
