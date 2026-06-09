"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beaker, GripVertical, X,
  Hash, Dices, MinusCircle, Triangle, FlipHorizontal, Ruler,
  Divide, Percent, Variable, Equal, Superscript, Scale,
  BarChart3, PieChart, TrendingUp, LineChart, Square, Hexagon,
  Box, Pentagon, Split, Braces, Infinity, Sigma,
  FunctionSquare, Crosshair, Circle, ListOrdered, Mountain,
  Apple, Wheat, Leaf, Flower2, Activity, Layers, Filter,
  FlaskConical, TestTubes, Thermometer, Gauge, Sprout, Wind,
  HeartPulse, Move, Droplets, Sun, Eye, AudioLines, Zap,
  Flame, Microscope, Baby, Atom, ArrowRightCircle, Orbit,
  Grid3x3, Trees, Gem, Magnet, Dna,
  ALargeSmall, Type, Clock, BookOpen, Feather,
  Mail, FileText, NotebookPen, Repeat, MessageSquare, ScanText,
  Settings, CheckCircle, GitBranch, Music, Snowflake, Moon,
  Footprints, Landmark, Scroll, Castle, Crown, HandHeart,
  Church, Ship, Flag, Megaphone, ScrollText, Swords, Factory,
  ShieldAlert, Tractor,
  Globe, Compass, Rotate3d, CloudSun, MountainSnow, TreePalm,
  Users, MapIcon, Waves, LayoutDashboard, TrainFront,
  Monitor, Wifi, Code, Smartphone, Table, Database, Palette,
  Shield, Lock, Terminal, Brackets, Package,
  Calculator,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { labAssets, groupAssetsBySubject, subjectColors, type LabAsset } from "@/lib/labAssets";

// Icon mapping — same as in ai-tutor page
const iconMap: Record<string, LucideIcon> = {
  'hash': Hash, 'dices': Dices, 'minus-circle': MinusCircle, 'triangle': Triangle,
  'flip-horizontal': FlipHorizontal, 'ruler': Ruler, 'divide': Divide, 'percent': Percent,
  'variable': Variable, 'equal': Equal, 'superscript': Superscript, 'scale': Scale,
  'bar-chart-3': BarChart3, 'pie-chart': PieChart, 'trending-up': TrendingUp, 'line-chart': LineChart,
  'square': Square, 'hexagon': Hexagon, 'box': Box, 'pentagon': Pentagon,
  'split': Split, 'braces': Braces, 'infinity': Infinity, 'sigma': Sigma,
  'function-square': FunctionSquare, 'calculator': Calculator, 'axis-3d': Crosshair,
  'crosshair': Crosshair, 'circle': Circle, 'square-function': FunctionSquare,
  'list-ordered': ListOrdered, 'mountain': Mountain,
  'apple': Apple, 'wheat': Wheat, 'leaf': Leaf, 'flower-2': Flower2,
  'activity': Activity, 'layers': Layers, 'filter': Filter,
  'flask-conical': FlaskConical, 'test-tubes': TestTubes, 'thermometer': Thermometer,
  'gauge': Gauge, 'sprout': Sprout, 'wind': Wind, 'heart-pulse': HeartPulse,
  'move': Move, 'droplets': Droplets, 'sun': Sun, 'eye': Eye,
  'audio-lines': AudioLines, 'zap': Zap, 'flame': Flame,
  'microscope': Microscope, 'baby': Baby, 'atom': Atom, 'beaker': Beaker,
  'arrow-right-circle': ArrowRightCircle, 'orbit': Orbit, 'grid-3x3': Grid3x3,
  'trees': Trees, 'gem': Gem, 'magnet': Magnet, 'dna': Dna,
  'a-large-small': ALargeSmall, 'type': Type, 'clock': Clock,
  'book-open': BookOpen, 'feather': Feather, 'mail': Mail,
  'file-text': FileText, 'notebook-pen': NotebookPen, 'repeat': Repeat,
  'message-square': MessageSquare, 'scan-text': ScanText, 'settings': Settings,
  'check-circle': CheckCircle, 'git-branch': GitBranch, 'music': Music,
  'snowflake': Snowflake, 'moon': Moon,
  'footprints': Footprints, 'landmark': Landmark, 'scroll': Scroll,
  'castle': Castle, 'crown': Crown, 'hand-heart': HandHeart,
  'church': Church, 'ship': Ship, 'flag': Flag, 'megaphone': Megaphone,
  'scroll-text': ScrollText, 'swords': Swords, 'factory': Factory,
  'shield-alert': ShieldAlert, 'tractor': Tractor,
  'globe': Globe, 'compass': Compass, 'rotate-3d': Rotate3d,
  'cloud-sun': CloudSun, 'mountain-snow': MountainSnow, 'palm-tree': TreePalm,
  'users': Users, 'map': MapIcon, 'waves': Waves,
  'layout-dashboard': LayoutDashboard, 'train-front': TrainFront,
  'monitor': Monitor, 'wifi': Wifi, 'code': Code, 'smartphone': Smartphone,
  'table': Table, 'database': Database, 'palette': Palette,
  'shield': Shield, 'lock': Lock, 'terminal': Terminal,
  'brackets': Brackets, 'package': Package,
};

