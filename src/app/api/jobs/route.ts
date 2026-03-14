import { NextResponse } from "next/server";

// Jobs search queries for Yarán's profile
const SEARCH_QUERIES = [
  { query: "remote .NET developer jobs 2026", source: "General" },
  { query: "remote React Node.js developer jobs", source: "General" },
  { query: "remote full stack developer .NET Angular jobs", source: "General" },
  { query: "site:remoteok.com developer jobs", source: "Remote OK" },
  { query: "site:weworkremotely.com .NET developer", source: "We Work Remotely" },
];

interface JobResult {
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
    const apiKey = process.env.BRAVE_API_KEY || "BSAx2bYWGY_TxbGALLAMu2ykcXp5OYb";
    const jobs: JobResult[] = [];

    // Search for each query
    for (const { query, source } of SEARCH_QUERIES) {
      try {
        const response = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
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
              // Filter for job-related results
              const title = result.title || "";
              const description = result.description || "";
              
              // Only include relevant results
              if (
                title.toLowerCase().includes("job") ||
                title.toLowerCase().includes("developer") ||
                title.toLowerCase().includes("engineer") ||
                title.toLowerCase().includes("hiring") ||
                title.toLowerCase().includes("remote") ||
                description.toLowerCase().includes("remote") ||
                description.toLowerCase().includes("hiring")
              ) {
                // Extract company from title or description
                let company = "Unknown";
                const companyMatch = title.match(/at\s+([^-|]+)/i) || description.match(/at\s+([^-|]+)/i);
                if (companyMatch) {
                  company = companyMatch[1].trim();
                }

                // Determine source from URL
                let detectedSource = source;
                if (result.url?.includes("remoteok.com")) detectedSource = "Remote OK";
                else if (result.url?.includes("weworkremotely.com")) detectedSource = "We Work Remotely";
                else if (result.url?.includes("indeed.com")) detectedSource = "Indeed";
                else if (result.url?.includes("turing.com")) detectedSource = "Turing";
                else if (result.url?.includes("workingnomads.com")) detectedSource = "Working Nomads";
                else if (result.url?.includes("builtin.com")) detectedSource = "Built In";
                else if (result.url?.includes("jooble.org")) detectedSource = "Jooble";

                jobs.push({
                  title: title.replace(/[-|].*$/, "").trim(),
                  company,
                  location: description.toLowerCase().includes("remote") ? "Remote" : "Unknown",
                  description: description.substring(0, 200),
                  url: result.url || "",
                  source: detectedSource,
                  posted: result.age || "Recent",
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

    // Limit to 20 results
    return NextResponse.json({ jobs: uniqueJobs.slice(0, 20) });
  } catch (error) {
    console.error("Jobs search error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
