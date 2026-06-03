"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Construction, Rocket, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeaturePlaceholderProps {
  title: string;
  role: string;
}

export default function FeaturePlaceholder({ title, role }: FeaturePlaceholderProps) {
  const router = useRouter();
  
  // Format the URL slug into a readable title
  const formattedTitle = title
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card-static max-w-lg w-full p-8 text-center relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center mb-6">
            <Rocket size={40} className="text-teal" />
          </div>
          
          <h2 className="text-3xl font-bold mb-3 gradient-text">
            {formattedTitle}
          </h2>
          
          <p className="text-muted-foreground mb-8 text-balance">
            This module is currently being built for the {role} portal. Our AI is hard at work forging the ultimate learning experience. Check back soon!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.back()}
              className="glass-button-secondary w-full sm:w-auto"
            >
              Go Back
            </button>
            <button 
              onClick={() => router.push(`/${role}`)}
              className="glass-button w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Back to Dashboard <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles size={14} className="text-amber" /> 
            Powered by AI Tutor
          </div>
        </div>
      </motion.div>
    </div>
  );
}