interface AILabPanelProps {
  onAssetSelect: (asset: LabAsset) => void;
  activeSubject: string | null;
  activeStandard: string | null;
  activeTopicTitle?: string | null;
  onClose: () => void;
}

function getNormalizedSubjectName(subjectName: string): string {
  const normalized = (subjectName || "").toLowerCase().trim();
  if (normalized.includes("math")) return "Mathematics";
  if (normalized.includes("science") || normalized.includes("physics") || normalized.includes("chemistry") || normalized.includes("biology")) return "Science";
  if (normalized.includes("english")) return "English";
  if (normalized.includes("history")) return "History";
  if (normalized.includes("geography")) return "Geography";
  if (normalized.includes("computer") || normalized.includes("coding")) return "Computer Science";
  return subjectName;
}

export default function AILabPanel({
  onAssetSelect,
  activeSubject,
  activeStandard,
  activeTopicTitle,
  onClose
}: AILabPanelProps) {
  // Filter by active standard, then by active subject if provided
  let filtered = labAssets;
  if (activeStandard) {
    filtered = filtered.filter(a => a.standard === activeStandard);
  }
  if (activeSubject) {
    const normActive = getNormalizedSubjectName(activeSubject);
    filtered = filtered.filter(a => getNormalizedSubjectName(a.subject) === normActive);
  }
  const grouped = groupAssetsBySubject(filtered);

  const handleDragStart = (e: React.DragEvent, asset: LabAsset) => {
    e.dataTransfer.setData("application/json", JSON.stringify(asset));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="flex flex-col h-full bg-navy-950/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan/20 flex items-center justify-center">
            <Beaker size={16} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Lab</h3>
            <p className="text-[10px] text-muted-foreground">
              {activeSubject ? activeSubject : 'Select a subject'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 mx-4 mt-3 mb-2 px-3 py-2 bg-teal/5 border border-teal/10 rounded-lg">
        <GripVertical size={12} className="text-teal flex-shrink-0" />
        <p className="text-[10px] text-teal/80">Drag cards onto the chat or click to learn</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 pt-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Beaker size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs">Select a topic from the syllabus to see related lab assets</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([subject, assets], groupIndex) => (
              <div key={subject}>
                <h4
                  className="text-[11px] font-bold uppercase tracking-wider mb-3 pl-2 border-l-2 text-foreground/90"
                  style={{ borderColor: assets[0]?.color }}
                >
                  {subject}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {assets.map((asset, i) => {
                    const IconComponent = asset.icon ? iconMap[asset.icon] : null;

                    return (
                      <motion.button
                        key={asset.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.05 + i * 0.04 }}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, asset)}
                        onClick={() => onAssetSelect(asset)}
                        className={cn(
                          "group relative flex flex-col items-center gap-2 p-4 rounded-xl",
                          "hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing",
                          "hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:scale-[1.04]",
                          activeTopicTitle === asset.title
                            ? "bg-teal/10 border-teal shadow-[0_0_15px_rgba(45,212,191,0.25)] scale-[1.04]"
                            : "bg-white/5 border border-white/5 hover:border-white/20"
                        )}
                        title={asset.description}
                      >
                        {activeTopicTitle === asset.title && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-teal text-navy-900 text-[8px] uppercase tracking-wider font-extrabold rounded-md shadow-md animate-pulse">
                            Selected
                          </span>
                        )}
                        {/* Icon */}
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                          style={{ backgroundColor: asset.color + '15' }}
                        >
                          {IconComponent ? (
                            <IconComponent
                              size={32}
                              style={{ color: asset.color }}
                              strokeWidth={1.5}
                            />
                          ) : (
                            <Beaker size={32} style={{ color: asset.color }} strokeWidth={1.5} />
                          )}
                        </div>

                        {/* Title */}
                        <span className="text-xs font-medium text-slate-300 group-hover:text-teal transition-colors text-center leading-tight">
                          {asset.title}
                        </span>

                        {/* Drag indicator */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
                          <GripVertical size={12} className="text-white/50" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
