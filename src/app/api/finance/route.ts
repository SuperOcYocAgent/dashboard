import { NextResponse } from "next/server";

const YONKI_TICKERS = [
  { symbol: "NVDA", name: "NVIDIA", source: "yonki" },
  { symbol: "GOOGL", name: "Alphabet", source: "yonki" },
  { symbol: "META", name: "Meta", source: "yonki" },
  { symbol: "AMZN", name: "Amazon", source: "yonki" },
  { symbol: "MSFT", name: "Microsoft", source: "yonki" },
  { symbol: "AAPL", name: "Apple", source: "yonki" },
  { symbol: "AMD", name: "AMD", source: "yonki" },
  { symbol: "INTC", name: "Intel", source: "yonki" },
];

const MAGNIFICENT_7 = [
  { symbol: "AAPL", name: "Apple", source: "m7" },
  { symbol: "MSFT", name: "Microsoft", source: "m7" },
  { symbol: "AMZN", name: "Amazon", source: "m7" },
  { symbol: "GOOGL", name: "Alphabet", source: "m7" },
  { symbol: "META", name: "Meta", source: "m7" },
  { symbol: "NVDA", name: "Nvidia", source: "m7" },
  { symbol: "TSLA", name: "Tesla", source: "m7" },
];

const CRYPTO = [
  { symbol: "BTC", name: "Bitcoin", id: "bitcoin", source: "crypto" },
  { symbol: "ETH", name: "Ethereum", id: "ethereum", source: "crypto" },
];

const ETFs = [
  { symbol: "SPY", name: "S&P 500 ETF", source: "etf" },
  { symbol: "QQQ", name: "Nasdaq ETF", source: "etf" },
  { symbol: "SMH", name: "Semiconductors", source: "etf" },
  { symbol: "VGT", name: "Tech ETF", source: "etf" },
];

async function getStockPrice(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    // Prefer quote endpoint (more reliable intraday change)
    const q = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`, { next: { revalidate: 60 } });
    const qj = await q.json();
    const item = qj?.quoteResponse?.result?.[0];

    if (item?.regularMarketPrice != null) {
      const price = Number(item.regularMarketPrice) || 0;
      const change = Number(item.regularMarketChange) || 0;
      const changePercent = Number(item.regularMarketChangePercent) || 0;
      return { price, change, changePercent };
    }

    // Fallback to chart endpoint
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`, { next: { revalidate: 60 } });
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta?.regularMarketPrice || !meta?.previousClose) return null;

    const price = Number(meta.regularMarketPrice) || 0;
    const prev = Number(meta.previousClose) || 0;
    const change = price - prev;
    const changePercent = prev ? (change / prev) * 100 : 0;
    return { price, change, changePercent };
  } catch {
    return null;
  }
}

async function getCryptoPrices() {
  try {
    const ids = CRYPTO.map(c => c.id).join(",");
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, { next: { revalidate: 60 } });
    const data = await res.json();
    return CRYPTO.map(crypto => {
      const price = data[crypto.id]?.usd || 0;
      const changePercent = data[crypto.id]?.usd_24h_change || 0;
      const change = price * (changePercent / 100);
      return { symbol: crypto.symbol, name: crypto.name, price, change, changePercent, source: crypto.source };
    });
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const stockUniverse = [...MAGNIFICENT_7, ...YONKI_TICKERS.filter(y => !MAGNIFICENT_7.find(m => m.symbol === y.symbol))];

    const stockPromises = stockUniverse.map(async (stock) => {
      const d = await getStockPrice(stock.symbol);
      return { symbol: stock.symbol, name: stock.name, price: d?.price || 0, change: d?.change || 0, changePercent: d?.changePercent || 0, source: stock.source };
    });

    const etfPromises = ETFs.map(async (etf) => {
      const d = await getStockPrice(etf.symbol);
      return { symbol: etf.symbol, name: etf.name, price: d?.price || 0, change: d?.change || 0, changePercent: d?.changePercent || 0, source: etf.source };
    });

    const [stocks, etfs, crypto] = await Promise.all([Promise.all(stockPromises), Promise.all(etfPromises), getCryptoPrices()]);

    return NextResponse.json({
      stocks,
      etfs,
      crypto,
      portfolio: { totalValue: 125750.0, dayChange: 2340.5, dayChangePercent: 1.9 },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch finance data" }, { status: 500 });
  }
}
