"use client";

import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { motion } from "framer-motion";
import type { ChartDataPoint } from "@/types";

/* ── Custom Tooltip ── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-static px-3 py-2 text-xs shadow-xl">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

/* ── Area Chart ── */
interface GlassAreaChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  color1?: string;
  color2?: string;
  dataKey1?: string;
  dataKey2?: string;
  label1?: string;
  label2?: string;
  height?: number;
}

export function GlassAreaChart({
  data, title, subtitle, color1 = "#00d4aa", color2 = "#0ea5e9",
  dataKey1 = "value", dataKey2, label1 = "Primary", label2 = "Secondary", height = 280,
}: GlassAreaChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-static p-5 relative overflow-hidden"
    >
      <div className="mb-6 relative z-10">
        <h3 className="text-xl font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      
      {/* Legend Badges matched to reference */}
      <div className="absolute top-5 right-5 flex items-center gap-3 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color1 }}></span>
          <span className="text-[10px] text-muted-foreground">{label1}</span>
        </div>
        {dataKey2 && (
          <div className="flex items-center gap-1.5">
             <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color2 }}></span>
             <span className="text-[10px] text-muted-foreground">{label2}</span>
          </div>
        )}
      </div>

      <div className="relative z-10 -mx-5 -mb-5">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${color1}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color1} stopOpacity={0.6} />
                <stop offset="100%" stopColor={color1} stopOpacity={0.05} />
              </linearGradient>
              {color2 && (
                <linearGradient id={`grad-${color2}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color2} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color2} stopOpacity={0.05} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            {dataKey2 && (
              <Area
                type="monotone" dataKey={dataKey2} name={label2}
                stroke={color2} strokeWidth={3} fill={`url(#grad-${color2})`}
                activeDot={{ r: 6, fill: color2, stroke: "#0B1929", strokeWidth: 2 }}
              />
            )}
            <Area
              type="monotone" dataKey={dataKey1} name={label1}
              stroke={color1} strokeWidth={4} fill={`url(#grad-${color1})`}
              activeDot={{ r: 6, fill: color1, stroke: "#0B1929", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ── Bar Chart ── */
interface GlassBarChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
}

export function GlassBarChart({ data, title, subtitle, color = "#00d4aa", height = 280 }: GlassBarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card-static p-5"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-teal"></span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="value" fill={color} radius={[10, 10, 10, 10]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/* ── Radial Progress ── */
interface RadialProgressProps {
  value: number;
  label: string;
  color?: string;
  size?: number;
}

export function RadialProgress({ value, label, color = "#00d4aa", size = 120 }: RadialProgressProps) {
  const data = [{ name: label, value, fill: color }];
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={size} height={size}>
        <RadialBarChart
          cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
          barSize={8} data={data} startAngle={90} endAngle={-270}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: "rgba(255,255,255,0.05)" }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center -mt-2">
        <p className="text-lg font-bold" style={{ color }}>{value}%</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ── Mini Donut ── */
const DONUT_COLORS = ["#00d4aa", "#0ea5e9", "#a78bfa", "#f59e0b", "#f97066", "#34d399"];

interface DonutChartProps {
  data: { name: string; value: number }[];
  title: string;
  height?: number;
}

export function GlassDonutChart({ data, title, height = 220 }: DonutChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card-static p-5"
    >
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={55} outerRadius={80}
            paddingAngle={4} dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {data.map((item, i) => (
          <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            {item.name}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
