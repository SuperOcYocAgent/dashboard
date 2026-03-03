import { NextResponse } from "next/server";

// Tickers que menciona el Yonki
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
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    
    if (!data.chart?.result?.[0]) return null;
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    
    if (!meta?.regularMarketPrice || !quote?.close?.length) return null;
    
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose || quote.close[quote.close.length - 2];
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      price: currentPrice,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

async function getCryptoPrices(): Promise<any[]> {
  try {
    const ids = CRYPTO.map(c => c.id).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    
    return CRYPTO.map(crypto => {
      const price = data[crypto.id]?.usd || 0;
      const changePercent = data[crypto.id]?.usd_24h_change || 0;
      const change = price * (changePercent / 100);
      
      return {
        symbol: crypto.symbol,
        name: crypto.name,
        price,
        change,
        changePercent,
        source: crypto.source,
      };
    });
  } catch (error) {
    console.error("Error fetching crypto:", error);
    return [];
  }
}

export async function GET() {
  try {
    // Fetch stock prices in parallel
    const stockPromises = [...MAGNIFICENT_7, ...YONKI_TICKERS.filter(y => !MAGNIFICENT_7.find(m => m.symbol === y.symbol))].map(async (stock) => {
      const data = await getStockPrice(stock.symbol);
      return {
        symbol: stock.symbol,
        name: stock.name,
        price: data?.price || 0,
        change: data?.change || 0,
        changePercent: data?.changePercent || 0,
        source: stock.source,
      };
    });

    const etfPromises = ETFs.map(async (etf) => {
      const data = await getStockPrice(etf.symbol);
      return {
        symbol: etf.symbol,
        name: etf.name,
        price: data?.price || 0,
        change: data?.change || 0,
        changePercent: data?.changePercent || 0,
        source: etf.source,
      };
    });

    const [stocks, etfs, crypto] = await Promise.all([
      Promise.all(stockPromises),
      Promise.all(etfPromises),
      getCryptoPrices(),
    ]);

    // Portfolio demo
    const portfolio = {
      totalValue: 125750.00,
      dayChange: 2340.50,
      dayChangePercent: 1.90,
    };

    return NextResponse.json({
      stocks,
      etfs,
      crypto,
      portfolio,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Finance API error:", error);
    return NextResponse.json({ error: "Failed to fetch finance data" }, { status: 500 });
  }
}
