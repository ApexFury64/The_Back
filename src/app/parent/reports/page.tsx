"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, CheckCircle, TrendingUp, Calendar } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GlassAreaChart, GlassBarChart } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import CustomDropdown from "@/components/ui/CustomDropdown";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<string>("8");

  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  useEffect(() => {
    const email = userEmail || 'parent.reddy@gmail.com';
    fetch(`/api/parent/dashboard?parentEmail=${email}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userEmail]);

  if (loading || !data || data.error) {
    return (
      <DashboardLayout role="parent" userName={userName || "Parent"} schoolName={schoolName || "AI Tutor"} pageTitle="Academic Reports" pageSubtitle="Loading...">
        <div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div>
      </DashboardLayout>
    );
  }

  const { student, weeklyStudyData, parentChildStats, studentSubjects = [] } = data;

  const standards = ["All", ...Array.from(new Set<string>(studentSubjects.map((s: any) => s.standard || '8'))).sort((a: any, b: any) => b.toString().localeCompare(a.toString()))];
  const filteredSubjects = selectedStandard === "All" ? studentSubjects : studentSubjects.filter((s: any) => (s.standard || '8') === selectedStandard);

  const subjectPerformanceData = filteredSubjects.map((s: any) => ({
    name: s.name,
    value: s.score || s.progress || 0
  }));

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success("Report PDF downloaded successfully!");
    }, 1500);
  };

  return (
    <DashboardLayout
      role="parent"
      userName={userName || "Parent"}
      schoolName={schoolName || "AI Tutor"}
      pageTitle="Academic Reports"
      pageSubtitle={`${student?.name || 'Student'} · Term 1 Final Reports`}
    >
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card-static p-4 rounded-2xl">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center text-teal">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">Term 1 Complete Report Card</p>
              <p className="text-xs text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <CustomDropdown 
              options={standards}
              value={selectedStandard}
              onChange={setSelectedStandard}
              labelPrefix="Standard"
              currentStandard="8"
            />
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
              ) : (
                <><Download size={16} /> Download PDF</>
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlassAreaChart
              data={weeklyStudyData}
              title="Performance Trend"
              subtitle="Score progression over the last few weeks"
              dataKey1="value"
              dataKey2="value2"
              label1="Child Score"
              label2="Class Average"
            />
            {subjectPerformanceData.length > 0 && (
              <GlassBarChart
                title="Subject Breakdown"
                subtitle={`Average quiz scores for ${selectedStandard === 'All' ? 'all standards' : `Class ${selectedStandard}`}`}
                data={subjectPerformanceData}
                color="#8b5cf6"
                height={300}
              />
            )}
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-static p-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold mb-6">Key Metrics</h3>
              <div className="space-y-4">
                {parentChildStats.map((stat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal">
                        {i === 0 ? <CheckCircle size={14} /> : i === 1 ? <TrendingUp size={14} /> : <Calendar size={14} />}
                      </div>
                      <span className="text-sm font-medium">{stat.title}</span>
                    </div>
                    <span className="text-lg font-bold text-teal">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
