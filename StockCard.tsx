
import React from 'react';
import { Stock } from './types';

interface StockCardProps {
  stock: Stock;
  index: number;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, index }) => {
  const isPositive = stock.gainPercentage > 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-[2rem] mb-4 border border-white/5 shadow-xl transition-all active:scale-[0.98] hover:border-emerald-500/20">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 overflow-hidden mr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md border border-emerald-500/20">
              #{index + 1}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
              {stock.sector}
            </span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tighter flex items-baseline gap-2">
            {stock.symbol}
            <span className="text-xs font-medium text-slate-400 truncate opacity-60 font-sans tracking-normal">{stock.name}</span>
          </h3>
        </div>
        <div className="text-right">
          <div className={`text-xl font-black tabular-nums tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{stock.gainPercentage.toFixed(2)}%
          </div>
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5 opacity-80">7D Expected</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="border-r border-white/10 pr-2">
          <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
            <i className="fa-solid fa-circle-dot text-[7px] text-blue-500"></i> Market
          </div>
          <div className="text-lg font-black text-white leading-none tabular-nums font-mono tracking-tighter">
            ${stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[8px] text-slate-500 mt-2 leading-none font-bold uppercase truncate">
            {stock.currentPriceDate}
          </p>
        </div>
        <div className="pl-2">
          <div className="text-[9px] text-emerald-500 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
            <i className="fa-solid fa-bullseye text-[7px] text-emerald-500"></i> Target
          </div>
          <div className="text-lg font-black text-emerald-400 leading-none tabular-nums font-mono tracking-tighter">
            ${stock.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[8px] text-slate-500 mt-2 leading-none font-bold uppercase truncate">
            {stock.targetPriceDate}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden bg-white/5 p-3.5 rounded-2xl border border-white/5">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50"></div>
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em] block mb-1.5">Market Analysis</span>
        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
          {stock.reason}
        </p>
      </div>
    </div>
  );
};
