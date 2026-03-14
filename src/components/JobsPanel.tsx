"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, DollarSign, Clock, ExternalLink, RefreshCw, Filter, Loader2 } from "lucide-react";

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
}

// Sample job data - in production, this would come from a scraper/API
const sampleJobs: Job[] = [
  {
    id: "1",
    title: "Senior Full Stack Developer (.NET/React)",
    company: "TechCorp",
    location: "Remote",
    salary: "$120k - $150k",
    type: "Full-time",
    posted: "2h ago",
    tags: [".NET", "React", "PostgreSQL"],
    source: "Remote OK",
    url: "https://remoteok.com"
  },
  {
    id: "2",
    title: "Backend Developer - Node.js/.NET",
    company: "StartupXYZ",
    location: "Remote (US)",
    salary: "$100k - $130k",
    type: "Full-time",
    posted: "5h ago",
    tags: ["Node.js", ".NET Core", "AWS"],
    source: "We Work Remotely",
    url: "https://weworkremotely.com"
  },
  {
    id: "3",
    title: "Full Stack Engineer",
    company: "BigTech Inc",
    location: "Remote",
    salary: "$140k - $180k",
    type: "Full-time",
    posted: "1d ago",
    tags: ["React", "Angular", "C#", "SQL Server"],
    source: "Indeed",
    url: "https://indeed.com"
  },
  {
    id: "4",
    title: ".NET Developer",
    company: "Enterprise Solutions",
    location: "Remote (Worldwide)",
    salary: "$80k - $110k",
    type: "Contract",
    posted: "1d ago",
    tags: [".NET", "EF Core", "Angular"],
    source: "Working Nomads",
    url: "https://workingnomads.com"
  },
  {
    id: "5",
    title: "Senior Software Engineer (Full Stack)",
    company: "InnovateTech",
    location: "Remote",
    salary: "$130k - $160k",
    type: "Full-time",
    posted: "2d ago",
    tags: ["TypeScript", ".NET", "React", "PostgreSQL"],
    source: "Turing",
    url: "https://turing.com"
  }
];

const sources = ["All", "Remote OK", "We Work Remotely", "Indeed", "Working Nomads", "Turing", "Built In", "Jooble"];
const jobTypes = ["All", "Full-time", "Contract", "Part-time"];

export function JobsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      
      if (data.jobs) {
        // Transform API results to Job format
        const transformedJobs: Job[] = data.jobs.map((job: any, index: number) => ({
          id: `job-${index}`,
          title: job.title,
          company: job.company,
          location: job.location || "Remote",
          salary: "Competitive", // Brave Search doesn't always provide salary
          type: job.description?.toLowerCase().includes("contract") ? "Contract" : "Full-time",
          posted: job.posted || "Recent",
          tags: extractTags(job.title + " " + job.description),
          source: job.source || "Search",
          url: job.url,
          description: job.description,
        }));
        setJobs(transformedJobs);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractTags = (text: string): string[] => {
    const techTags = [".NET", "C#", "React", "Node.js", "Angular", "TypeScript", "PostgreSQL", "AWS", "Azure", "Docker", "JavaScript", "Python"];
    return techTags.filter(tag => 
      text.toLowerCase().includes(tag.toLowerCase())
    ).slice(0, 4);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const sourceMatch = selectedSource === "All" || job.source.includes(selectedSource);
    const typeMatch = selectedType === "All" || job.type === selectedType;
    return sourceMatch && typeMatch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Remote Jobs</h2>
          <p className="text-sm text-muted-foreground">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Searching for jobs..."}
          </p>
        </div>
        <Button 
          onClick={fetchJobs} 
          disabled={loading}
          className="w-full sm:w-auto"
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
        Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
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
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Posted</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Source</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job, index) => (
                <tr 
                  key={job.id} 
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-in fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-4">
                    <div className="font-medium text-foreground">{job.title}</div>
                    <div className="flex flex-wrap gap-1 mt-1 md:hidden">
                      {job.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
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
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.posted}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                      {job.source}
                    </span>
                  </td>
                  <td className="p-4">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p>Searching for remote jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No jobs found matching your filters.</p>
        </div>
      ) : null}
    </div>
  );
}
