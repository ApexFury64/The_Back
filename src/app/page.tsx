"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, BarChart3, Users, GraduationCap, Shield,
  BookOpen, Video, Globe, ChevronRight, Star, ArrowRight,
  CheckCircle, MessageSquare, Zap, Target, Bot, Play,
  ChevronDown, Menu, X, Clock, Award, TrendingUp, Cpu
} from "lucide-react";

/* ── Animated Counter ── */
function Counter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

/* ── Floating Orb Background ── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal/10 rounded-full blur-[128px] animate-float" />
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-cyan/10 rounded-full blur-[128px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple/8 rounded-full blur-[128px] animate-float" style={{ animationDelay: "4s" }} />
    </div>
  );
}

/* ── Navigation ── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-navbar shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-cyan flex items-center justify-center">
              <Sparkles size={20} className="text-navy-900" />
            </div>
            <span className="text-lg font-bold gradient-text">AI Tutor</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "For Students", "For Schools", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="glass-button-secondary text-sm px-4 py-2">Log In</Link>
            <Link href="/login" className="glass-button text-sm px-4 py-2">Get Started Free</Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card-static mx-4 mb-4 p-4 space-y-3"
          >
            {["Features", "For Students", "For Schools", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="block text-sm py-2 text-muted-foreground hover:text-foreground">
                {item}
              </a>
            ))}
            <Link href="/login" className="block glass-button text-sm text-center py-2 mt-3">Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon, title, description, delay = 0 }: { icon: React.ReactNode; title: string; description: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 group"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal/20 to-cyan/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ── Testimonial Card ── */
