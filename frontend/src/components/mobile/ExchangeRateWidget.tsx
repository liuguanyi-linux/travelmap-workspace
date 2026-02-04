import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ExchangeRateWidget() {
  const { t } = useLanguage();
  const [rate, setRate] = useState<number>(192.50); // Default fallback
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRate = async (force: boolean = false) => {
    setLoading(true);
    try {
      // 1. Load cache first for immediate display
      const cachedData = localStorage.getItem('cny_krw_rate');
      if (cachedData) {
        const { rate: cachedRate, timestamp } = JSON.parse(cachedData);
        setRate(cachedRate);
        setLastUpdated(new Date(timestamp).toLocaleTimeString());
        
        // If cache is fresh (< 1 min) and not forced, stop here
        if (!force && Date.now() - timestamp < 60000) {
          setLoading(false);
          return;
        }
      }

      // 2. Fetch fresh data
      const response = await fetch(`https://open.er-api.com/v6/latest/CNY?t=${Date.now()}`);
      const data = await response.json();
      
      if (data && data.rates && data.rates.KRW) {
        const newRate = data.rates.KRW;
        setRate(newRate);
        const now = Date.now();
        setLastUpdated(new Date(now).toLocaleTimeString());
        localStorage.setItem('cny_krw_rate', JSON.stringify({
          rate: newRate,
          timestamp: now
        }));
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRate();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div 
        onClick={() => fetchRate(true)}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 flex flex-col items-center gap-1 w-32 cursor-pointer hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
      >
        {loading && (
           <div className="absolute inset-0 bg-white/50 dark:bg-black/20 z-10 flex items-center justify-center">
             <RefreshCw size={20} className="animate-spin text-purple-600 dark:text-purple-400" />
           </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 w-full px-1">
          <ArrowRightLeft size={12} />
          <span>汇率</span>
        </div>
        
        <div className="flex flex-col items-center w-full">
          <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
            1 <span className="text-xs font-normal text-gray-500">CNY</span>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-1"></div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 leading-tight">
            {rate.toFixed(2)} <span className="text-xs font-normal text-gray-500">KRW</span>
          </div>
        </div>
        
        {lastUpdated && (
            <div className="text-[10px] text-gray-400 scale-90 mt-0.5 whitespace-nowrap">
                更新于 {lastUpdated}
            </div>
        )}
      </div>
    </div>
  );
}
