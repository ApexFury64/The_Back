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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: "",
    code: "",
    address: "",
    plan: "pro",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSchools = () => {
    fetch("/api/super-admin/schools")
      .then(res => res.json())
      .then(d => setData({ ...d, platformSchools: Array.isArray(d.platformSchools) ? d.platformSchools : [] }))
      .catch(console.error);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleOnboardSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchool),
      });
      if (res.ok) {
        toast.success("School onboarded successfully");
        setIsAddModalOpen(false);
        setNewSchool({
          name: "",
          code: "",
          address: "",
          plan: "pro",
          adminName: "",
          adminEmail: "",
          adminPassword: "",
        });
        fetchSchools();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to onboard school");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
    setIsSubmitting(false);
  };

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
              onClick={() => setIsAddModalOpen(true)}
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

      {/* ONBOARD SCHOOL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Onboard New School</h3>
            <form onSubmit={handleOnboardSchool} className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-teal border-b border-white/10 pb-1 mb-3">School Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">School Name</label>
                    <input 
                      type="text" 
                      value={newSchool.name} 
                      onChange={e => setNewSchool({...newSchool, name: e.target.value})} 
                      className="glass-input w-full px-4 py-2 text-sm" 
                      placeholder="e.g. Oakridge International"
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-medium mb-1 block">School Code (Unique)</label>
                      <input 
                        type="text" 
                        value={newSchool.code} 
                        onChange={e => setNewSchool({...newSchool, code: e.target.value.toUpperCase()})} 
                        className="glass-input w-full px-4 py-2 text-sm" 
                        placeholder="e.g. OAK-HYD"
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-medium mb-1 block">Subscription Plan</label>
                      <select 
                        value={newSchool.plan} 
                        onChange={e => setNewSchool({...newSchool, plan: e.target.value})} 
                        className="glass-input w-full px-4 py-2 text-sm bg-navy-900" 
                        required 
                      >
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Address / City</label>
                    <input 
                      type="text" 
                      value={newSchool.address} 
                      onChange={e => setNewSchool({...newSchool, address: e.target.value})} 
                      className="glass-input w-full px-4 py-2 text-sm" 
                      placeholder="e.g. Hyderabad, India"
                      required 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-teal border-b border-white/10 pb-1 mb-3 mt-4">Administrator Account</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Admin Name</label>
                    <input 
                      type="text" 
                      value={newSchool.adminName} 
                      onChange={e => setNewSchool({...newSchool, adminName: e.target.value})} 
                      className="glass-input w-full px-4 py-2 text-sm" 
                      placeholder="e.g. Principal Prasad"
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Admin Email</label>
                    <input 
                      type="email" 
                      value={newSchool.adminEmail} 
                      onChange={e => setNewSchool({...newSchool, adminEmail: e.target.value})} 
                      className="glass-input w-full px-4 py-2 text-sm" 
                      placeholder="e.g. admin@oakridge.edu"
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Admin Password</label>
                    <input 
                      type="password" 
                      value={newSchool.adminPassword} 
                      onChange={e => setNewSchool({...newSchool, adminPassword: e.target.value})} 
                      className="glass-input w-full px-4 py-2 text-sm" 
                      placeholder="Min 6 characters"
                      required 
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Onboarding..." : "Onboard School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
