"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, GraduationCap, Users, BookOpen, Shield, Building2, Eye, EyeOff, ArrowRight, Phone, Mail, KeyRound } from "lucide-react";
import type { UserRole } from "@/types";
import { useAppStore } from "@/lib/store";

import { signIn } from "next-auth/react";
import AILogo from "@/components/ui/AILogo";

const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string; loginMethod: string }[] = [
  { role: "student", label: "Student", icon: <GraduationCap size={22} />, color: "#00d4aa", loginMethod: "Student ID + Password" },
  { role: "parent", label: "Parent", icon: <Users size={22} />, color: "#0ea5e9", loginMethod: "Phone + OTP" },
  { role: "teacher", label: "Teacher", icon: <BookOpen size={22} />, color: "#a78bfa", loginMethod: "Email + Password" },
  { role: "admin", label: "School Admin", icon: <Shield size={22} />, color: "#f59e0b", loginMethod: "Email + Password" },
  { role: "super-admin", label: "Super Admin", icon: <Building2 size={22} />, color: "#f97066", loginMethod: "Email + Password" },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setUser = useAppStore(s => s.setUser);
  const formRef = useRef<HTMLFormElement>(null);

  const currentRole = roles.find((r) => r.role === selectedRole)!;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(formRef.current!);
    const email = (formData.get('email') as string) || (formData.get('phone') as string) || '';
    const password = (formData.get('password') as string) || '';

    let resolvedEmail = email;

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: resolvedEmail,
        password,
      });

      if (res?.error) {
        setError(res.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Instead of fetching session manually, we can just redirect.
      // The session will be fetched automatically by the protected routes,
      // but for the global store, we can rely on NextAuth's SessionProvider.
      // For now, just redirect to the dashboard.

      // Note: We might want to use useSession() inside layout to set global state
      // but for now, redirecting will trigger a page reload that initializes it.

      // Clear old store data before redirecting to avoid profile name caching
      useAppStore.getState().logout();
      window.location.href = `/${selectedRole}`;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connection failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/10 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan/10 rounded-full blur-[128px] animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex items-center justify-center">
              <AILogo size={40} />
            </div>
            <span className="text-xl font-bold gradient-text">AI Tutor</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your learning ecosystem</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-1.5 mb-6 p-1.5 glass-card-static rounded-2xl">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-medium transition-all duration-200 ${
                selectedRole === r.role
                  ? "bg-white/10 text-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <span style={{ color: selectedRole === r.role ? r.color : undefined }}>{r.icon}</span>
              <span className="hidden sm:block">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Login Form */}
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-card-static p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentRole.color}15`, color: currentRole.color }}>
              {currentRole.icon}
            </div>
            <div>
              <h2 className="text-base font-semibold">{currentRole.label} Login</h2>
              <p className="text-[11px] text-muted-foreground">{currentRole.loginMethod}</p>
            </div>
          </div>

          {error && <p className="text-coral text-xs mb-2">{error}</p>}

          <form ref={formRef} onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            {selectedRole === "parent" ? (
              <>
                {/* Parent: Email (Originally Phone) + Password (OTP) */}
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Email / Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" name="email" autoComplete="off" placeholder="Enter your email or phone" className="glass-input w-full pl-10 pr-4 py-2.5 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">OTP / Password</label>
                  <div className="flex gap-2">
                    <input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" placeholder="Enter your password" className="glass-input w-full py-2.5 text-sm px-4" required />
                  </div>
                </div>
              </>
            ) : selectedRole === "student" ? (
              <>
                {/* Student: ID + Password */}
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Student ID (Email)</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" name="email" autoComplete="off" placeholder="Enter your student email" className="glass-input w-full pl-10 pr-4 py-2.5 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" placeholder="Enter your password" className="glass-input w-full pl-4 pr-10 py-2.5 text-sm" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Teacher/Admin/SuperAdmin: Email + Password */}
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" name="email" autoComplete="off" placeholder="Enter your email address" className="glass-input w-full pl-10 pr-4 py-2.5 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" placeholder="Enter your password" className="glass-input w-full pl-4 pr-10 py-2.5 text-sm" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/5 text-teal focus:ring-teal" />
                Remember me
              </label>
              <a href="#" className="text-xs text-teal hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="glass-button w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {selectedRole === "student" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Don&apos;t have an account? Contact your school admin.
            </p>
          )}
        </motion.div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
