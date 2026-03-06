"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Star, ArrowUpDown } from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  source: string;
}

interface FinanceData {
  stocks: StockData[];
  etfs: StockData[];
  crypto: StockData[];
  portfolio: { totalValue: number; dayChange: number; dayChangePercent: number };
  timestamp: string;
}

type SortKey = "symbol" | "source" | "price" | "changePercent";

export function FinancialMetrics() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("changePercent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance");
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 60000);
    return () => clearInterval(t);
  }, []);

  if (!data) {
    return <Card className="bg-card border-border/50"><CardContent className="p-6 text-center text-muted-foreground">Loading financial data...</CardContent></Card>;
  }

  const rows: StockData[] = [...data.stocks, ...data.etfs, ...data.crypto];

  const sortedRows = useMemo(() => {
    const clone = [...rows];
    clone.sort((a, b) => {
      let va: any = a[sortKey];
      let vb: any = b[sortKey];
      if (sortKey === "symbol" || sortKey === "source") {
        va = String(va);
        vb = String(vb);
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
    });
    return clone;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "symbol" || k === "source" ? "asc" : "desc");
    }
  };

  const sourceBadge = (s: string) => {
    if (s === "yonki") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (s === "m7") return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (s === "etf") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  };

  const sourceLabel = (s: string) => (s === "yonki" ? "YONKI" : s === "m7" ? "M7" : s === "etf" ? "ETF" : "CRYPTO");

  const thBtn = (label: string, key: SortKey, align: "left" | "right" = "left") => (
    <button onClick={() => toggleSort(key)} className={`inline-flex items-center gap-1 hover:text-foreground ${align === "right" ? "ml-auto" : ""}`}>
      {label} <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Financial Assets</h2>
        <Button onClick={fetchData} variant="ghost" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20">
        <CardContent className="p-4 lg:p-6">
          <p className="text-sm text-muted-foreground">Portfolio Value</p>
          <p className="text-2xl lg:text-3xl font-bold">${data.portfolio.totalValue.toLocaleString()}</p>
          <p className={data.portfolio.dayChangePercent >= 0 ? "text-emerald-500 text-sm" : "text-rose-500 text-sm"}>
            {data.portfolio.dayChangePercent >= 0 ? "+" : ""}${data.portfolio.dayChange.toFixed(2)} ({data.portfolio.dayChangePercent}%) today
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-base">All Assets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="text-left px-4 py-3">{thBtn("Asset", "symbol")}</th>
                  <th className="text-left px-4 py-3">{thBtn("Type", "source")}</th>
                  <th className="text-right px-4 py-3">{thBtn("Price", "price", "right")}</th>
                  <th className="text-right px-4 py-3">{thBtn("Change %", "changePercent", "right")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((r) => {
                  const up = r.changePercent >= 0;
                  return (
                    <tr key={`${r.source}-${r.symbol}`} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{r.symbol}</span>
                          {r.source === "yonki" && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{r.name}</div>
                      </td>
                      <td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded border ${sourceBadge(r.source)}`}>{sourceLabel(r.source)}</span></td>
                      <td className="px-4 py-3 text-right font-medium">${r.price >= 1000 ? r.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : r.price.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${up ? "text-emerald-500" : "text-rose-500"}`}>
                        {up ? "+" : ""}{r.change.toFixed(2)} ({r.changePercent.toFixed(2)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-right">Last update: {new Date(data.timestamp).toLocaleTimeString()}</p>
    </div>
  );
}
