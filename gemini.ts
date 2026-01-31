
import { GoogleGenAI } from "@google/genai";
import { Stock } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const fetchStockAnalysis = async (): Promise<{ stocks: Stock[], sources: { title: string, uri: string }[] }> => {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const prompt = `
    Today's precise time is ${today}. 
    Use Google Search to find current, live market prices for 50 high-potential stocks (S&P 500, Tech, and Trending) for the next 7 days.
    
    For each stock, provide:
    1. Symbol
    2. Company Name
    3. CURRENT market price (The actual live price or most recent closing price found via search)
    4. The EXACT DATE/TIME of that current price (e.g., "Oct 24, 3:45 PM EST")
    5. TARGET Price for exactly 7 days from today
    6. TARGET Date (which should be 7 days from today)
    7. Reason for the predicted gain
    8. Sector

    IMPORTANT: Format your response as a valid JSON array of objects inside a code block.
    JSON structure:
    [
      {
        "symbol": "TSLA",
        "name": "Tesla Inc",
        "currentPrice": 213.54,
        "currentPriceDate": "Current Market Time",
        "targetPrice": 235.00,
        "targetPriceDate": "Target Date",
        "reason": "Strong delivery numbers and positive momentum.",
        "sector": "Automotive"
      }
    ]
    Return exactly 50 stocks. Ensure the currentPrice is as accurate as possible to the second I am asking.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Near-zero for maximum factual consistency
      },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse stock data from AI response.");
    }

    const stocks: Stock[] = JSON.parse(jsonMatch[0]).map((s: any) => ({
      ...s,
      gainPercentage: s.currentPrice > 0 ? ((s.targetPrice - s.currentPrice) / s.currentPrice) * 100 : 0
    }));

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Market Source",
        uri: chunk.web?.uri || "#"
      })) || [];

    return { stocks, sources };
  } catch (error) {
    console.error("Error fetching stock analysis:", error);
    throw error;
  }
};
