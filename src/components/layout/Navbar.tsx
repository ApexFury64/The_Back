"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Sun, Moon, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications } from "@/lib/mock-data";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const [isDark, setIsDark] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
  };

  return (
    <header className="glass-navbar sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5">
            <Menu size={20} />
          </button>
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="glass-input w-full pl-9 pr-3 py-2 text-sm"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-coral text-[9px] font-bold flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-80 glass-card-static p-0 overflow-hidden shadow-2xl"
                >
                  <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      <span className="badge-teal">{unreadCount} new</span>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                          !notif.read && "bg-teal/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                            notif.type === "success" && "bg-teal",
                            notif.type === "warning" && "bg-amber",
                            notif.type === "alert" && "bg-coral",
                            notif.type === "info" && "bg-cyan"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/5">
                    <button className="w-full text-center text-xs text-teal font-medium hover:underline">
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
