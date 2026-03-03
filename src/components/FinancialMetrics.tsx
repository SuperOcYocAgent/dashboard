"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, Wallet, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  portfolio: {
    totalValue: number;
    dayChange: number;
    dayChangePercent: number;
  };
  timestamp: string;
}

function StockCard({ stock }: { stock: StockData }) {
  const isPositive = stock.changePercent >= 0;
  const isYonki = stock.source === "yonki";
  
  return (
    <Card className={`${isYonki ? "bg-amber-500/10 border-amber-500/30" : "bg-card border-border/50"} hover:border-border/80 transition-colors`}>
      <CardContent className="p-3 lg:p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-foreground text-sm lg:text-base flex items-center gap-1">
              {stock.symbol}
              {isYonki && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">{stock.name}</p>
          </div>
          {isYonki && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
              YONKI
            </span>
          )}
        </div>
        <div className="mt-2 lg:mt-3">
          <p className="text-lg lg:text-xl font-bold">${stock.price >= 1000 ? stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : stock.price.toFixed(2)}</p>
          <p className={`text-xs lg:text-sm ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
            {isPositive ? "+" : ""}{stock.change >= 0 ? stock.change.toFixed(2) : stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialMetrics() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finance");
      if (!res.ok) throw new Error("Failed to fetch");
      const financeData = await res.json();
      setData(financeData);
    } catch (err) {
      setError("Could not load financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading financial data...
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

  const { portfolio, stocks, etfs, crypto, timestamp } = data;
  const isPositive = portfolio.dayChangePercent >= 0;

  // Separate yonki stocks from M7
  const yonkiStocks = stocks.filter(s => s.source === "yonki");
  const m7Stocks = stocks.filter(s => s.source === "m7");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Financial</h2>
        <Button onClick={fetchData} variant="ghost" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Portfolio Summary */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
          </div>
          <p className="text-2xl lg:text-3xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
          <p className={`text-sm mt-1 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
            {isPositive ? "+" : ""}${portfolio.dayChange.toFixed(2)} ({portfolio.dayChangePercent}%) today
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(timestamp).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      {/* Yonki Stocks - differentiated */}
      {yonkiStocks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400" /> Acciones del Yonki
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
            {yonkiStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>
      )}

      {/* Magnificent 7 */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <span>⭐</span> Magnificent 7
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-3">
          {m7Stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>

      {/* ETFs */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <span>📈</span> ETFs
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
          {etfs.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>

      {/* Crypto */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <span>₿</span> Crypto
        </h3>
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          {crypto.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  );
}
