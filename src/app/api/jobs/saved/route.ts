import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.savedJob.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { title, company, location, salary, type, source, url, description, tags, externalId } = body;

    // Check if already saved
    const existing = await prisma.savedJob.findFirst({
      where: { url },
    });

    if (existing) {
      return NextResponse.json({ job: existing, message: "Job already saved" });
    }

    const job = await prisma.savedJob.create({
      data: {
        title,
        company,
        location,
        salary,
        type,
        source,
        url,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        externalId,
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}
