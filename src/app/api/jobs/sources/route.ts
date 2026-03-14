import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default sources
const DEFAULT_SOURCES = [
  "InfoJobs",
  "Tecnoempleo", 
  "Indeed",
  "LinkedIn",
  "Remote OK",
  "We Work Remotely",
  "Jooble",
  "Glassdoor",
  "General",
];

export async function GET() {
  try {
    // Initialize default sources if none exist
    const count = await prisma.jobSource.count();
    if (count === 0) {
      await prisma.jobSource.createMany({
        data: DEFAULT_SOURCES.map(name => ({ name, enabled: true })),
      });
    }

    const sources = await prisma.jobSource.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sources } = body; // Array of { name: string, enabled: boolean }

    // Update each source
    for (const source of sources) {
      await prisma.jobSource.upsert({
        where: { name: source.name },
        update: { enabled: source.enabled },
        create: { name: source.name, enabled: source.enabled },
      });
    }

    const updatedSources = await prisma.jobSource.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ sources: updatedSources });
  } catch (error) {
    console.error("Error updating sources:", error);
    return NextResponse.json({ error: "Failed to update sources" }, { status: 500 });
  }
}
