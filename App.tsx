
import React, { useState, useEffect, useCallback } from 'react';
import { Stock, AppState } from './types';
import { fetchStockAnalysis } from './gemini';
import { StockCard } from './StockCard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    stocks: [],
    loading: true,
    error: null,
    lastUpdated: null,
    sources: []
  });

  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchStockAnalysis();
      setState({
        stocks: data.stocks,
        sources: data.sources,
        loading: false,
        error: null,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || "An unexpected error occurred."
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStocks = state.stocks.filter(s => 
    s.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] pb-32 max-w-md mx-auto relative shadow-2xl">
      <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md px-6 py-5 border-b border-white/5 shadow-lg">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter">BULLSEYE<span className="text-emerald-500">AI</span></h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">7-Day Alpha Signals</p>
          </div>
          <button 
            onClick={loadData}
            disabled={state.loading}
            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400 disabled:opacity-30"
          >
            <i className={`fa-solid fa-arrows-rotate ${state.loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          <input 
            type="text" 
            placeholder="Search 50 growth stocks..." 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="px-4 pt-6">
        {state.loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 text-sm font-medium">Scanning Market Trends...</p>
          </div>
        ) : state.error ? (
          <div className="py-20 text-center px-6">
            <div className="text-rose-500 text-4xl mb-4">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Connection Issue</h2>
            <p className="text-slate-400 text-xs mb-8 leading-relaxed italic">"{state.error}"</p>
            <button 
              onClick={loadData}
              className="px-8 py-3 bg-emerald-600 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Analysis Active</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Updated: {state.lastUpdated}</span>
            </div>
            {filteredStocks.map((stock, idx) => (
              <StockCard key={stock.symbol + idx} stock={stock} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
