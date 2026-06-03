"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Upload, FileText, Search, Plus, Filter, MoreVertical, FileArchive, FileType2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TeacherMaterialsPage() {
  const userName = useAppStore(s => s.userName);
  const schoolName = useAppStore(s => s.schoolName);
  const userEmail = useAppStore(s => s.userEmail);
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [sectionSubjects, setSectionSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    sectionSubjectId: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const email = userEmail || 'teacher@dps.edu';
      const res = await fetch(`/api/teacher/materials?teacherEmail=${email}`);
      const data = await res.json();
      if (data.materials) setMaterials(data.materials);
      if (data.sectionSubjects) setSectionSubjects(data.sectionSubjects);
    } catch (error) {
      console.error("Failed to fetch materials", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, [userEmail]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title) {
      toast.error("Please enter a title");
      return;
    }

    try {
      const res = await fetch('/api/teacher/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newMaterial.title,
          sectionSubjectId: newMaterial.sectionSubjectId,
          fileType: 'PDF', // Defaulting since we aren't uploading real files
          size: '2.5 MB'
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Failed to upload material");
        return;
      }
      
      toast.success("Material uploaded successfully");
      setIsModalOpen(false);
      setNewMaterial({ title: "", sectionSubjectId: "" });
      fetchMaterials();
    } catch (error) {
      console.error("Failed to upload material", error);
      toast.error("Network error");
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || m.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    toast.success("Material deleted successfully (mock)");
    setMaterials(materials.filter(m => m.id !== id));
    setActiveMenuId(null);
  };

  return (
    <DashboardLayout role="teacher" userName={userName || "Teacher"} schoolName={schoolName || "AI Tutor"} pageTitle="Study Materials" pageSubtitle="Manage syllabus and documents">
      <div className="glass-card-static p-6 rounded-2xl relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Search materials..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 pr-4 py-2 w-full text-sm" 
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={cn(
                  "glass-button-secondary px-3 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center",
                  filterType !== "All" && "text-teal border-teal/30 bg-teal/5"
                )}
              >
                <Filter size={16} /> {filterType === "All" ? "Filter" : filterType}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 w-48 glass-card border border-white/10 rounded-xl p-2 z-10 shadow-xl">
                  <p className="text-xs text-muted-foreground font-medium px-2 py-1 mb-1">File Type</p>
                  {["All", "PDF", "Word", "Video", "Archive"].map(type => (
                    <button 
                      key={type}
                      onClick={() => { setFilterType(type); setShowFilter(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors",
                        filterType === type && "text-teal bg-white/5 font-medium"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="glass-button px-4 py-2 flex items-center gap-2 text-sm w-full sm:w-auto justify-center bg-teal text-navy-900 border-none font-semibold"
            >
              <Upload size={16} /> Upload New
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center mb-8 hover:border-teal/50 hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <Upload size={24} />
          </div>
          <h4 className="text-sm font-semibold mb-1">Click or drag files to upload</h4>
          <p className="text-xs text-muted-foreground">Supports PDF, DOCX, PPTX, MP4, and ZIP up to 50MB</p>
        </div>

        <h3 className="text-sm font-semibold mb-4">Recent Uploads</h3>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading materials...</div>
        ) : (
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-xs text-muted-foreground">
                  <th className="text-left font-medium pb-3 px-2">File Name</th>
                  <th className="text-left font-medium pb-3 px-2">Assigned Class</th>
                  <th className="text-left font-medium pb-3 px-2">Size</th>
                  <th className="text-left font-medium pb-3 px-2">Uploaded</th>
                  <th className="text-right font-medium pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No materials found.</td>
                  </tr>
                ) : filteredMaterials.map(m => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        {m.type === "PDF" ? <FileText size={16} className="text-coral" /> : 
                         m.type === "Archive" ? <FileArchive size={16} className="text-amber" /> : 
                         <FileType2 size={16} className="text-cyan" />}
                        <span className="text-sm font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{m.class}</td>
                    <td className="py-3 px-2 text-xs font-mono text-muted-foreground">{m.size}</td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">{m.date}</td>
                    <td className="py-3 px-2 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === m.id ? null : m.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeMenuId === m.id && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 glass-card border border-white/10 rounded-lg shadow-xl z-20 py-1 flex flex-col items-start">
                          <button 
                            onClick={() => { toast.info("Opening editor..."); setActiveMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(m.id)}
                            className="w-full text-left px-3 py-1.5 text-xs text-coral hover:bg-white/5 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10"
          >
            <h3 className="text-xl font-bold mb-4">Upload New Material</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Title</label>
                <input 
                  type="text" 
                  value={newMaterial.title}
                  onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm" 
                  placeholder="Leave blank to use file name"
                />
              </div>

              {/* Removed real file input, keeping it simple for the demo */}

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Assign to Class Section</label>
                <select 
                  value={newMaterial.sectionSubjectId}
                  onChange={e => setNewMaterial({...newMaterial, sectionSubjectId: e.target.value})}
                  className="glass-input w-full px-4 py-2 text-sm bg-navy-900" 
                  required
                >
                  <option value="" disabled>-- Select a Section --</option>
                  {sectionSubjects.map(ss => (
                    <option key={ss.id} value={ss.id}>
                      {ss.section.class.name}-{ss.section.name} ({ss.subject.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 glass-button px-4 py-2 text-sm justify-center bg-teal text-navy-900 font-semibold border-none"
                >
                  Upload
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
