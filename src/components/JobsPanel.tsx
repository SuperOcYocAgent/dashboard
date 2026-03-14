"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, MapPin, DollarSign, Clock, ExternalLink, RefreshCw, Filter, Loader2, Star, Bookmark, Trash2, Edit2, Save, X, Check } from "lucide-react";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  tags: string[];
  source: string;
  url: string;
  description?: string;
  // Saved job fields
  notes?: string;
  estimatedHours?: number;
  score?: number;
  status?: string;
  createdAt?: string;
}

const sources = ["All", "Remote OK", "We Work Remotely", "Indeed", "Working Nomads", "Turing", "Built In", "Jooble"];
const jobTypes = ["All", "Full-time", "Contract", "Part-time"];
const statuses = ["interested", "applied", "interview", "rejected"];

export function JobsPanel() {
  const [searchJobs, setSearchJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "saved">("search");
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ notes: "", estimatedHours: 0, score: 0, status: "interested" });

  const fetchSearchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      
      if (data.jobs) {
        const transformedJobs: Job[] = data.jobs.map((job: any, index: number) => ({
          id: `search-${index}`,
          title: job.title,
          company: job.company,
          location: job.location || "Remote",
          salary: "Competitive",
          type: job.description?.toLowerCase().includes("contract") ? "Contract" : "Full-time",
          posted: job.posted || "Recent",
          tags: extractTags(job.title + " " + job.description),
          source: job.source || "Search",
          url: job.url,
          description: job.description,
        }));
        setSearchJobs(transformedJobs);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch("/api/jobs/saved");
      const data = await response.json();
      
      if (data.jobs) {
        const jobs: Job[] = data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location || "Remote",
          salary: job.salary || "Competitive",
          type: job.type || "Full-time",
          posted: "",
          tags: job.tags ? JSON.parse(job.tags) : [],
          source: job.source,
          url: job.url,
          description: job.description,
          notes: job.notes || "",
          estimatedHours: job.estimatedHours,
          score: job.score,
          status: job.status,
          createdAt: job.createdAt,
        }));
        setSavedJobs(jobs);
      }
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error);
    }
  };

  const saveJob = async (job: Job) => {
    setSaving(job.id);
    try {
      const response = await fetch("/api/jobs/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type,
          source: job.source,
          url: job.url,
          description: job.description,
          tags: job.tags,
        }),
      });
      
      if (response.ok) {
        await fetchSavedJobs();
        setActiveTab("saved");
      }
    } catch (error) {
      console.error("Failed to save job:", error);
    } finally {
      setSaving(null);
    }
  };

  const updateJob = async (id: string) => {
    try {
      await fetch(`/api/jobs/saved/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: editForm.notes,
          estimatedHours: editForm.estimatedHours,
          score: editForm.score,
          status: editForm.status,
        }),
      });
      
      setEditingJob(null);
      await fetchSavedJobs();
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await fetch(`/api/jobs/saved/${id}`, { method: "DELETE" });
      await fetchSavedJobs();
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const startEditing = (job: Job) => {
    setEditingJob(job.id);
    setEditForm({
      notes: job.notes || "",
      estimatedHours: job.estimatedHours || 0,
      score: job.score || 0,
      status: job.status || "interested",
    });
  };

  const isJobSaved = (url: string) => {
    return savedJobs.some(j => j.url === url);
  };

  const extractTags = (text: string): string[] => {
    const techTags = [".NET", "C#", "React", "Node.js", "Angular", "TypeScript", "PostgreSQL", "AWS", "Azure", "Docker", "JavaScript", "Python"];
    return techTags.filter(tag => 
      text.toLowerCase().includes(tag.toLowerCase())
    ).slice(0, 4);
  };

  useEffect(() => {
    fetchSearchJobs();
    fetchSavedJobs();
  }, []);

  const filteredSearchJobs = searchJobs.filter(job => {
    const sourceMatch = selectedSource === "All" || job.source.includes(selectedSource);
    const typeMatch = selectedType === "All" || job.type === selectedType;
    return sourceMatch && typeMatch;
  });

  const renderStars = (currentScore: number, jobId: string, isEditing: boolean) => {
    if (isEditing) {
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setEditForm({ ...editForm, score: star })}
              className="focus:outline-none"
            >
              <Star 
                className={`w-4 h-4 ${star <= editForm.score ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} 
              />
            </button>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-3 h-3 ${star <= (currentScore || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Jobs</h2>
          <p className="text-sm text-muted-foreground">
            {activeTab === "search" 
              ? (lastUpdated ? `Search: ${lastUpdated.toLocaleTimeString()}` : "Search for jobs...")
              : `${savedJobs.length} saved job${savedJobs.length !== 1 ? "s" : ""}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === "search" ? "default" : "outline"}
            onClick={() => setActiveTab("search")}
            size="sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button 
            variant={activeTab === "saved" ? "default" : "outline"}
            onClick={() => setActiveTab("saved")}
            size="sm"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Saved ({savedJobs.length})
          </Button>
        </div>
      </div>

      {activeTab === "search" && (
        <>
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button 
              onClick={fetchSearchJobs} 
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Searching..." : "Refresh Jobs"}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
            <select 
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredSearchJobs.length} job{filteredSearchJobs.length !== 1 ? "s" : ""}
          </div>

          {/* Jobs Table */}
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Job</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Company</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Location</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Salary</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSearchJobs.map((job, index) => (
                    <tr 
                      key={job.id} 
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-in fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-4">
                        <div className="font-medium text-foreground">{job.title}</div>
                        <div className="hidden md:flex flex-wrap gap-1 mt-1">
                          {job.tags.map(tag => (
                            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                        {job.company}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.salary}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          job.type === "Full-time" 
                            ? "bg-green-500/10 text-green-500" 
                            : job.type === "Contract"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {job.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                          {job.source}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 justify-center">
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <Button
                            variant={isJobSaved(job.url) ? "secondary" : "outline"}
                            size="icon"
                            onClick={() => !isJobSaved(job.url) && saveJob(job)}
                            disabled={saving === job.id || isJobSaved(job.url)}
                            title={isJobSaved(job.url) ? "Already saved" : "Save job"}
                          >
                            {saving === job.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Bookmark className={`w-4 h-4 ${isJobSaved(job.url) ? "fill-current" : ""}`} />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "saved" && (
        <>
          {/* Saved Jobs */}
          {savedJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No saved jobs yet.</p>
              <Button variant="link" onClick={() => setActiveTab("search")}>
                Search for jobs
              </Button>
            </div>
          ) : (
            <div className="border border-border/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/50">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Job</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Score</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Hours</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Notes</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedJobs.map((job, index) => (
                      <tr 
                        key={job.id} 
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-in fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="p-4">
                          <div className="font-medium text-foreground">{job.title}</div>
                          <div className="text-xs text-muted-foreground">{job.company}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.tags.map(tag => (
                              <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {renderStars(job.score || 0, job.id, editingJob === job.id)}
                        </td>
                        <td className="p-4 text-sm hidden sm:table-cell">
                          {editingJob === job.id ? (
                            <Input
                              type="number"
                              value={editForm.estimatedHours}
                              onChange={(e) => setEditForm({ ...editForm, estimatedHours: parseInt(e.target.value) || 0 })}
                              className="w-20 h-8"
                              min={0}
                            />
                          ) : (
                            <span>{job.estimatedHours || "-"}h</span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingJob === job.id ? (
                            <select 
                              value={editForm.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                              className="bg-card border border-border rounded-lg px-2 py-1 text-sm"
                            >
                              {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs ${
                              job.status === "interested" ? "bg-blue-500/10 text-blue-500" :
                              job.status === "applied" ? "bg-yellow-500/10 text-yellow-500" :
                              job.status === "interview" ? "bg-green-500/10 text-green-500" :
                              "bg-red-500/10 text-red-500"
                            }`}>
                              {job.status}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell max-w-xs">
                          {editingJob === job.id ? (
                            <Input
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              placeholder="Add notes..."
                              className="h-8"
                            />
                          ) : (
                            <span className="truncate block">{job.notes || "-"}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 justify-center">
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {editingJob === job.id ? (
                              <>
                                <Button size="icon" variant="default" onClick={() => updateJob(job.id)}>
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditingJob(null)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="icon" variant="outline" onClick={() => startEditing(job)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => deleteJob(job.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "search" && loading && (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p>Searching for remote jobs...</p>
        </div>
      )}
    </div>
  );
}

function Search(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
}
