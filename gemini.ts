
import { GoogleGenAI } from "@google/genai";
import { Stock } from "./types";

/**
 * Fetches stock analysis using Gemini 3 Flash with Google Search grounding.
 * Optimized to prevent 500 Internal Errors by keeping the search requirements focused.
 */
export const fetchStockAnalysis = async (): Promise<{ stocks: Stock[], sources: { title: string, uri: string }[] }> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please ensure your environment is configured correctly.");
  }

  // Use the recommended initialization pattern
  const ai = new GoogleGenAI({ apiKey });
  
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' 
  });
  
  const prompt = `
    Today's Date/Time: ${timestamp}.
    
    TASK: Identify 50 stocks (S&P 500, Nasdaq, and high-growth tickers) with significant gain potential over the next 7 days.
    
    SEARCH REQUIREMENT:
    Use Google Search to find the ACTUAL current market prices. 
    IMPORTANT: Palantir (PLTR) is currently trading around $140-$150. Do NOT provide prices in the $60s or $70s as that is outdated data. Verify current prices for all major AI and tech tickers (NVDA, TSLA, PLTR, MSFT, etc.).
    
    For each stock, return:
    - symbol: Ticker (e.g., "PLTR")
    - name: Company Name
    - currentPrice: The real-time price found via search (Number)
    - currentPriceDate: String timestamp of the quote
    - targetPrice: Predicted 7-day target (Number)
    - targetPriceDate: Date 7 days from now
    - reason: One clear bullish catalyst
    - sector: Industry sector

    OUTPUT: Return ONLY a valid JSON array of 50 objects.
    Example: [{"symbol":"PLTR","name":"Palantir Technologies","currentPrice":147.17,"currentPriceDate":"Feb 24, 2025","targetPrice":165.00,"targetPriceDate":"Mar 03, 2025","reason":"AIP platform acceleration.","sector":"Software"}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Keeping temperature slightly above 0 can sometimes resolve 500 errors in tool-use
        temperature: 0.1,
        responseMimeType: "application/json"
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("The AI returned an empty response.");
    }

    let rawStocks: any[];
    try {
      rawStocks = JSON.parse(text);
    } catch (parseError) {
      // Fallback for messy markdown formatting if model ignores mime type instruction
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        rawStocks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse stock data JSON.");
      }
    }
    
    const stocks: Stock[] = rawStocks.map((s: any) => ({
      symbol: s.symbol || "???",
      name: s.name || "Unknown Asset",
      currentPrice: Number(s.currentPrice) || 0,
      currentPriceDate: s.currentPriceDate || timestamp,
      targetPrice: Number(s.targetPrice) || 0,
      targetPriceDate: s.targetPriceDate || "7 days out",
      reason: s.reason || "Trending market momentum.",
      sector: s.sector || "Uncategorized",
      gainPercentage: (Number(s.currentPrice) > 0) 
        ? ((Number(s.targetPrice) - Number(s.currentPrice)) / Number(s.currentPrice)) * 100 
        : 0
    }));

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Market Verification",
        uri: chunk.web?.uri || "https://google.com/finance"
      })) || [];

    // Filter duplicates and limit
    const uniqueMap = new Map();
    stocks.forEach(s => uniqueMap.set(s.symbol, s));
    const finalStocks = Array.from(uniqueMap.values()).slice(0, 50);

    return { stocks: finalStocks, sources };
  } catch (error: any) {
    console.error("fetchStockAnalysis failure:", error);
    // Extract user-friendly message from typical Gemini error objects
    const errorMessage = error.message || "Internal Server Error during market sync.";
    if (errorMessage.includes("INTERNAL")) {
      throw new Error("The search engine encountered a temporary glitch. Please try refreshing in a moment.");
    }
    throw new Error(errorMessage);
  }
};
