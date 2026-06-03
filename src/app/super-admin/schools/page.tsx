"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Plus, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SuperAdminSchoolsPage() {
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  const userEmail = useAppStore(s => s.userEmail);
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);

  useEffect(() => {
    const email = userEmail || 'super@techwing.com';
    fetch(`/api/super-admin/dashboard?superAdminEmail=${email}`)
      .then(res => res.json())
      .then(d => setData({ ...d, platformSchools: Array.isArray(d.platformSchools) ? d.platformSchools : [] }))
      .catch(console.error);
  }, [userEmail]);

  const [filterPlan, setFilterPlan] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  if (!data) return <DashboardLayout role="super-admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor Platform"} pageTitle="Schools Registry" pageSubtitle="Loading..."><div className="flex justify-center p-20"><div className="w-8 h-8 border-2 border-teal rounded-full animate-spin border-t-transparent" /></div></DashboardLayout>;

  const filteredSchools = data.platformSchools.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterPlan === "All" || s.plan.toLowerCase() === filterPlan.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout role="super-admin" userName={userName || "Admin"} schoolName={schoolName || "AI Tutor Platform"} pageTitle="Schools Registry" pageSubtitle="Manage all onboarded schools and institutions">
      <div className="glass-card-static p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schools by name or city..." 
              className="glass-input pl-10 pr-4 py-2 w-full text-sm" 
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={cn(
                  "glass-button-secondary px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center",
                  filterPlan !== "All" && "text-teal border-teal/30 bg-teal/5"
                )}
              >
                <Filter size={16} /> {filterPlan === "All" ? "Filters" : filterPlan}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 w-40 glass-card border border-white/10 rounded-xl p-2 z-10 shadow-xl">
                  <p className="text-xs text-muted-foreground font-medium px-2 py-1 mb-1">Plan Type</p>
                  {["All", "Basic", "Pro", "Enterprise"].map(plan => (
                    <button 
                      key={plan}
                      onClick={() => { setFilterPlan(plan); setShowFilter(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors",
                        filterPlan === plan && "text-teal bg-white/5 font-medium"
                      )}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => toast.success("Exporting data to CSV...")}
              className="glass-button-secondary px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
            >
              <Download size={16} /> Export
            </button>
            <button 
              onClick={() => toast.info("Opening Onboard School wizard...")}
              className="glass-button px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center bg-teal text-navy-900 border-none font-semibold"
            >
              <Plus size={16} /> Onboard School
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4 rounded-tl-xl">School Name</th>
                <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4">Location</th>
                <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4">Students</th>
                <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4">Plan</th>
                <th className="text-xs text-muted-foreground font-medium text-left py-3 px-4">AI Adoption</th>
                <th className="text-xs text-muted-foreground font-medium text-right py-3 px-4 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school: any) => (
                <tr 
                  key={school.id} 
                  onClick={() => router.push(`/super-admin/schools/${school.id}`)}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-medium">{school.name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{school.city}</td>
                  <td className="py-3 px-4 text-sm font-mono">{school.students.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                      school.plan === "enterprise" && "bg-purple/15 text-purple",
                      school.plan === "pro" && "bg-teal/15 text-teal",
                      school.plan === "basic" && "bg-cyan/15 text-cyan"
                    )}>
                      {school.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 w-24">
                      <div className="progress-bar flex-1" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${school.aiUsage}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{school.aiUsage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                      school.status === "active" ? "bg-teal/15 text-teal" : "bg-muted-foreground/15 text-muted-foreground"
                    )}>
                      {school.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
