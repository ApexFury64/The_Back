"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  labelPrefix?: string;
  currentStandard?: string | null;
}

export default function CustomDropdown({ options, value, onChange, labelPrefix = "Standard", currentStandard }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatOption = (opt: string) => {
    if (opt === "All") return `All ${labelPrefix}s`;
    if (labelPrefix === "Standard" && opt !== "Other") return `${opt}th Standard`;
    if (labelPrefix === "Class" && opt !== "Other") return `Class ${opt}`;
    return opt;
  };

  return (
    <div className="relative shrink-0 z-50 inline-flex flex-col items-end" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "glass-input flex items-center justify-between gap-3 bg-navy-800/80 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all shadow-lg min-w-[150px]",
          isOpen ? "border-teal bg-white/10 ring-1 ring-teal/30" : "hover:border-white/20 hover:bg-white/5"
        )}
      >
        <span className="truncate">{formatOption(value)}</span>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-[calc(100%+8px)] right-0 min-w-[100%] w-max bg-navy-900/95 backdrop-blur-2xl p-1.5 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-xl max-h-64 overflow-y-auto no-scrollbar z-[60] origin-top-right"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left group",
                  value === opt ? "bg-teal/20 text-teal font-bold" : "text-white/80 hover:bg-white/15 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{formatOption(opt)}</span>
                  {currentStandard && opt === currentStandard && (
                    <span className="px-1.5 py-0.5 bg-white/20 text-white rounded text-[9px] uppercase tracking-wider font-bold">Current</span>
                  )}
                </div>
                {value === opt && <Check size={14} className="text-teal" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
