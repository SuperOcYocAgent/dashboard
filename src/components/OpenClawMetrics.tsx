"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, BookOpen, Cpu, Hash } from "lucide-react";

interface MemoryEntry { date: string; content: string; file: string; }
interface ModelUsage { name: string; model: string; tokensUsed: number; limit: number; resetDate: string; note?: string; }

interface OpenClawData {
  memory: MemoryEntry[];
  modelUsage: {
    models: ModelUsage[];
    details?: any;
    lastUpdated: string;
  };
  status: any;
  timestamp: string;
}

function ModelUsageCard({ model }: { model: ModelUsage }) {
  const percent = model.limit > 0 ? (model.tokensUsed / model.limit) * 100 : 0;
  const isHigh = percent > 80;
  return (
    <Card className={isHigh ? "bg-rose-500/10 border-rose-500/30" : "bg-card border-border/50"}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-bold text-foreground">{model.name}</p>
            <p className="text-xs text-muted-foreground">{model.model}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded ${isHigh ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>{percent.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div className={isHigh ? "h-full bg-rose-500" : "h-full bg-emerald-500"} style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{model.tokensUsed.toLocaleString()} / {model.limit.toLocaleString()}</span>
          <span>{model.resetDate}</span>
        </div>
        {model.note && <p className="text-xs text-muted-foreground mt-1">{model.note}</p>}
      </CardContent>
    </Card>
  );
}

export function OpenClawMetrics() {
  const [data, setData] = useState<OpenClawData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/openclaw");
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch {
      setError("Could not load OpenClaw data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 60000); return () => clearInterval(i); }, []);

  const filteredMemory = data?.memory.filter(entry => {
    const ms = searchQuery ? entry.content.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const md = selectedDate ? entry.date === selectedDate : true;
    return ms && md;
  }) || [];

  if (loading && !data) return <Card className="bg-card border-border/50"><CardContent className="p-6 text-center text-muted-foreground">Loading OpenClaw data...</CardContent></Card>;
  if (error || !data) return <Card className="bg-card border-border/50"><CardContent className="p-6 text-center"><p className="text-muted-foreground mb-4">{error || "No data"}</p><Button onClick={fetchData} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2"/>Retry</Button></CardContent></Card>;

  const mini = data.modelUsage?.details?.minimax;
  const codex = data.modelUsage?.details?.codex;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">OpenClaw</h2>
        <Button onClick={fetchData} variant="ghost" size="sm" disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></Button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Cpu className="w-4 h-4" />Token & Quota Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.modelUsage.models.map((model) => <ModelUsageCard key={model.name} model={model} />)}
        </div>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5"/>Memory History</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search in memories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={selectedDate === null ? "default" : "outline"} size="sm" onClick={() => setSelectedDate(null)}>All</Button>
            {data.memory.slice(0, 5).map((entry) => <Button key={entry.date} variant={selectedDate === entry.date ? "default" : "outline"} size="sm" onClick={() => setSelectedDate(entry.date)}>{entry.date}</Button>)}
          </div>
          <p className="text-xs text-muted-foreground">{filteredMemory.length} {filteredMemory.length === 1 ? "entry" : "entries"} found</p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMemory.map((entry) => (
              <div key={entry.date} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-primary">{entry.date}</span><span className="text-xs text-muted-foreground">{entry.content.split(/\s+/).length} words</span></div>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">{entry.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Hash className="w-4 h-4"/>System Info</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Memory Files</p><p className="font-medium">{data.memory.length}</p></div><div><p className="text-muted-foreground">Last Updated</p><p className="font-medium">{new Date(data.timestamp).toLocaleString()}</p></div></div></CardContent>
      </Card>
    </div>
  );
}
