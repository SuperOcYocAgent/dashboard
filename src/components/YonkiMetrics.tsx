"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Mail, TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YonkiEmail {
  id: string;
  subject: string;
  date: string;
  tickers: string[];
  preview: string;
}

interface YonkiData {
  emails: YonkiEmail[];
  total: number;
  timestamp: string;
}

function TickerBadge({ ticker }: { ticker: string }) {
  return (
    <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full">
      {ticker}
    </span>
  );
}

function EmailCard({ email }: { email: YonkiEmail }) {
  const date = new Date(email.date);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });

  return (
    <Card className="bg-card border-border/50 hover:border-border/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground text-sm truncate">{email.subject}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{email.preview}</p>
          </div>
          {email.tickers.length > 0 && (
            <div className="flex flex-wrap gap-1 shrink-0">
              {email.tickers.map((ticker) => (
                <TickerBadge key={ticker} ticker={ticker} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Tickers mentioned by Yonki that we track
const YONKI_TICKERS = ["NVDA", "GOOGL", "META", "AMZN", "MSFT", "AAPL", "BTC", "ETH", "AMD", "INTC"];

export function YonkiMetrics() {
  const [data, setData] = useState<YonkiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/yonki");
      if (!res.ok) throw new Error("Failed to fetch");
      const yonkiData = await res.json();
      setData(yonkiData);
    } catch (err) {
      setError("Could not load yonki data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading yonki emails...
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">{error || "No data available"}</p>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📧</span>
          <h2 className="text-lg font-semibold">Yonki de los Mercados</h2>
        </div>
        <Button onClick={fetchData} variant="ghost" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Tickers being tracked from Yonki */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Acciones del Yonki
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Tickers mencionados en los correos del Yonki:
          </p>
          <div className="flex flex-wrap gap-2">
            {YONKI_TICKERS.map((ticker) => (
              <TickerBadge key={ticker} ticker={ticker} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent emails */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Últimos correos ({data.total} total)
          </p>
        </div>
        {data.emails.map((email) => (
          <EmailCard key={email.id} email={email} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Última actualización: {new Date(data.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}
