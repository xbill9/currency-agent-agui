import React from "react";

export function ExchangeRateCard({
  currencyFrom,
  currencyTo,
  rate,
  date,
  themeColor,
}: {
  currencyFrom: string;
  currencyTo: string;
  rate?: number;
  date?: string;
  themeColor: string;
}) {
  const handleSwap = () => {
    const event = new CustomEvent("a2ui-action", {
      detail: {
        name: "convert",
        params: { amount: 1, from: currencyTo, to: currencyFrom }
      }
    });
    window.dispatchEvent(event);
  };

  const handleTrend = () => {
    const event = new CustomEvent("a2ui-action", {
      detail: {
        name: "show_trends",
        params: { from: currencyFrom, to: currencyTo }
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div
      style={{
        borderLeft: `4px solid ${themeColor}`,
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`
      }}
      className="rounded-2xl mt-6 mb-4 max-w-md w-full bg-slate-800/90 border border-slate-700/80 overflow-hidden text-white backdrop-blur-md animate-fade-in opacity-0"
    >
      <div className="bg-slate-950/40 p-5 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Exchange Rate
            </span>
            <p className="text-slate-400 text-[10px] mt-1.5 font-medium tracking-wide">
              Frankfurter API • {date || new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">💵</div>
        </div>

        {/* Conversion display */}
        <div className="mt-5 flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-700/30 shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Source</span>
            <span className="text-xl font-extrabold text-white mt-0.5">
              {currencyFrom}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-xs text-slate-400 font-bold shadow-md">
            ➔
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {currencyTo}
            </span>
          </div>
        </div>

        {/* Big Rate Numbers */}
        <div className="mt-5 flex items-baseline justify-between border-b border-slate-700/40 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Exchange Rate</span>
            <span className="text-4xl font-black text-white tracking-tighter mt-1">
              {rate ? rate.toFixed(4) : "—"}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-900/40 px-2.5 py-1 rounded-md border border-slate-700/20">
            1 {currencyFrom} = {rate ? rate.toFixed(4) : "?"} {currencyTo}
          </div>
        </div>

        {/* Quick actions row */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleSwap}
            className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all duration-200 border border-slate-700/60 hover:bg-slate-700/50 text-slate-300 cursor-pointer"
          >
            🔄 Reverse
          </button>
          <button
            onClick={handleTrend}
            className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all duration-200 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer"
          >
            📈 View Trends
          </button>
        </div>
      </div>
    </div>
  );
}
