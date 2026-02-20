import React from 'react';
import { Banknote } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AtmWidgetProps {
  onSelect: () => void;
  isActive?: boolean;
}

export default function AtmWidget({ onSelect, isActive = false }: AtmWidgetProps) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onSelect}
      className={`${
        isActive 
          ? 'bg-purple-600 text-white ring-2 ring-purple-300 ring-offset-2 dark:ring-offset-gray-900' 
          : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white hover:scale-105'
      } backdrop-blur-md w-14 h-14 rounded-full shadow-lg border border-white/20 dark:border-gray-700/30 flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition-all animate-in fade-in slide-in-from-right-4 duration-500 delay-100`}
    >
      <Banknote size={20} />
      <span className="text-[10px] font-bold leading-none">ATM</span>
    </button>
  );
}
