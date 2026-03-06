"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Activity, 
  Clock,
  Network,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Metrics {
  cpu: string;
  memory: { total: number; used: number; free: number };
  disk: { total: string; used: string; free: string; percent: string };
  load: string;
  uptime: string;
  processes: number;
  connections: number;
  timestamp: string;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color 
}: { 
  title: string;
  value?: string;
  subtitle?: string;
  icon: any;
  color: string;
}) {
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-500`} 
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function VpsMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/metrics");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      setError("Could not load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading metrics...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const memPercent = metrics ? (metrics.memory.used / metrics.memory.total) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">VPS Metrics</h2>
        <Button onClick={fetchMetrics} variant="ghost" size="sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="CPU"
          value={`${metrics?.cpu}%`}
          icon={Cpu}
          color={parseFloat(metrics?.cpu || "0") > 80 ? "text-rose-500" : "text-emerald-500"}
        />
        <MetricCard
          title="Memory"
          value={`${metrics?.memory.used}MB`}
          subtitle={`${metrics?.memory.free}MB free`}
          icon={MemoryStick}
          color={memPercent > 80 ? "text-rose-500" : "text-blue-500"}
        />
        <MetricCard
          title="Disk"
          value={metrics?.disk.percent || "0%"}
          subtitle={`${metrics?.disk.free} free`}
          icon={HardDrive}
          color={parseInt(metrics?.disk.percent || "0") > 80 ? "text-rose-500" : "text-amber-500"}
        />
        <MetricCard
          title="Uptime"
          value={metrics?.uptime || "N/A"}
          subtitle={`${metrics?.processes} processes`}
          icon={Clock}
          color="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressBar value={memPercent} color={memPercent > 80 ? "bg-rose-500" : "bg-blue-500"} />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.memory.used}MB / {metrics?.memory.total}MB
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="w-4 h-4" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics?.connections}</p>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Load Average</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-mono">{metrics?.load}</p>
        </CardContent>
      </Card>
    </div>
  );
}
