
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
      console.error("App: loadData error:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || "An unexpected market sync error occurred."
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
    <div className="min-h-screen bg-[#020617] pb-32 max-w-md mx-auto relative shadow-2xl border-x border-white/5">
      <header className="sticky top-0 z-50 bg-[#020617]/95 backdrop-blur-xl px-6 py-6 border-b border-white/5 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900">
                <i className="fa-solid fa-bolt-lightning"></i>
              </span>
              BULLSEYE<span className="text-emerald-500">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Live Alpha Intelligence</p>
          </div>
          <button 
            onClick={loadData}
            disabled={state.loading}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 transition-all active:scale-95 disabled:opacity-30"
          >
            <i className={`fa-solid fa-rotate-right text-lg ${state.loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        <div className="relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-emerald-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Search 50 tickers..." 
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="px-4 pt-6">
        {state.loading ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-8">
            <div className="relative mb-8">
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-magnifying-glass-chart text-emerald-500/50 animate-pulse"></i>
              </div>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Verifying Live Prices</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[240px]">
              Searching Google Finance & Yahoo for current market data on 50 growth stocks...
            </p>
          </div>
        ) : state.error ? (
          <div className="py-24 text-center px-10">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-lg shadow-rose-900/20">
              <i className="fa-solid fa-triangle-exclamation text-3xl text-rose-500"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Sync Interrupted</h2>
            <div className="bg-slate-900/50 border border-rose-500/20 rounded-2xl p-4 mb-8">
              <p className="text-rose-300 text-xs italic leading-relaxed">"{state.error}"</p>
            </div>
            <button 
              onClick={loadData}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-white shadow-xl shadow-emerald-900/40 active:scale-95 transition-all text-sm tracking-widest uppercase"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live Grounding Active</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Synced: {state.lastUpdated}</span>
            </div>
            
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock, idx) => (
                <StockCard key={stock.symbol + idx} stock={stock} index={idx} />
              ))
            ) : (
              <div className="py-20 text-center">
                <i className="fa-solid fa-filter text-slate-700 text-4xl mb-4"></i>
                <p className="text-slate-500 text-sm">No tickers match "{searchQuery}"</p>
              </div>
            )}

            {state.sources.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/5 pb-12">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Verification Sources</h4>
                <div className="flex flex-wrap gap-2 px-2">
                  {state.sources.slice(0, 3).map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] bg-slate-800/50 text-slate-400 px-3 py-1.5 rounded-lg border border-white/5 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
                    >
                      <i className="fa-solid fa-link text-[8px] mr-1.5"></i>
                      {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
