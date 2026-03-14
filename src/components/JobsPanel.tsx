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
  notes?: string;
  estimatedHours?: number;
  score?: number;
  status?: string;
  createdAt?: string;
  isSaved?: boolean;
}

export interface JobSource {
  id: string;
  name: string;
  enabled: boolean;
}

export function JobsPanel() {
  const [searchJobs, setSearchJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<JobSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "saved">("search");
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ notes: "", estimatedHours: 0, score: 0, status: "interested" });
  const [sourcesLoading, setSourcesLoading] = useState(false);

  const fetchSearchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      
      if (data.jobs) {
        const transformedJobs: Job[] = data.jobs.map((job: any) => ({
          id: job.id,
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
          isSaved: job.isSaved,
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

  const fetchSources = async () => {
    try {
      const response = await fetch("/api/jobs/sources");
      const data = await response.json();
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    }
  };

  const updateSource = async (sourceName: string, enabled: boolean) => {
    setSourcesLoading(true);
    try {
      const updatedSources = sources.map(s => 
        s.name === sourceName ? { ...s, enabled } : s
      );
      setSources(updatedSources);
      
      await fetch("/api/jobs/sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: updatedSources }),
      });
      
      // Refresh jobs after source change
      await fetchSearchJobs();
    } catch (error) {
      console.error("Failed to update source:", error);
      // Revert on error
      await fetchSources();
    } finally {
      setSourcesLoading(false);
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
          isSaved: true,
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
          externalId: job.id,
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
        // Update the job's isSaved status locally
        setSearchJobs(prev => prev.map(j => 
          j.url === job.url ? { ...j, isSaved: true } : j
        ));
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

  const deleteJob = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await fetch(`/api/jobs/saved/${id}`, { method: "DELETE" });
      // Update local state
      setSearchJobs(prev => prev.map(j => 
        j.url === url ? { ...j, isSaved: false } : j
      ));
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

  const extractTags = (text: string): string[] => {
    const techTags = [".NET", "C#", "React", "Node.js", "Angular", "TypeScript", "PostgreSQL", "AWS", "Azure", "Docker", "JavaScript", "Python"];
    return techTags.filter(tag => 
      text.toLowerCase().includes(tag.toLowerCase())
    ).slice(0, 4);
  };

  useEffect(() => {
    fetchSources();
    fetchSearchJobs();
    fetchSavedJobs();
  }, []);

  const enabledSources = sources.filter(s => s.enabled).map(s => s.name);

  const filteredSearchJobs = searchJobs.filter(job => 
    enabledSources.includes(job.source)
  );

  const renderStars = (currentScore: number, isEditing: boolean) => {
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
            <SearchIcon className="w-4 h-4 mr-2" />
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
          {/* Sources Filter */}
          <div className="border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sources:</span>
              {sourcesLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => updateSource(source.name, !source.enabled)}
                  disabled={sourcesLoading}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    source.enabled 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    source.enabled 
                      ? "bg-primary-foreground/20 border-primary-foreground" 
                      : "border-muted-foreground"
                  }`}>
                    {source.enabled && <Check className="w-3 h-3" />}
                  </div>
                  {source.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button 
              onClick={fetchSearchJobs} 
              disabled={loading || sourcesLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Searching..." : "Refresh Jobs"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Showing {filteredSearchJobs.length} jobs from {enabledSources.length} source{enabledSources.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Jobs Table */}
          {filteredSearchJobs.length === 0 && !loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No jobs found. Try enabling more sources.</p>
            </div>
          ) : (
            <div className="border border-border/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/50">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Job</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Source</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Location</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Posted</th>
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
                          <div className="text-xs text-muted-foreground">{job.company}</div>
                          <div className="hidden md:flex flex-wrap gap-1 mt-1">
                            {job.tags.map(tag => (
                              <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                          <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {job.source}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {job.posted}
                          </div>
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
                              variant={job.isSaved ? "secondary" : "outline"}
                              size="icon"
                              onClick={() => !job.isSaved && saveJob(job)}
                              disabled={saving === job.id || job.isSaved}
                              title={job.isSaved ? "Already saved" : "Save job"}
                            >
                              {saving === job.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
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
          )}
        </>
      )}

      {activeTab === "saved" && (
        <>
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
                          {renderStars(job.score || 0, editingJob === job.id)}
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
                              <option value="interested">interested</option>
                              <option value="applied">applied</option>
                              <option value="interview">interview</option>
                              <option value="rejected">rejected</option>
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
                                <Button size="icon" variant="ghost" onClick={() => deleteJob(job.id, job.url)}>
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

function SearchIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
}
