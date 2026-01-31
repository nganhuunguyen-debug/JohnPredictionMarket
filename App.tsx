
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
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to fetch market insights. Please ensure your API key is configured correctly."
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStocks = state.stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md px-6 py-4 border-b border-white/5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter">BULLSEYE<span className="text-emerald-500">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-Time Market Pulse</p>
          </div>
          <button 
            onClick={() => loadData()}
            className="p-2 bg-slate-800 rounded-full text-emerald-400 hover:bg-slate-700 transition-colors"
          >
            <i className={`fa-solid fa-rotate ${state.loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          <input 
            type="text" 
            placeholder="Search 50 trending stocks..." 
            className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6">
        {state.loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-lg font-bold text-white mb-2">Fetching Market Data</h2>
            <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed">
              Grounding predictions in real-time search results...
            </p>
          </div>
        ) : state.error ? (
          <div className="py-20 text-center px-6">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-triangle-exclamation text-2xl text-rose-500"></i>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Build/Network Error</h2>
            <p className="text-slate-400 text-xs mb-6">{state.error}</p>
            <button 
              onClick={() => loadData()}
              className="px-6 py-2 bg-emerald-600 rounded-lg font-bold text-white shadow-lg active:scale-95 transition-all"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 live-indicator"></div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Live Verification Active</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Sync: {state.lastUpdated}</span>
            </div>

            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock, idx) => (
                <StockCard key={stock.symbol + idx} stock={stock} index={idx} />
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-slate-500 text-sm">No results found for "{searchQuery}"</p>
              </div>
            )}

            {/* Verification Links */}
            {state.sources.length > 0 && (
              <div className="mt-8 mb-12 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Search Data Points</h4>
                <div className="space-y-3">
                  {state.sources.slice(0, 5).map((source, i) => (
                    <a 
                      key={i}
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between group py-1"
                    >
                      <span className="text-[11px] text-slate-400 truncate pr-4 group-hover:text-emerald-400 transition-colors underline decoration-slate-800">{source.title}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-700"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Nav */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 border-t border-white/5 flex flex-col items-center">
        <p className="text-[8px] text-slate-600 text-center leading-tight mb-3 px-8 uppercase tracking-tighter">
          Financial data is AI-retrieved via Google Search. Verify all figures before making trades.
        </p>
        <div className="flex justify-around w-full">
          <button className="text-emerald-500 flex flex-col items-center">
            <i className="fa-solid fa-bolt text-lg"></i>
            <span className="text-[9px] font-black mt-1 uppercase">Signals</span>
          </button>
          <button className="text-slate-600 flex flex-col items-center">
            <i className="fa-solid fa-layer-group text-lg"></i>
            <span className="text-[9px] font-black mt-1 uppercase">Portfolio</span>
          </button>
          <button className="text-slate-600 flex flex-col items-center">
            <i className="fa-solid fa-gear text-lg"></i>
            <span className="text-[9px] font-black mt-1 uppercase">Settings</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