function TestimonialCard({ name, role, school, content, delay = 0 }: { name: string; role: string; school: string; content: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="text-amber fill-amber" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{content}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal/30 to-cyan/30 flex items-center justify-center text-xs font-bold text-teal">
          {name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-[11px] text-muted-foreground">{role}, {school}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── FAQ Accordion ── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card-static overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
        <span className="text-sm font-medium pr-4">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-muted-foreground flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Pricing Card ── */
function PricingCard({ name, price, features, popular = false, delay = 0 }: { name: string; price: string; features: string[]; popular?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`glass-card p-6 relative ${popular ? "border-teal/30 shadow-lg shadow-teal/10" : ""}`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-teal text-[11px] px-3 py-1">Most Popular</span>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-3 mb-5">
        <span className="text-3xl font-bold">{price}</span>
        {price !== "Custom" && <span className="text-sm text-muted-foreground"> / school / month</span>}
      </div>
      <ul className="space-y-2.5 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle size={16} className="text-teal flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button className={popular ? "glass-button w-full text-sm" : "glass-button-secondary w-full text-sm"}>
        {popular ? "Start Free Trial" : "Contact Sales"}
      </button>
    </motion.div>
  );
}


/* ═══════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <FloatingOrbs />
      <LandingNav />

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 badge-teal text-xs px-4 py-1.5 mb-6">
                <Sparkles size={14} /> AI-Powered Education Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight"
            >
              The Future of
              <br />
              <span className="gradient-text">Education is AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-balance"
            >
              AI Tutor replaces traditional tuition with an intelligent learning ecosystem. 
              Personalized AI tutoring, real-time analytics, and complete school management — all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <Link href="/login" className="glass-button text-sm px-8 py-3 flex items-center gap-2">
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <button className="glass-button-secondary text-sm px-8 py-3 flex items-center gap-2">
                <Play size={16} /> Watch Demo
              </button>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
            >
              {[
                { label: "Schools", value: 150, suffix: "+" },
                { label: "Students", value: 45000, suffix: "+" },
                { label: "AI Sessions", value: 2, suffix: "M+" },
                { label: "Satisfaction", value: 98, suffix: "%" },
              ].map((stat, i) => (
                <div key={i} className="glass-card-static p-4 text-center">
                  <p className="text-2xl font-bold gradient-text"><Counter end={stat.value} suffix={stat.suffix} /></p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="glass-card-static p-4 sm:p-6 rounded-2xl">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Study Hours", value: "127h", color: "#00d4aa", icon: <Clock size={16} /> },
                  { label: "Quizzes Done", value: "48", color: "#0ea5e9", icon: <Brain size={16} /> },
                  { label: "Exam Ready", value: "87%", color: "#a78bfa", icon: <Target size={16} /> },
                  { label: "Streak", value: "23 days", color: "#f59e0b", icon: <Award size={16} /> },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="stat-card text-center"
                    style={{ "--stat-color": card.color } as React.CSSProperties}
                  >
                    <div className="flex items-center justify-center mb-1" style={{ color: card.color }}>{card.icon}</div>
                    <p className="text-lg font-bold">{card.value}</p>
                    <p className="text-[10px] text-muted-foreground">{card.label}</p>
                  </motion.div>
                ))}
              </div>
              {/* Simulated Chart Area */}
              <div className="glass-card-static p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Performance Trend</span>
                  <span className="badge-teal text-[10px]">+20% this month</span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {[40, 55, 45, 65, 50, 70, 60, 80, 72, 85, 78, 92].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-teal/40 to-teal/80"
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-teal/10 via-transparent to-cyan/10 rounded-3xl blur-xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-cyan text-xs px-4 py-1.5">Powered by AI</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Everything Your School Needs</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              From AI-powered tutoring to comprehensive analytics — one platform to transform education.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={<Bot size={24} className="text-teal" />} title="AI Tutor" description="Syllabus-trained AI that adapts to each student's level. Explains concepts in multiple modes — beginner, exam-oriented, conceptual, and real-life examples." delay={0} />
            <FeatureCard icon={<Brain size={24} className="text-cyan" />} title="Smart Quizzes & Tests" description="AI-generated quizzes, mock tests, and timed exams based on the school curriculum. Automatic grading and performance insights." delay={0.1} />
            <FeatureCard icon={<BarChart3 size={24} className="text-purple" />} title="Deep Analytics" description="Track study time, weak topics, exam readiness, and learning patterns. AI provides actionable insights for improvement." delay={0.2} />
            <FeatureCard icon={<Users size={24} className="text-amber" />} title="Parent Monitoring" description="Complete visibility into child's learning journey. Daily reports, weak subject alerts, and AI-generated progress summaries." delay={0.3} />
            <FeatureCard icon={<Video size={24} className="text-coral" />} title="Live Classes" description="Integrated Google Meet for live classes. Schedule, join from dashboard, automatic attendance tracking, and recorded sessions." delay={0.4} />
            <FeatureCard icon={<Shield size={24} className="text-emerald" />} title="Cheating Detection" description="AI-powered detection of copy-paste, duplicate answers, tab switching, and AI-generated answer abuse during exams." delay={0.5} />
          </div>
        </div>
      </section>

      {/* ── FOR STUDENTS SECTION ── */}
      <section id="for-students" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge-teal text-xs px-4 py-1.5">For Students</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4">Your Personal AI Tutor,<br />Available 24/7</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                No more waiting for tuition classes. Get instant doubt resolution, personalized practice, 
                and AI-generated study materials — all tailored to your school syllabus.
              </p>
              <div className="space-y-4 mt-8">
                {[
                  { icon: <MessageSquare size={18} />, title: "Smart Doubt Solving", desc: "Ask anything — get syllabus-aligned answers instantly" },
                  { icon: <Target size={18} />, title: "Exam Preparation", desc: "AI creates mock tests from previous year papers" },
                  { icon: <Zap size={18} />, title: "Flashcards & Mind Maps", desc: "Auto-generated revision tools for every chapter" },
                  { icon: <TrendingUp size={18} />, title: "Progress Tracking", desc: "Know exactly where you stand and what to focus on" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center text-teal flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Chat Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card-static p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-cyan flex items-center justify-center">
                  <Bot size={16} className="text-navy-900" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Tutor</p>
                  <p className="text-[10px] text-teal">Online • Mathematics</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-teal/15 text-sm px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%]">
                    Can you explain the quadratic formula step by step?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="glass-card-static text-sm px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[85%]">
                    <p className="mb-2">Of course! The quadratic formula solves ax² + bx + c = 0:</p>
                    <div className="bg-white/5 rounded-lg px-3 py-2 font-mono text-xs mb-2">
                      x = (-b ± √(b² - 4ac)) / 2a
                    </div>
                    <p className="text-muted-foreground text-xs">Let me break this down into 4 simple steps...</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-teal/15 text-sm px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%]">
                    What is the discriminant and why does it matter?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="glass-card-static text-sm px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[85%]">
                    <p>Great question! The discriminant is <span className="text-teal font-mono">b² - 4ac</span> and it tells us:</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2"><span className="text-teal">▸</span> If positive → 2 real solutions</li>
                      <li className="flex items-center gap-2"><span className="text-amber">▸</span> If zero → 1 repeated solution</li>
                      <li className="flex items-center gap-2"><span className="text-coral">▸</span> If negative → no real solutions</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input placeholder="Ask your doubt..." className="glass-input flex-1 px-4 py-2.5 text-sm" />
                <button className="glass-button px-4 py-2.5 text-sm">Send</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOR SCHOOLS SECTION ── */}
      <section id="for-schools" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-purple text-xs px-4 py-1.5">For Schools & Teachers</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Empower Your Educators with AI</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              AI-powered tools for teachers, complete school management for admins, and intelligent insights for everyone.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <GraduationCap size={22} className="text-teal" />, title: "Auto-Generate Papers", desc: "Create question papers from syllabus with AI in seconds", stat: "80% time saved" },
              { icon: <Cpu size={22} className="text-cyan" />, title: "AI Grading", desc: "Automatic evaluation with detailed feedback for students", stat: "100% consistent" },
              { icon: <BarChart3 size={22} className="text-purple" />, title: "Class Analytics", desc: "See exactly which topics need more attention", stat: "Real-time insights" },
              { icon: <Shield size={22} className="text-coral" />, title: "Plagiarism Detection", desc: "Detect copied assignments and AI-generated abuse", stat: "99.2% accuracy" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
                <span className="badge-teal text-[10px]">{item.stat}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-amber text-xs px-4 py-1.5">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Trusted by Educators & Parents</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <TestimonialCard name="Dr. Lakshmi Prasad" role="Principal" school="Delhi Public School" content="AI Tutor has transformed how our students learn. The AI tutor is incredibly accurate with our CBSE syllabus, and parents love the real-time monitoring." delay={0} />
            <TestimonialCard name="Rajesh Kumar" role="Parent" school="Kendriya Vidyalaya" content="My son's grades improved from B to A+ in just 3 months. The AI tutor identified his weak areas in Physics and created personalized practice sessions." delay={0.1} />
            <TestimonialCard name="Sania Mirza" role="Math Teacher" school="St. Mary's Academy" content="The AI tools save me 5+ hours weekly. Auto-generated question papers, instant grading, and class-wide analytics — I can focus on teaching rather than paperwork." delay={0.2} />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="badge-teal text-xs px-4 py-1.5">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground mt-3">Start free. Scale as your school grows.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard name="Starter" price="₹4,999" features={["Up to 200 students", "AI Tutor (Basic)", "5 Teacher accounts", "Basic Analytics", "Email support"]} delay={0} />
            <PricingCard name="Professional" price="₹14,999" popular features={["Up to 1000 students", "AI Tutor (Advanced)", "Unlimited Teachers", "Advanced Analytics", "Live Classes", "Parent Dashboard", "Priority support"]} delay={0.1} />
            <PricingCard name="Enterprise" price="Custom" features={["Unlimited students", "AI Tutor (Premium)", "Custom integrations", "Dedicated support", "White-label option", "SLA guarantee", "On-premise option"]} delay={0.2} />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="relative py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-3">
            <FAQItem question="How does the AI Tutor work?" answer="Our AI Tutor is trained on your school's specific syllabus, previous question papers, and learning materials using RAG (Retrieval-Augmented Generation). It uses Google's Gemini API to generate contextually accurate answers tailored to each student's grade level." />
            <FAQItem question="Is student data secure?" answer="Absolutely. We use multi-tenant architecture with strict data isolation. Each school's data is completely separated. We use JWT authentication, encrypted sessions, and follow industry-standard security practices." />
            <FAQItem question="Can parents monitor their child's AI conversations?" answer="Yes! Parents have full visibility into their child's AI chat history, study sessions, performance analytics, and daily activity logs. They can even ask the AI questions like 'Why is my child weak in Maths?'" />
            <FAQItem question="What subjects does the AI support?" answer="The AI supports all subjects in your school curriculum — Mathematics, Science, Social Studies, Languages, and more. It adapts to any syllabus you upload (CBSE, ICSE, State Board, IB, etc.)." />
            <FAQItem question="How does cheating detection work?" answer="Our system detects copy-paste submissions, duplicate answers across students, tab switching during exams, suspicious test timing patterns, and AI-generated answer abuse using advanced pattern recognition." />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 sm:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-transparent to-cyan/5" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold">Ready to Transform Your School?</h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                Join 150+ schools already using AI Tutor. 
                Start your free trial today — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Link href="/login" className="glass-button text-sm px-10 py-3.5 flex items-center gap-2">
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <button className="glass-button-secondary text-sm px-8 py-3.5">Schedule a Demo</button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="glass-navbar py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-cyan flex items-center justify-center">
                  <Sparkles size={16} className="text-navy-900" />
                </div>
                <span className="text-base font-bold gradient-text">AI Tutor</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-powered education platform transforming how schools teach and students learn.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                {["AI Tutor", "Analytics", "Live Classes", "School Management"].map((item) => (
                  <li key={item}><a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                {["About Us", "Careers", "Blog", "Contact"].map((item) => (
                  <li key={item}><a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((item) => (
                  <li key={item}><a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-center">
            <p className="text-xs text-muted-foreground">© 2026 AI Tutor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
