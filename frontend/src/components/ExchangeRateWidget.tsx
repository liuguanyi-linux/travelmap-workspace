import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

export default function ExchangeRateWidget() {
  const [rate, setRate] = useState(191.50); // Initial mock rate KRW -> CNY (1 CNY = ~191 KRW)
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setRate(prev => {
        const change = (Math.random() - 0.5) * 0.2;
        const newRate = prev + change;
        setTrend(change > 0 ? 'up' : 'down');
        return Number(newRate.toFixed(2));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-24 right-5 z-20 flex flex-col gap-2 items-end pointer-events-none">
      {/* Exchange Rate Card */}
      <div className="glass-panel p-3 rounded-xl shadow-lg border border-cyan-500/20 backdrop-blur-md bg-slate-900/80 w-40 animate-in slide-in-from-right duration-700 pointer-events-auto">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KRW/CNY</span>
          <RefreshCw size={10} className="text-cyan-500/70 animate-spin-slow" />
        </div>
        
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-cyan-100 tracking-tight">₩{rate}</span>
        </div>

        <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend === 'up' ? '+' : ''}{(Math.random() * 0.5).toFixed(2)}%</span>
        </div>
      </div>
      
      {/* Target Audience Badge */}
      <div className="glass-panel py-1.5 px-2.5 rounded-lg shadow-md border border-purple-500/20 backdrop-blur-md bg-purple-900/60 flex items-center gap-1.5 animate-in slide-in-from-right duration-700 delay-100 pointer-events-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
        <span className="text-[10px] font-bold text-purple-100 tracking-wide">KR MODE ON</span>
      </div>
    </div>
  );
}
