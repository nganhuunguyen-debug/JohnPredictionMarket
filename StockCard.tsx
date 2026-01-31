
import React from 'react';
import { Stock } from './types';

interface StockCardProps {
  stock: Stock;
  index: number;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, index }) => {
  const isPositive = stock.gainPercentage > 0;

  return (
    <div className="stock-card p-4 rounded-2xl mb-4 transition-all active:scale-[0.98]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded">
            #{index + 1} {stock.sector}
          </span>
          <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            {stock.symbol}
            <span className="text-xs font-medium text-slate-400 truncate max-w-[140px]">{stock.name}</span>
          </h3>
        </div>
        <div className="text-right">
          <div className={`text-lg font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{stock.gainPercentage.toFixed(2)}%
          </div>
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">7D Forecast</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-900/60 rounded-xl border border-white/5">
        <div className="border-r border-white/5 pr-2">
          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
            <i className="fa-solid fa-clock text-[8px]"></i> Market Price
          </div>
          <div className="text-lg font-mono text-white leading-none">${stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-[9px] text-slate-400 mt-1.5 opacity-70 leading-tight">As of {stock.currentPriceDate}</div>
        </div>
        <div className="pl-2">
          <div className="text-[9px] text-emerald-500/80 uppercase font-bold mb-1 flex items-center gap-1">
            <i className="fa-solid fa-bullseye text-[8px]"></i> Target Price
          </div>
          <div className="text-lg font-mono text-emerald-400 leading-none">${stock.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-[9px] text-slate-400 mt-1.5 opacity-70 leading-tight">By {stock.targetPriceDate}</div>
        </div>
      </div>

      <div className="text-xs text-slate-300 leading-relaxed bg-white/5 p-2 rounded-lg border-l-2 border-emerald-500/50">
        <span className="font-bold text-emerald-500 uppercase text-[9px] block mb-0.5">Analysis:</span>
        {stock.reason}
      </div>
    </div>
  );
};
