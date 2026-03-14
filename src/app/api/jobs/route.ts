import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Jobs search queries for Yarán's profile - Spain & Europe focus
const SEARCH_QUERIES = [
  // Spain sites
  { query: "site:infojobs.net developer .NET", source: "InfoJobs" },
  { query: "site:infojobs.net full stack developer", source: "InfoJobs" },
  { query: "site:tecnoempleo.com developer", source: "Tecnoempleo" },
  { query: "site:indeed.es developer", source: "Indeed" },
  { query: "site:linkedin.com jobs Barcelona developer", source: "LinkedIn" },
  { query: "site:linkedin.com jobs Madrid .NET developer", source: "LinkedIn" },
  
  // Europe remote
  { query: "site:remoteok.com europe remote developer", source: "Remote OK" },
  { query: "site:weworkremotely.com europe remote", source: "We Work Remotely" },
  
  // General Europe
  { query: ".NET developer jobs Spain 2026", source: "General" },
  { query: "React Node.js developer jobs Europe remote", source: "General" },
  { query: "full stack developer Madrid Barcelona", source: "General" },
  { query: "empleo desarrollador .NET España", source: "General" },
  
  // Job boards
  { query: "site:jooble.org España developer", source: "Jooble" },
  { query: "site:glassdoor.es developer", source: "Glassdoor" },
];

// Generate unique ID from URL
const generateJobId = (url: string, source: string): string => {
  const hash = crypto.createHash("md5").update(url).digest("hex");
  return `${source.toLowerCase().replace(/\s+/g, "-")}-${hash.substring(0, 8)}`;
};

// Filter jobs published in the last week
const isWithinLastWeek = (posted: string): boolean => {
  if (!posted) return true;
  
  const lowerPosted = posted.toLowerCase();
  
  const hourMatch = lowerPosted.match(/(\d+)\s*hour/);
  const dayMatch = lowerPosted.match(/(\d+)\s*day/);
  const weekMatch = lowerPosted.match(/(\d+)\s*week/);
  const monthMatch = lowerPosted.match(/(\d+)\s*month/);
  
  if (hourMatch) {
    const hours = parseInt(hourMatch[1]);
    return hours <= 24 * 7;
  }
  
  if (dayMatch) {
    const days = parseInt(dayMatch[1]);
    return days <= 7;
  }
  
  if (weekMatch) {
    const weeks = parseInt(weekMatch[1]);
    return weeks <= 1;
  }
  
  if (monthMatch) {
    const months = parseInt(monthMatch[1]);
    return months < 1;
  }
  
  return true;
};

interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  posted: string;
}

export async function GET() {
  try {
    // Get enabled sources from DB
    const enabledSources = await prisma.jobSource.findMany({
      where: { enabled: true },
      select: { name: true },
    });
    
    const enabledSourceNames = new Set(enabledSources.map(s => s.name));
    
    // Filter queries based on enabled sources
    const filteredQueries = SEARCH_QUERIES.filter(q => enabledSourceNames.has(q.source));
    
    // If no sources enabled, return empty
    if (filteredQueries.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const apiKey = process.env.BRAVE_API_KEY || "BSAx2bYWGY_TxbGALLAMu2ykcXp5OYb";
    const jobs: JobResult[] = [];

    // Search for each query
    for (const { query, source } of filteredQueries) {
      try {
        const response = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=15`,
          {
            headers: {
              "X-Subscription-Token": apiKey,
              "Accept": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.web?.results) {
            for (const result of data.web.results) {
              const title = result.title || "";
              const description = result.description || "";
              const posted = result.age || "";
              
              if (!isWithinLastWeek(posted)) {
                continue;
              }
              
              if (
                title.toLowerCase().includes("job") ||
                title.toLowerCase().includes("empleo") ||
                title.toLowerCase().includes("developer") ||
                title.toLowerCase().includes("engineer") ||
                title.toLowerCase().includes("programador") ||
                title.toLowerCase().includes("desarrollador") ||
                title.toLowerCase().includes("hiring") ||
                title.toLowerCase().includes("trabajo") ||
                title.toLowerCase().includes("vacante") ||
                title.toLowerCase().includes("position") ||
                description.toLowerCase().includes("empleo") ||
                description.toLowerCase().includes("trabajo") ||
                description.toLowerCase().includes("hiring")
              ) {
                let company = "Unknown";
                const companyMatch = title.match(/at\s+([^-|]+)/i) || description.match(/at\s+([^-|]+)/i);
                if (companyMatch) {
                  company = companyMatch[1].trim();
                }

                let location = "Unknown";
                const lowerDesc = description.toLowerCase();
                const lowerTitle = title.toLowerCase();
                
                if (lowerDesc.includes("remote") || lowerTitle.includes("remote") || lowerDesc.includes("remoto") || lowerTitle.includes("remoto")) {
                  location = "Remote";
                } else if (lowerDesc.includes("barcelona") || lowerTitle.includes("barcelona")) {
                  location = "Barcelona";
                } else if (lowerDesc.includes("madrid") || lowerTitle.includes("madrid")) {
                  location = "Madrid";
                } else if (lowerDesc.includes("valencia") || lowerTitle.includes("valencia")) {
                  location = "Valencia";
                } else if (lowerDesc.includes("sevilla") || lowerTitle.includes("sevilla")) {
                  location = "Sevilla";
                } else if (lowerDesc.includes("españa") || lowerTitle.includes("españa") || lowerDesc.includes("spain") || lowerTitle.includes("spain")) {
                  location = "España";
                } else if (lowerDesc.includes("europe") || lowerTitle.includes("europe") || lowerDesc.includes("europa") || lowerTitle.includes("europa")) {
                  location = "Europa";
                }

                let detectedSource = source;
                if (result.url?.includes("infojobs.net")) detectedSource = "InfoJobs";
                else if (result.url?.includes("tecnoempleo.com")) detectedSource = "Tecnoempleo";
                else if (result.url?.includes("indeed.es") || result.url?.includes("indeed.com")) detectedSource = "Indeed";
                else if (result.url?.includes("linkedin.com")) detectedSource = "LinkedIn";
                else if (result.url?.includes("remoteok.com")) detectedSource = "Remote OK";
                else if (result.url?.includes("weworkremotely.com")) detectedSource = "We Work Remotely";
                else if (result.url?.includes("jooble.org")) detectedSource = "Jooble";
                else if (result.url?.includes("glassdoor")) detectedSource = "Glassdoor";

                const jobUrl = result.url || "";
                
                jobs.push({
                  id: generateJobId(jobUrl, detectedSource),
                  title: title.replace(/[-|].*$/, "").trim(),
                  company,
                  location,
                  description: description.substring(0, 200),
                  url: jobUrl,
                  source: detectedSource,
                  posted,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error searching ${query}:`, err);
      }
    }

    // Remove duplicates based on URL
    const uniqueJobs = jobs.filter((job, index, self) => 
      index === self.findIndex((j) => j.url === job.url)
    );

    // Get saved jobs to check which are already saved
    const savedJobs = await prisma.savedJob.findMany({
      select: { url: true },
    });
    const savedUrls = new Set(savedJobs.map(j => j.url));

    // Mark saved status
    const jobsWithSavedStatus = uniqueJobs.slice(0, 25).map(job => ({
      ...job,
      isSaved: savedUrls.has(job.url),
    }));

    return NextResponse.json({ jobs: jobsWithSavedStatus });
  } catch (error) {
    console.error("Jobs search error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
