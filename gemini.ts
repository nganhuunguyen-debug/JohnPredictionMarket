
import { GoogleGenAI } from "@google/genai";
import { Stock } from "./types";

export const fetchStockAnalysis = async (): Promise<{ stocks: Stock[], sources: { title: string, uri: string }[] }> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY is not defined. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  
  const prompt = `
    CRITICAL REAL-TIME DATA REQUEST
    CURRENT DATE AND TIME: ${today}.
    
    YOUR CORE TASK:
    You MUST use Google Search to fetch the ABSOLUTELY LATEST current market prices for 50 high-potential stocks. 
    There is a severe penalty for providing outdated prices from your internal training data.
    
    STRICT VERIFICATION PROTOCOL:
    1. Search "current [Ticker] stock price" for every ticker on Google Finance, Yahoo Finance, or CNBC.
    2. ALERT: As of February 2025, stocks like PLTR are trading significantly higher (around $140-$150). If you see prices in the $60s or $70s, you are looking at OUTDATED 2024 data. RE-SEARCH and verify.
    3. Ensure prices for major tickers (NVDA, TSLA, PLTR, MSFT, AAPL, AMZN, META, GOOGL) are accurate to the latest trading session.
    
    For each of the 50 stocks, provide:
    - symbol: Ticker symbol (e.g., PLTR).
    - name: Full company name.
    - currentPrice: The ABSOLUTE LATEST market price found (Numeric, e.g., 147.17).
    - currentPriceDate: The exact timestamp of that quote (e.g., "Feb 24, 4:00 PM EST").
    - targetPrice: A realistic 7-day target.
    - targetPriceDate: Exactly 7 days from today.
    - reason: Why this stock is set for a big gain in the next 7 days (catalysts, earnings, breakouts).
    - sector: Industry sector.

    OUTPUT FORMAT:
    Return ONLY a valid JSON array of objects. No markdown, no text before or after the JSON.
    [
      {
        "symbol": "PLTR",
        "name": "Palantir Technologies Inc.",
        "currentPrice": 147.17,
        "currentPriceDate": "${today}",
        "targetPrice": 165.00,
        "targetPriceDate": "7 days from now",
        "reason": "Sustained momentum in AIP platform adoption and technical breakout.",
        "sector": "Software"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Force deterministic factual output
        responseMimeType: "application/json"
      },
    });

    const text = response.text;
    if (!text) throw new Error("The market intelligence service returned an empty response.");

    const rawStocks: any[] = JSON.parse(text);
    
    const stocks: Stock[] = rawStocks.map((s: any) => ({
      symbol: s.symbol || "UNKNOWN",
      name: s.name || "Unknown Company",
      currentPrice: Number(s.currentPrice) || 0,
      currentPriceDate: s.currentPriceDate || "Unknown Date",
      targetPrice: Number(s.targetPrice) || 0,
      targetPriceDate: s.targetPriceDate || "Unknown Target",
      reason: s.reason || "Trending market sentiment.",
      sector: s.sector || "General",
      gainPercentage: (s.currentPrice > 0 && s.targetPrice > 0) 
        ? ((Number(s.targetPrice) - Number(s.currentPrice)) / Number(s.currentPrice)) * 100 
        : 0
    }));

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Market Data Verification",
        uri: chunk.web?.uri || "https://finance.yahoo.com"
      })) || [];

    // Ensure we don't have duplicates and limit to 50
    const seen = new Set();
    const uniqueStocks = stocks.filter(el => {
      const duplicate = seen.has(el.symbol);
      seen.add(el.symbol);
      return !duplicate;
    }).slice(0, 50);

    return { stocks: uniqueStocks, sources };
  } catch (error: any) {
    console.error("Data Verification Failure:", error);
    throw new Error("Market Sync Error: Could not verify live prices. " + error.message);
  }
};
