import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface EmailSummary {
  id: string;
  subject: string;
  date: string;
  preview: string;
  tickers: string[];
}

const TICKER_MENTIONS: Record<string, string[]> = {
  "APOCALIPSIS EN EL SECTOR SOFTWARE": ["NVDA", "GOOGL", "META", "AMZN", "MSFT"],
  "Ha fracasado bitcoin": ["BTC", "ETH"],
  "3 ACCIONES PARA INVERTIR EN EL CEREBRO": ["NVDA", "AMD", "INTC"],
  "CEREBRO DE LA INTELIGENCIA ARTIFICIAL": ["NVDA", "AMD", "INTC"],
};

function extractTickers(subject: string): string[] {
  const upperSubject = subject.toUpperCase();
  for (const [key, tickers] of Object.entries(TICKER_MENTIONS)) {
    if (upperSubject.includes(key.toUpperCase())) {
      return tickers;
    }
  }
  return [];
}

function extractPreview(text: string): string {
  // Clean and get first 200 chars
  const cleaned = text
    .replace(/\[.*?\]/g, "") // Remove links
    .replace(/\n+/g, " ") // Replace newlines
    .replace(/\s+/g, " ") // Normalize spaces
    .slice(0, 200);
  return cleaned + "...";
}

export async function GET() {
  try {
    // Get recent emails from yonki
    const { stdout } = await execAsync(
      'himalaya envelope list --folder INBOX --output json "from yonki" 2>/dev/null | head -20'
    );

    // Parse JSON output (skip the imap warnings)
    const lines = stdout.split("\n").filter(line => line.startsWith("[{"));
    const emails = lines.length > 0 ? JSON.parse(lines[0]) : [];

    const summaries: EmailSummary[] = emails.slice(0, 5).map((email: any) => ({
      id: email.id,
      subject: email.subject,
      date: email.date,
      tickers: extractTickers(email.subject),
      preview: "",
    }));

    // Get full content for previews
    for (const summary of summaries) {
      try {
        const { stdout: content } = await execAsync(
          `himalaya message read ${summary.id} 2>/dev/null | head -100`
        );
        summary.preview = extractPreview(content);
      } catch {
        summary.preview = "Could not load preview...";
      }
    }

    return NextResponse.json({
      emails: summaries,
      total: emails.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Yonki API error:", error);
    return NextResponse.json({ 
      emails: [],
      error: "Failed to fetch yonki emails" 
    }, { status: 500 });
  }
}
