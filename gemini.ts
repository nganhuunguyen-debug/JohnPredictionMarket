
import { GoogleGenAI } from "@google/genai";
import { Stock } from "./types";

export const fetchStockAnalysis = async (): Promise<{ stocks: Stock[], sources: { title: string, uri: string }[] }> => {
  // Ensure the API key is retrieved exactly when the button is pressed
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY is not defined. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const prompt = `
    Today's precise time is ${today}. 
    Use Google Search to find current, live market prices for 50 high-potential stocks (S&P 500 and Trending Growth) for the next 7 days.
    
    For each stock, provide:
    1. symbol
    2. name
    3. currentPrice (Live price from search)
    4. currentPriceDate (Timestamp of the search result)
    5. targetPrice (7-day projection)
    6. targetPriceDate (7 days from today)
    7. reason (Concise catalyst)
    8. sector

    Return ONLY a valid JSON array of objects. No markdown, no commentary.
    JSON structure:
    [
      {
        "symbol": "AAPL",
        "name": "Apple Inc",
        "currentPrice": 230.12,
        "currentPriceDate": "Current Time",
        "targetPrice": 245.00,
        "targetPriceDate": "Target Date",
        "reason": "Strong demand for new AI features.",
        "sector": "Technology"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
        responseMimeType: "application/json"
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini.");

    const stocks: Stock[] = JSON.parse(text).map((s: any) => ({
      ...s,
      gainPercentage: s.currentPrice > 0 ? ((s.targetPrice - s.currentPrice) / s.currentPrice) * 100 : 0
    }));

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Market Data",
        uri: chunk.web?.uri || "#"
      })) || [];

    return { stocks, sources };
  } catch (error: any) {
    console.error("Gemini Fetch Error:", error);
    throw new Error(error.message || "Failed to retrieve live stock data.");
  }
};
