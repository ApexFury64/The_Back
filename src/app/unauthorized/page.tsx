"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home, LogOut, Lock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { signOut } from "next-auth/react";
import Link from "next/link";
import AILogo from "@/components/ui/AILogo";

export default function UnauthorizedPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Get user details from global store
  const userRole = useAppStore((s) => s.userRole);
  const userName = useAppStore((s) => s.userName);
  const userEmail = useAppStore((s) => s.userEmail);
  const clearStore = useAppStore((s) => s.logout);

  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (userEmail && userRole) {
      setHasSession(true);
    }
  }, [userEmail, userRole]);

  // Load Lottie JSON animation dynamically on client-side
  useEffect(() => {
    let anim: any;
    import("lottie-web").then((lottieModule) => {
      if (containerRef.current) {
        anim = lottieModule.default.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/animations/unauthorized.json",
        });
      }
    });

    return () => {
      if (anim) {
        anim.destroy();
      }
    };
  }, []);

  // Determine dashboard route based on userRole
  const getDashboardPath = () => {
    const role = userRole?.toLowerCase();
    if (role === "student") return "/student";
    if (role === "parent") return "/parent";
    if (role === "teacher") return "/teacher";
    if (role === "schooladmin" || role === "admin") return "/admin";
    if (role === "superadmin" || role === "super-admin") return "/super-admin";
    return "/login";
  };

  const handleLogout = async () => {
    // Clear Zustand store
    clearStore();
    // Sign out from NextAuth session
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-[#060a13] text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative ambient glowing circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse duration-4000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] animate-pulse duration-6000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Top Header Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <AILogo size={36} />
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal to-cyan bg-clip-text text-transparent">
              AI Tutor
            </span>
          </Link>
        </div>

        {/* main Card Container */}
        <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl p-8 sm:p-10 text-center">
          {/* Top banner warning badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Lock size={12} className="animate-bounce" />
            <span>Access Blocked</span>
          </div>

          {/* Lottie Animation Container */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 mx-auto relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-rose-500/10 rounded-full blur-xl scale-75" />
            <div ref={containerRef} className="w-full h-full relative z-10" />
          </div>

          {/* Title and Descriptions */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-white">
            Restricted Territory
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            Your current account credentials do not grant access to this workspace directory. Please double-check your account role or sign in as an authorized user.
          </p>

          {/* Active Session details if logged in */}
          {hasSession && (
            <div className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-left max-w-sm mx-auto space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signed in as:</span>
                <span className="font-semibold text-white truncate max-w-[180px]">{userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role Level:</span>
                <span className="font-semibold px-2 py-0.5 rounded bg-teal/10 text-teal text-[10px] uppercase tracking-wider">
                  {userRole}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Account:</span>
                <span className="font-semibold text-white truncate max-w-[180px]">{userEmail}</span>
              </div>
            </div>
          )}

          {/* Action buttons list */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            {hasSession ? (
              <>
                <button
                  onClick={() => router.push(getDashboardPath())}
                  className="w-full sm:w-auto min-w-[170px] glass-button py-3 text-sm flex items-center justify-center gap-2 text-white bg-gradient-to-r from-teal to-cyan hover:opacity-90 transition-all cursor-pointer font-medium"
                >
                  <Home size={16} />
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto min-w-[170px] py-3 text-sm flex items-center justify-center gap-2 text-muted-foreground hover:text-white border border-white/10 hover:bg-white/5 rounded-xl transition-all cursor-pointer font-medium"
                >
                  <LogOut size={16} />
                  Switch Account
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto min-w-[200px] glass-button py-3 text-sm flex items-center justify-center gap-2 text-white bg-gradient-to-r from-teal to-cyan hover:opacity-90 transition-all cursor-pointer font-medium"
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
