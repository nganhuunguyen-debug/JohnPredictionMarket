
export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  currentPriceDate: string;
  targetPrice: number;
  targetPriceDate: string;
  gainPercentage: number;
  reason: string;
  sector: string;
}

export interface AppState {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  sources: { title: string; uri: string }[];
}
