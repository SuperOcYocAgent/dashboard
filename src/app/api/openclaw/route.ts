import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

interface MemoryEntry {
  date: string;
  content: string;
  file: string;
}

async function getMemoryFiles(): Promise<MemoryEntry[]> {
  const memoryDir = path.join(process.env.HOME || "/home/claw", ".openclaw/workspace/memory");
  const entries: MemoryEntry[] = [];

  try {
    const files = fs.readdirSync(memoryDir);
    for (const file of files) {
      if (file.endsWith(".md") && !file.startsWith("MEMORY")) {
        const filePath = path.join(memoryDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        entries.push({ date: file.replace(".md", ""), content, file });
      }
    }
  } catch (error) {
    console.error("Error reading memory:", error);
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

async function getOpenClawStatus() {
  try {
    const { stdout } = await execAsync("openclaw status --json 2>/dev/null || echo '{}'");
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

async function getMiniMaxUsage() {
  try {
    const { stdout } = await execAsync(
      "cd /home/claw/.openclaw/workspace/skills/minimax-usage && ./minimax-usage.sh",
      { timeout: 15000 }
    );

    const usedMatch = stdout.match(/Used:\s+(\d+)\s*\/\s*(\d+)\s*prompts\s*\((\d+)%\)/i);
    const remainingMatch = stdout.match(/Remaining:\s+(\d+)\s*prompts/i);
    const resetMatch = stdout.match(/Resets in:\s+([^\n]+)/i);
    const modelMatch = stdout.match(/Coding Plan Status\s*\(([^)]+)\)/i);

    if (!usedMatch) {
      return { ok: false, raw: stdout, error: "Could not parse MiniMax usage" };
    }

    return {
      ok: true,
      model: modelMatch?.[1] || "MiniMax-M2",
      used: Number(usedMatch[1]),
      limit: Number(usedMatch[2]),
      percentUsed: Number(usedMatch[3]),
      remaining: Number(remainingMatch?.[1] || 0),
      resetIn: resetMatch?.[1]?.trim() || "N/A",
      raw: stdout,
    };
  } catch (error: any) {
    return { ok: false, error: error?.message || "MiniMax usage failed" };
  }
}

async function getCodexUsage() {
  try {
    const { stdout } = await execAsync(
      "cd /home/claw/.openclaw/workspace && node skills/ai-quota-check/index.js",
      { timeout: 15000 }
    );

    // Robust parsing (markdown may include **Daily:** and emojis)
    const normalized = stdout.replace(/\*\*/g, "");
    const dailyMatch = normalized.match(/^\s*-\s*Daily:\s*.*?(\d+)%\s*left\s*\(resets\s*([^)]*)\)/im);
    const weeklyMatch = normalized.match(/^\s*-\s*Weekly:\s*.*?(\d+)%\s*left\s*\(resets\s*([^)]*)\)/im);

    return {
      ok: true,
      dailyLeftPercent: dailyMatch ? Number(dailyMatch[1]) : null,
      dailyResetIn: dailyMatch?.[2]?.trim() || "N/A",
      weeklyLeftPercent: weeklyMatch ? Number(weeklyMatch[1]) : null,
      weeklyResetIn: weeklyMatch?.[2]?.trim() || "N/A",
      raw: stdout,
    };
  } catch (error: any) {
    return { ok: false, error: error?.message || "Codex usage failed" };
  }
}

async function getModelUsage() {
  const [miniMax, codex] = await Promise.all([getMiniMaxUsage(), getCodexUsage()]);

  const models: Array<{
    name: string;
    model: string;
    tokensUsed: number;
    limit: number;
    resetDate: string;
    note?: string;
  }> = [];

  if (miniMax.ok) {
    models.push({
      name: "MiniMax Plan",
      model: miniMax.model || "MiniMax-M2",
      tokensUsed: miniMax.used || 0,
      limit: miniMax.limit || 1,
      resetDate: miniMax.resetIn || "N/A",
      note: `${miniMax.remaining} prompts left`,
    });
  }

  if (codex.ok) {
    if (typeof codex.dailyLeftPercent === "number") {
      const used = 100 - codex.dailyLeftPercent;
      models.push({
        name: "Codex 5h Cycle",
        model: "openai-codex",
        tokensUsed: used,
        limit: 100,
        resetDate: codex.dailyResetIn || "N/A",
        note: `${codex.dailyLeftPercent}% left (short window)`,
      });
    }

    if (typeof codex.weeklyLeftPercent === "number") {
      const used = 100 - codex.weeklyLeftPercent;
      models.push({
        name: "Codex Weekly",
        model: "openai-codex",
        tokensUsed: used,
        limit: 100,
        resetDate: codex.weeklyResetIn || "N/A",
        note: `${codex.weeklyLeftPercent}% left`,
      });
    }
  }

  return {
    models,
    details: {
      minimax: miniMax,
      codex,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const [memory, status, modelUsage] = await Promise.all([
      getMemoryFiles(),
      getOpenClawStatus(),
      getModelUsage(),
    ]);

    return NextResponse.json({
      memory,
      status,
      modelUsage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("OpenClaw API error:", error);
    return NextResponse.json({ error: "Failed to fetch OpenClaw data" }, { status: 500 });
  }
}
