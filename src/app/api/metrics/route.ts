import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getCpuUsage() {
  const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1");
  return parseFloat(stdout.trim()) || 0;
}

async function getMemory() {
  const { stdout } = await execAsync("free -m | grep Mem");
  const parts = stdout.trim().split(/\s+/);
  return {
    total: parseInt(parts[1]),
    used: parseInt(parts[2]),
    free: parseInt(parts[3]),
  };
}

async function getDisk() {
  const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $2,$3,$4,$5}'");
  const parts = stdout.trim().split(/\s+/);
  return {
    total: parts[0],
    used: parts[1],
    free: parts[2],
    percent: parts[3],
  };
}

async function getLoadAverage() {
  const { stdout } = await execAsync("uptime | awk -F'load average:' '{print $2}'");
  return stdout.trim();
}

async function getUptime() {
  const { stdout } = await execAsync("uptime -p");
  return stdout.trim();
}

async function getProcessCount() {
  const { stdout } = await execAsync("ps aux | wc -l");
  return parseInt(stdout.trim());
}

async function getNetworkConnections() {
  const { stdout } = await execAsync("ss -tun | wc -l");
  return parseInt(stdout.trim()) - 1;
}

export async function GET() {
  try {
    const [cpu, memory, disk, load, uptime, processes, connections] = await Promise.all([
      getCpuUsage(),
      getMemory(),
      getDisk(),
      getLoadAverage(),
      getUptime(),
      getProcessCount(),
      getNetworkConnections(),
    ]);

    return NextResponse.json({
      cpu: cpu.toFixed(1),
      memory,
      disk,
      load,
      uptime,
      processes,
      connections,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
